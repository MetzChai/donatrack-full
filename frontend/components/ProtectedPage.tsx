"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "CREATOR" | "ADMIN";
}

export default function ProtectedPage({ children, requiredRole }: ProtectedPageProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect if role doesn't match
        router.push("/");
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

