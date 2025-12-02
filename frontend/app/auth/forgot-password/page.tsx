"use client";

import { useState } from "react";
import Link from "next/link";
import GuestPage from "../../../components/GuestPage";
import { forgotPassword } from "../../../lib/api";

function ForgotPasswordPageContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await forgotPassword(email);
      setMessage("If that email exists, a password reset link has been sent to your email.");
      setEmail("");
    } catch (err: any) {
      setError(err.error || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Forgot your password?</h1>
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </Link>
        </div>

        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ✉️
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <GuestPage>
      <ForgotPasswordPageContent />
    </GuestPage>
  );
}

