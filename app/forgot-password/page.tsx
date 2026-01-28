'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResetUrl(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset instructions sent! Check your email.');

        // In development, show the reset URL
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }

        setEmail('');
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-6 py-4 border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xl font-pixel uppercase">Forgot Password</h1>
          </div>
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
            Enter your email to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-pixel text-retro-black dark:text-retro-white mb-2 uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-gray-dark text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:border-retro-blue"
                placeholder="trainer@pokemon.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-retro-blue text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-pixel uppercase">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </span>
            </button>
          </form>

          {/* Development: Show reset URL */}
          {resetUrl && (
            <div className="mt-4 p-3 bg-retro-yellow border-2 border-retro-black">
              <p className="text-xs font-pixel text-retro-black mb-2 uppercase">
                Development Mode - Reset Link:
              </p>
              <Link
                href={resetUrl.replace(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005', '')}
                className="text-xs font-pixel text-retro-blue hover:underline break-all"
              >
                Click here to reset password
              </Link>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-retro-blue hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Back Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-4 py-2 text-xs font-pixel uppercase text-retro-gray dark:text-retro-gray-light hover:text-retro-black dark:hover:text-retro-white border-2 border-retro-black hover:shadow-pixel transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
