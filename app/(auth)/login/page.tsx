"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { getSession, signIn } from "next-auth/react";

import { getDashboardPathByRole } from "@/src/lib/auth-redirect";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDisabled = useMemo(() => loading || !email || !password, [email, loading, password]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch the session to read role for redirect
    const session = await getSession();
    // Respect callbackUrl from middleware only if it's a relative path and role matches
    const roleDashboard = getDashboardPathByRole(session?.user?.role);
    const destination = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : roleDashboard;

    router.replace(destination);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-md shadow-blue-600/30">
          🏢
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">SocietyPro</h1>
          <p className="text-xs text-slate-500">Society Management Platform</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-500">Sign in to continue managing your community.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2 disabled:opacity-60"
            disabled={loading}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-14 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2 disabled:opacity-60"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-700 hover:text-blue-900"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-blue-700 hover:text-blue-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <span className="text-red-500 flex-shrink-0">⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to SocietyPro?{" "}
        <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

// Suspense boundary required because useSearchParams() suspends
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
