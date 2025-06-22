"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 32 }}>
      <h2>Dashboard</h2>
      <p>Welcome! You are logged in.</p>
    </div>
  );
} 