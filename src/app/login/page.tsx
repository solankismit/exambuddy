"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";

/**
 * Login Page
 * Simple, scalable structure that supports future enhancements:
 * - Forgot password
 * - OTP-based login
 * - Social login
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
        {/* Future: Add ForgotPasswordForm, OTPForm, SocialLoginButtons here */}
      </div>
    </div>
  );
}

