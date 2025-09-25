
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { AppointmentStatus, UserRole } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: userId, role } = session.user;

    if (role === UserRole.PATIENT) {
      const patientProfile = await db.patientProfile.findUnique({
        where: { userId },
      });

      if (!patientProfile) {
        return new NextResponse("Patient profile not found", { status: 404 });
      }

      const now = new Date();

      const upcomingAppointments = await db.appointment.findMany({
        where: {
          patientId: patientProfile.id,
          appointmentDate: { gte: now },
        },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });

      const recentVisits = await db.appointment.findMany({
        where: {
          patientId: patientProfile.id,
          status: AppointmentStatus.COMPLETED,
          appointmentDate: { lt: now },
        },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "desc",
        },
        take: 5,
      });

      const activePrescriptions = await db.prescription.findMany({
        where: {
          patientId: patientProfile.id,
          endDate: { gte: now },
        },
        include: {
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      });

      return NextResponse.json({
        upcomingAppointments,
        recentVisits,
        activePrescriptions,
      });
    } else if (role === UserRole.DOCTOR) {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctorProfile) {
        return new NextResponse("Doctor profile not found", { status: 404 });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySchedule = await db.appointment.findMany({
        where: {
          doctorId: doctorProfile.id,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          patient: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: {
          appointmentDate: "asc",
        },
      });

      const recentPatientIds = await db.appointment.findMany({
        where: {
          doctorId: doctorProfile.id,
          status: AppointmentStatus.COMPLETED,
        },
        select: { patientId: true },
        distinct: ["patientId"],
        take: 10,
      });

      const recentPatients = await db.patientProfile.findMany({
        where: {
          id: { in: recentPatientIds.map((p) => p.patientId) },
        },
        include: {
          user: { select: { name: true, image: true } },
        },
      });

      // Mock stats for now
      const stats = {
        totalPatientsToday: todaySchedule.length,
        pendingLabResults: 5, // Mock data
        recordsToReview: 3, // Mock data
      };

      return NextResponse.json({ todaySchedule, recentPatients, stats });
    } else {
      return new NextResponse("Invalid user role", { status: 403 });
    }
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return new NextResponse("Failed to fetch dashboard data", { status: 500 });
  }
}
