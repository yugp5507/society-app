/**
 * prisma/seed.ts
 * Run with:  npx tsx prisma/seed.ts
 *            or via   npm run db:seed
 *
 * Creates the Super Admin user if it doesn't already exist.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = "postgresql://postgres:8866@localhost:5432/society_db";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "superadmin@societypro.com";
  const plainPassword = "admin@123";

  console.log("🌱 Starting seed...");

  const hashedPassword = await hash(plainPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Super Admin seeded successfully!");
  console.log(`   Name  : ${superAdmin.name}`);
  console.log(`   Email : ${superAdmin.email}`);
  console.log(`   Role  : ${superAdmin.role}`);
  console.log(`   ID    : ${superAdmin.id}`);
  console.log("\n🔑 Login credentials:");
  console.log(`   Email   : ${email}`);
  console.log(`   Password: ${plainPassword}`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
