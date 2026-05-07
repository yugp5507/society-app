import Sidebar from "@/src/components/Sidebar";

export default function ResidentVehiclesPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[250px_1fr]">
        <Sidebar variant="resident" />
        <main className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-lg">
            <h1 className="text-2xl font-bold text-[#1e3a5f]">My Vehicles</h1>
            <p className="mt-1 text-sm text-slate-600">Coming soon. You’ll be able to manage vehicles here.</p>
          </section>
        </main>
      </div>
    </div>
  );
}

