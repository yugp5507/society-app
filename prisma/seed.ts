/**
 * prisma/seed.ts
 * Run with: npx prisma db seed
 *
 * Creates Super Admin, Society Admin, and Resident users.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = "postgresql://postgres:8866@localhost:5432/society_db";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "Admin@123";

async function seedUser(data: {
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "SOCIETY_ADMIN" | "RESIDENT";
}) {
  const hashed = await hash(PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone,
      password: hashed,
      role: data.role,
    },
    create: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashed,
      role: data.role,
    },
  });
  console.log(`✅ ${data.role}: ${user.name} <${user.email}>`);
  return user;
}

async function main() {
  console.log("🌱 Seeding SocietyPro database...\n");

  await seedUser({
    name: "Super Admin",
    email: "superadmin@societypro.com",
    phone: "9999999999",
    role: "SUPER_ADMIN",
  });

  await seedUser({
    name: "Society Admin",
    email: "admin@societypro.com",
    phone: "8888888888",
    role: "SOCIETY_ADMIN",
  });

  await seedUser({
    name: "Test Resident",
    email: "resident@societypro.com",
    phone: "7777777777",
    role: "RESIDENT",
  });

  console.log("\n🔑 All users use password: Admin@123");
  console.log("✨ Seed complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
