
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { AppointmentStatus, UserRole } from "@prisma/client";

const createAppointmentSchema = z.object({
  doctorId: z.string(),
  appointmentDate: z.string().transform((str) => new Date(str)),
  duration: z.coerce.number().positive(),
  reasonForVisit: z.string().nonempty(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== UserRole.PATIENT) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const validation = createAppointmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(validation.error.message, { status: 400 });
    }

    const { doctorId, appointmentDate, duration, reasonForVisit } = validation.data;

    const patientProfile = await db.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!patientProfile) {
      return new NextResponse("Patient profile not found", { status: 404 });
    }

    const doctorProfile = await db.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      return new NextResponse("Doctor profile not found for the selected doctor", { status: 404 });
    }

    const newAppointment = await db.appointment.create({
      data: {
        patientId: patientProfile.id,
        doctorId: doctorProfile.id,
        appointmentDate,
        duration,
        reasonForVisit,
        status: AppointmentStatus.PENDING,
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Appointment creation error:", error);
    return new NextResponse("Failed to create appointment", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const { id: userId, role } = session.user;
    let whereClause: any = {};
    let includeClause: any = {};

    if (role === UserRole.PATIENT) {
      const patientProfile = await db.patientProfile.findUnique({
        where: { userId },
      });
      if (!patientProfile) {
        return new NextResponse("Patient profile not found", { status: 404 });
      }
      whereClause.patientId = patientProfile.id;
      includeClause = {
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      };
    } else if (role === UserRole.DOCTOR) {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId },
      });
      if (!doctorProfile) {
        return new NextResponse("Doctor profile not found", { status: 404 });
      }
      whereClause.doctorId = doctorProfile.id;
      includeClause = {
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      };
    } else {
      return new NextResponse("Invalid user role", { status: 403 });
    }

    if (startDate && endDate) {
      whereClause.appointmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const appointments = await db.appointment.findMany({
      where: whereClause,
      include: includeClause,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return new NextResponse("Failed to fetch appointments", { status: 500 });
  }
}
