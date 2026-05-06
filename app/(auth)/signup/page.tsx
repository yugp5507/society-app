"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSession, signIn } from "next-auth/react";

import { getDashboardPathByRole } from "@/src/lib/auth-redirect";

type SignupRole = "RESIDENT" | "SOCIETY_ADMIN";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("RESIDENT");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isResident = role === "RESIDENT";
  const isDisabled = useMemo(() => {
    if (loading || !name || !email || !phone || !password || !confirmPassword) return true;
    if (isResident && (!buildingNumber || !apartmentNumber)) return true;
    return false;
  }, [apartmentNumber, buildingNumber, confirmPassword, email, isResident, loading, name, password, phone]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        confirmPassword,
        role,
        buildingNumber: isResident ? buildingNumber : undefined,
        apartmentNumber: isResident ? apartmentNumber : undefined,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Could not create your account");
      setLoading(false);
      return;
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!loginResult || loginResult.error) {
      setError("Account created. Please login manually.");
      router.push("/login");
      return;
    }

    const session = await getSession();
    router.replace(getDashboardPathByRole(session?.user?.role));
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Join SocietyPro to manage your society with ease.
      </p>

      <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as SignupRole)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
          >
            <option value="RESIDENT">Resident</option>
            <option value="SOCIETY_ADMIN">Society Admin</option>
          </select>
        </div>

        {isResident ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="buildingNumber">
                Building Number
              </label>
              <input
                id="buildingNumber"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                placeholder="A / B / Tower 1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
                required={isResident}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="apartmentNumber">
                Apartment Number
              </label>
              <input
                id="apartmentNumber"
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                placeholder="203 / B-502"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
                required={isResident}
              />
            </div>
          </>
        ) : null}

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-14 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-14 text-slate-900 outline-none ring-blue-600 transition focus:border-blue-600 focus:ring-2"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isDisabled}
          className="sm:col-span-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-900 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-900">
          Login
        </Link>
      </p>
    </div>
  );
}
