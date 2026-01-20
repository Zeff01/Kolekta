'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
            <h1 className="text-xl font-pixel uppercase">Become a Trainer</h1>
          </div>
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
            Start your collection journey!
          </p>
        </div>

        {/* Signup Form */}
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

            {/* Username */}
            <div>
              <label className="block text-xs font-pixel text-retro-black dark:text-retro-white mb-2 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                className="w-full px-3 py-2 border-2 border-retro-black bg-retro-white dark:bg-retro-gray-dark text-retro-black dark:text-retro-white font-pixel text-xs focus:outline-none focus:border-retro-blue"
                placeholder="ash_ketchum"
              />
              <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mt-1">
                3-20 characters
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-pixel text-retro-black dark:text-retro-white mb-2 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="text-[8px] font-pixel text-retro-gray dark:text-retro-gray-light mt-1">
                At least 6 characters
              </p>
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

            {/* Error Message */}
            {error && (
              <div className="bg-retro-red border-2 border-retro-black p-3">
                <p className="text-xs font-pixel text-retro-white">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-green-500 text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-pixel uppercase">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
              Already have an account?{' '}
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
