import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('[Forgot Password] Starting request...');

    await connectToDatabase();
    console.log('[Forgot Password] Database connected');

    const { email } = await request.json();
    console.log('[Forgot Password] Email received:', email);

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('[Forgot Password] Looking for user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('[Forgot Password] User found:', !!user);

    // Always return success to prevent email enumeration attacks
    if (!user) {
      console.log('[Forgot Password] No user found, returning generic message');
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link will be sent.',
      });
    }

    // Generate secure random token
    console.log('[Forgot Password] Generating token...');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Delete any existing reset tokens for this user
    console.log('[Forgot Password] Deleting old tokens...');
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create new reset token
    console.log('[Forgot Password] Creating new token...');
    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // In production, you would send an email here with the reset link
    // For now, we'll return the token in the response for testing
    // TODO: Implement email service
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/reset-password?token=${resetToken}`;

    console.log(`[Forgot Password] Password reset requested for ${email}`);
    console.log(`[Forgot Password] Reset URL: ${resetUrl}`);

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link will be sent.',
      // Always return URL until email service is configured
      resetUrl,
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    console.error('[Forgot Password] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
