import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import {
  Building2,
  Home,
  Users,
  MessageSquareWarning,
  DoorOpen,
  Megaphone,
} from "lucide-react";

export default async function SubAdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUB_ADMIN") {
    redirect("/login");
  }

  // Fetch buildings managed by this sub admin
  const buildings = await prisma.building.findMany({
    where: { subAdminId: session.user.id },
    include: {
      apartments: {
        include: {
          familyMembers: true,
          vehicles: true,
        },
      },
    },
  });

  const buildingIds = buildings.map((b) => b.id);

  // Stats calculation
  const totalApartments = buildings.reduce((acc, b) => acc + b.apartments.length, 0);
  const occupiedApartments = buildings.reduce(
    (acc, b) => acc + b.apartments.filter((a) => a.residentId !== null).length,
    0
  );
  
  // Aggregate residents and family members
  let totalResidentsAndFamily = 0;
  buildings.forEach((b) => {
    b.apartments.forEach((a) => {
      if (a.residentId) totalResidentsAndFamily += 1;
      totalResidentsAndFamily += a.familyMembers.length;
    });
  });

  return (
    
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {session.user.name}</h1>
        <p className="text-sm text-slate-500 mt-1">
          You are managing {buildings.length} building{buildings.length !== 1 && "s"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Buildings Stat */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Buildings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{buildings.length}</p>
          </div>
        </div>

        {/* Apartments Stat */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Apartments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalApartments}</p>
            <p className="text-xs text-slate-400 mt-1">{occupiedApartments} Occupied</p>
          </div>
        </div>

        {/* Residents Stat */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total People</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalResidentsAndFamily}</p>
            <p className="text-xs text-slate-400 mt-1">Residents & Family</p>
          </div>
        </div>

        {/* Action Needed Stat */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Complaints</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">-</p>
            <p className="text-xs text-slate-400 mt-1">Requires Attention</p>
          </div>
        </div>
      </div>

      {/* Buildings List Preview */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            Assigned Buildings
          </h2>
        </div>
        <div className="p-6">
          {buildings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No buildings assigned yet.</p>
              <p className="text-sm text-slate-400 mt-1">Please contact your Society Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildings.map((building) => (
                <div key={building.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-lg">{building.name}</h3>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">Building</span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Apartments</span>
                      <span className="font-semibold">{building.apartments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occupied</span>
                      <span className="font-semibold">{building.apartments.filter((a) => a.residentId).length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
