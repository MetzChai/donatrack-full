"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-4 py-3">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              <span className="text-red-500">●</span>
              <span className="text-orange-400">●</span>
              <span className="text-green-500">●</span>
            </span>
            {user && <span className="font-semibold">My Dashboard</span>}
          </div>
          <div className="font-bold text-xl">DONATRACK</div>
        </div>

        {/* Navigation Bar */}
        {user && (
          <>
            <div className="flex justify-between items-center border-t border-purple-800 pt-2">
              <nav className="flex space-x-6 text-xl font-medium">
                <Link
                  href="/"
                  className={`pb-1 ${
                    isActive("/")
                      ? "border-b-2 border-green-500 text-white"
                      : "hover:text-gray-300"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/donate-history"
                  className={`pb-1 ${
                    isActive("/donate-history")
                      ? "border-b-2 border-green-500 text-white"
                      : "hover:text-gray-300"
                  }`}
                >
                  Donations
                </Link>
                <Link
                  href="/campaigns/ended"
                  className={`pb-1 ${
                    isActive("/campaigns/ended")
                      ? "border-b-2 border-green-500 text-white"
                      : "hover:text-gray-300"
                  }`}
                >
                  Campaign History
                </Link>
                <Link
                  href="/transparency"
                  className={`pb-1 ${
                    isActive("/transparency")
                      ? "border-b-2 border-green-500 text-white"
                      : "hover:text-gray-300"
                  }`}
                >
                  Transparency
                </Link>
                {user && (
                  <Link
                    href="/withdrawals"
                    className={`pb-1 ${
                      isActive("/withdrawals")
                        ? "border-b-2 border-green-500 text-white"
                        : "hover:text-gray-300"
                    }`}
                  >
                    Withdrawals
                  </Link>
                )}
                <Link
                  href="/about"
                  className={`pb-1 ${
                    isActive("/about")
                      ? "border-b-2 border-green-500 text-white"
                      : "hover:text-gray-300"
                  }`}
                >
                  About Us
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/user"}
                  className="flex items-center gap-2 hover:text-gray-300"
                >
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm">{user.fullName || user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
                >
                  Log Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* For non-authenticated users */}
        {!user && (
          <div className="flex justify-end">
            <Link href="/auth/login" className="text-sm hover:text-gray-300">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
