"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import GuestPage from "../../../components/GuestPage";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, refreshUser } = useAuth();

  useEffect(() => {
    const googleToken = searchParams.get("token");
    const googleUser = searchParams.get("user");

    if (googleToken && googleUser) {
      try {
        const decodedUser = JSON.parse(atob(googleUser));
        
        // Save to localStorage first
        if (typeof window !== "undefined") {
          localStorage.setItem("token", googleToken);
          localStorage.setItem("user", JSON.stringify(decodedUser));
        }
        
        // Update context
        login(googleToken, decodedUser);
        
        // Wait for state to update, then redirect using Next.js router
        setTimeout(() => {
          const redirectPath = decodedUser.role === "ADMIN" ? "/admin" : "/";
          router.replace(redirectPath);
        }, 150);
      } catch (err) {
        console.error("Failed to parse Google user payload", err);
        setError("Failed to authenticate with Google");
      }
    }
  }, [router, searchParams, login]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await loginUser({ email, password });
      
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
      
      // Redirect based on user role using Next.js router
      const redirectPath = user.role === "ADMIN" ? "/admin" : "/";
      router.replace(redirectPath);
      
      // Don't call refreshUser immediately - let it happen naturally on the next page
    } catch (err: any) {
      setError(err.error || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Log in to track your impact</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Forgot your password?
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
              window.location.href = `${baseUrl}/api/auth/v1/google`;
            }}
            className="w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <span className="text-2xl font-bold text-blue-600">G</span>
            <span className="text-gray-700">Continue with Google</span>
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <GuestPage>
      <LoginPageContent />
    </GuestPage>
  );
}
