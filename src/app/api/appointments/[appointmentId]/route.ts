
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { AppointmentStatus, UserRole } from "@prisma/client";

const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
});

async function getProfileIds(userId: string, role: UserRole) {
  if (role === UserRole.PATIENT) {
    const profile = await db.patientProfile.findUnique({ where: { userId } });
    return { patientId: profile?.id, doctorId: null };
  }
  if (role === UserRole.DOCTOR) {
    const profile = await db.doctorProfile.findUnique({ where: { userId } });
    return { patientId: null, doctorId: profile?.id };
  }
  return { patientId: null, doctorId: null };
}

export async function GET(
  request: Request,
  { params }: { params: { appointmentId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: params.appointmentId },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const { patientId, doctorId } = await getProfileIds(
      session.user.id,
      session.user.role as UserRole,
    );

    if (
      (session.user.role === UserRole.PATIENT && appointment.patientId !== patientId) ||
      (session.user.role === UserRole.DOCTOR && appointment.doctorId !== doctorId)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    return new NextResponse("Failed to get appointment", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { appointmentId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = updateAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: params.appointmentId },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const { patientId, doctorId } = await getProfileIds(
      session.user.id,
      session.user.role as UserRole,
    );

    if (
      (session.user.role === UserRole.PATIENT && appointment.patientId !== patientId) ||
      (session.user.role === UserRole.DOCTOR && appointment.doctorId !== doctorId)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedAppointment = await db.appointment.update({
      where: { id: params.appointmentId },
      data: validation.data,
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    return new NextResponse("Failed to update appointment", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { appointmentId: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id: params.appointmentId },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const { patientId, doctorId } = await getProfileIds(
      session.user.id,
      session.user.role as UserRole,
    );

    if (
      (session.user.role === UserRole.PATIENT && appointment.patientId !== patientId) ||
      (session.user.role === UserRole.DOCTOR && appointment.doctorId !== doctorId)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.appointment.delete({ where: { id: params.appointmentId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return new NextResponse("Failed to delete appointment", { status: 500 });
  }
}
