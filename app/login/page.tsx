'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
            <h1 className="text-xl font-pixel uppercase">Trainer Login</h1>
          </div>
          <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
            Welcome back, Trainer!
          </p>
        </div>

        {/* Login Form */}
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
              className="w-full px-6 py-3 bg-retro-blue text-retro-white border-3 border-retro-black shadow-pixel hover:shadow-pixel-lg transition-all hover:translate-x-1 hover:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xs font-pixel uppercase">
                {isLoading ? 'Logging in...' : 'Login'}
              </span>
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-xs font-pixel text-retro-gray dark:text-retro-gray-light">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-retro-blue hover:underline"
              >
                Sign up here
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
