
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: UserRole.DOCTOR,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return new NextResponse("Failed to fetch doctors", { status: 500 });
  }
}
