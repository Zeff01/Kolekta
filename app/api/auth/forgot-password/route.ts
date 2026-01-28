import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link will be sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Delete any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Create new reset token
    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // In production, you would send an email here with the reset link
    // For now, we'll return the token in the response for testing
    // TODO: Implement email service
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/reset-password?token=${resetToken}`;

    console.log(`Password reset requested for ${email}`);
    console.log(`Reset URL: ${resetUrl}`);

    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link will be sent.',
      // Remove this in production! Only for testing without email service
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
