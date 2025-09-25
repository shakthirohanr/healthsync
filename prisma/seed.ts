import { PrismaClient, UserRole, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  await prisma.appointment.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.patientProfile.deleteMany({});
  await prisma.doctorProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Existing data cleared.");

  console.log("Start seeding ...");

  const password = await bcrypt.hash("password123", 10);

  const drSmith = await prisma.user.create({
    data: {
      name: "Dr. John Smith",
      email: "dr.smith@healthsync.com",
      password: password,
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          specialty: "Cardiology",
          credentials: "MD, FACC",
        },
      },
    },
  });

  const drJones = await prisma.user.create({
    data: {
      name: "Dr. Alice Jones",
      email: "dr.jones@healthsync.com",
      password: password,
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          specialty: "Pediatrics",
          credentials: "MD, FAAP",
        },
      },
    },
  });

  console.log(`Created doctors: ${drSmith.name}, ${drJones.name}`);

  const doctors = await prisma.doctorProfile.findMany();
  if (doctors.length === 0) {
    throw new Error("No doctors found to assign to patients.");
  }

  const patientData = [
    {
      name: "Charlie Brown",
      email: "charlie.brown@example.com",
      password: "password123",
    },
    {
      name: "Lucy van Pelt",
      email: "lucy.vanpelt@example.com",
      password: "password123",
    },
    {
      name: "Linus van Pelt",
      email: "linus.vanpelt@example.com",
      password: "password123",
    },
  ];

  console.log("Creating patients...");
  for (let i = 0; i < patientData.length; i++) {
    const patient = patientData[i];
    if (!patient) continue;
    const hashedPassword = await bcrypt.hash(patient.password, 10);
    const doctor = doctors[i % doctors.length];
    if (!doctor) continue; // FIX: Ensures doctor is not undefined

    const newPatientUser = await prisma.user.create({
      data: {
        name: patient.name,
        email: patient.email,
        password: hashedPassword,
        role: UserRole.PATIENT,
        patientProfile: {
          create: {
            address: `${123 + i} Main St, Anytown, USA`,
            dateOfBirth: new Date(1990 + i, i, 1),
          },
        },
      },
      include: {
        patientProfile: true,
      },
    });

    if (newPatientUser.patientProfile) {
      // Create a completed appointment
      await prisma.appointment.create({
        data: {
          patientId: newPatientUser.patientProfile.id,
          doctorId: doctor.id,
          appointmentDate: new Date(new Date().setDate(new Date().getDate() - 7)),
          duration: 30,
          reasonForVisit: "Annual Check-up",
          status: AppointmentStatus.COMPLETED,
        },
      });

      // Create an upcoming appointment
      await prisma.appointment.create({
        data: {
          patientId: newPatientUser.patientProfile.id,
          doctorId: doctor.id,
          appointmentDate: new Date(new Date().setDate(new Date().getDate() + 14)),
          duration: 45,
          reasonForVisit: "Follow-up Consultation",
          status: AppointmentStatus.SCHEDULED,
        },
      });

      // Create a medical record
      await prisma.medicalRecord.create({
        data: {
          patientId: newPatientUser.patientProfile.id,
          doctorId: doctor.id,
          visitDate: new Date(new Date().setDate(new Date().getDate() - 7)),
          diagnosis: "Healthy",
          treatmentPlan: "Continue healthy lifestyle",
        },
      });

      // Create a prescription
      await prisma.prescription.create({
        data: {
          patientId: newPatientUser.patientProfile.id,
          doctorId: doctor.id,
          medication: "Vitamin D",
          dosage: "1000 IU",
          frequency: "Once daily",
          startDate: new Date(),
        },
      });
    }
  }
  console.log(`${patientData.length} patients created with related data.`);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });