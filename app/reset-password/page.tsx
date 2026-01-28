'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid reset link');
      router.push('/login');
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-retro-white dark:bg-retro-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-retro-black dark:bg-retro-white text-retro-white dark:text-retro-black px-6 py-4 border-3 border-retro-black shadow-pixel mb-6 inline-block">
            <h1 className="text-xl font-pixel uppercase">Reset Password</h1>
          </div>
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
            Enter your new password
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-retro-white dark:bg-retro-black border-3 border-retro-black shadow-pixel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-pixel text-retro-black dark:text-retro-white mb-2 uppercase">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border-2 border-retro-black bg-retro-white dark:bg-retro-gray-dark text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:border-retro-blue"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-retro-gray dark:text-retro-gray-light hover:text-retro-black dark:hover:text-retro-white"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-pixel text-retro-black dark:text-retro-white mb-2 uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border-2 border-retro-black bg-retro-white dark:bg-retro-gray-dark text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:border-retro-blue"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-retro-gray dark:text-retro-gray-light hover:text-retro-black dark:hover:text-retro-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-retro-gray-light dark:bg-retro-gray-dark border-2 border-retro-black p-3">
              <p className="text-xs font-pixel text-retro-black dark:text-retro-white">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-retro-blue text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-pixel uppercase">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </span>
            </button>
          </form>

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
