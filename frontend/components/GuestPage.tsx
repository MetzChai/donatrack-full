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
    // Only redirect if not loading, authenticated, and haven't redirected yet
    // Add a small delay to allow login handlers to redirect first
    if (!loading && isAuthenticated && !hasRedirected.current) {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      
      // Wait a bit to let login handlers redirect first
      redirectTimeoutRef.current = setTimeout(() => {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          
          // Redirect based on user role
          if (user?.role === "ADMIN") {
            router.replace("/admin");
          } else {
            router.replace("/");
          }
        }
      }, 200);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated && hasRedirected.current) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

