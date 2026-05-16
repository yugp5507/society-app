import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/src/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.email("Please enter a valid email").trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["RESIDENT", "SOCIETY_ADMIN"]),
    buildingNumber: z.string().trim().optional(),
    apartmentNumber: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (data.role === "RESIDENT") {
      if (!data.buildingNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Building number is required for residents",
          path: ["buildingNumber"],
        });
      }
      if (!data.apartmentNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Apartment number is required for residents",
          path: ["apartmentNumber"],
        });
      }
    }
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().filter(Boolean)[0] ?? "Invalid registration data";

      return NextResponse.json(
        {
          message: firstError,
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role as Role,
      },
      select: { id: true },
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong while creating your account" },
      { status: 500 }
    );
  }
}
