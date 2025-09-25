
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole),
});

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const validation = registerSchema.safeParse(body);

  if (!validation.success) {
    return new NextResponse(validation.error.message, { status: 400 });
  }

  const { name, email, password, role } = validation.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User with this email already exists", {
        status: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === UserRole.PATIENT) {
        await prisma.patientProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      } else if (role === UserRole.DOCTOR) {
        await prisma.doctorProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    const { password: _, ...userWithoutPassword } = user;

    return new NextResponse(JSON.stringify(userWithoutPassword), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("An error occurred during registration", {
      status: 500,
    });
  }
}
