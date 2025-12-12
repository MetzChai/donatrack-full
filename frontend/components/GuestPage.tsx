"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface GuestPageProps {
  children: React.ReactNode;
}

export default function GuestPage({ children }: GuestPageProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRedirected.current) {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;

          if (user?.role === "ADMIN") {
            router.replace("/admin");
          } else if (user?.role === "CREATOR") {
            router.replace("/user");
          } else {
            router.replace("/");
          }
        }
      }, 200);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300">
        <div className="bg-white bg-opacity-80 rounded-xl p-8 flex flex-col items-center shadow-lg">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-800 text-lg font-medium">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && hasRedirected.current) {
    return null;
  }

  return <>{children}</>;
}
