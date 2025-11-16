"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const router = useRouter();
  const token = searchParams?.token;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          return;
        }
        if (data.accessToken) {
          window.localStorage.setItem("b2e_token", data.accessToken);
          if (data.user) {
            window.localStorage.setItem("b2e_role", data.user.role || "customer");
            window.localStorage.setItem("b2e_email", data.user.email || "");
          }
        }
        setStatus("success");
        setMessage("Your email has been verified successfully. Redirecting to your cart...");
        setTimeout(() => {
          router.replace("/cart");
        }, 1500);
      } catch (e: any) {
        setStatus("error");
        setMessage(e.message || "Verification failed.");
      }
    }
    run();
  }, [token]);

  return (
    <div className="max-w-md mx-auto py-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      <p className="text-sm text-neutral-600 mb-4">{message}</p>
      {status === "success" && (
        <p className="text-xs text-neutral-500">You will be redirected to your cart shortly.</p>
      )}
      {status === "error" && (
        <a href="/" className="text-sm text-blue-600 hover:underline">
          Go to homepage
        </a>
      )}
    </div>
  );
}