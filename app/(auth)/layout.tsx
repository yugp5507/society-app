import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full overflow-hidden rounded-2xl border border-blue-100/20 bg-white shadow-2xl lg:grid-cols-2">
          <aside className="hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
                  SP
                </span>
                <span className="text-2xl font-semibold tracking-tight">SocietyPro</span>
              </Link>
              <h2 className="mt-10 text-3xl font-bold leading-tight">
                Smarter living for apartments and rowhouses.
              </h2>
              <p className="mt-4 max-w-md text-blue-100">
                Manage residents, maintenance, visitors, and society operations from one secure
                platform.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-blue-100">
              Built for Indian housing societies with role-based access and secure authentication.
            </div>
          </aside>

          <main className="flex min-h-[620px] flex-col bg-slate-50">
            <div className="border-b border-slate-200 px-6 py-4 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-blue-900">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                  SP
                </span>
                <span className="text-lg font-semibold">SocietyPro</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
