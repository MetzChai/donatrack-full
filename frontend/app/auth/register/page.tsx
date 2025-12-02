"use client";

import { useState } from "react";
import { registerUser } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GuestPage from "../../../components/GuestPage";

function RegisterPageContent() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, refreshUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await registerUser({ fullName, email, password });
      
      // Verify token and user are received
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }
      
      // Set token and user in localStorage first - do this synchronously
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      // Update context state
      login(token, user);
      
      // Verify token was saved
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!savedToken) {
        console.error("Token was not saved to localStorage");
        throw new Error("Failed to save authentication token");
      }
      
      // Wait a bit for state to propagate
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // New users are always USER role, redirect to home
      router.replace("/");
    } catch (err: any) {
      setError(err.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Sign up</h1>
        <p className="text-gray-600 mb-6">Create your account</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-green-600 hover:text-green-800 font-semibold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <GuestPage>
      <RegisterPageContent />
    </GuestPage>
  );
}
