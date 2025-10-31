"use client";

import { useRouter } from "next/navigation";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { FileText, Pill } from "lucide-react";
import useSWR from "swr";
import { format } from "date-fns";
import { useAuth } from "~/lib/AuthContext";
import { API_URL, getAuthHeader } from "~/lib/auth";

const fetcher = (url: string) => 
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() })
    .then(res => res.json());

export default function RecordsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { data, error, isLoading } = useSWR('/me/dashboard', fetcher);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-20 w-full" />
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const userName = user.name ?? "User";
  const userType = user.role === "DOCTOR" ? "doctor" : "patient";

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} notifications={3} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-1">View your medical history and prescriptions</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Failed to load medical records</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Prescriptions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Pill className="h-5 w-5 mr-2 text-medical-primary" />
                  Active Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.activePrescriptions?.length > 0 ? (
                  data.activePrescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="p-4 bg-secondary/50 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{prescription.medication}</p>
                          <p className="text-sm text-muted-foreground mt-1">{prescription.dosage}</p>
                          <p className="text-sm text-muted-foreground">{prescription.frequency}</p>
                        </div>
                        <Badge variant="secondary">{prescription.refillsAvailable} refills</Badge>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>Start: {format(new Date(prescription.startDate), "PP")}</p>
                        <p>End: {format(new Date(prescription.endDate), "PP")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active prescriptions</p>
                )}
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2 text-medical-primary" />
                  Recent Medical History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.pastAppointments?.length > 0 ? (
                  data.pastAppointments.slice(0, 5).map((appointment: any) => (
                    <div key={appointment.id} className="p-4 bg-secondary/50 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{appointment.reasonForVisit}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Dr. {appointment.doctor.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(appointment.appointmentDate), "PPP")}
                          </p>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                      {appointment.notes && (
                        <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No medical history available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
