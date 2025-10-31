// Shared types for client and server
// Mirror Prisma enums without importing @prisma/client

export enum UserRole {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  PENDING = "PENDING",
}
