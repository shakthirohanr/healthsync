"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { User, Search, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/lib/AuthContext";
import { API_URL, getAuthHeader } from "~/lib/auth";
import { format } from "date-fns";

const fetcher = (url: string) =>
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() }).then((res) =>
    res.json()
  );

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch dashboard data which includes patients
  const { data, error, isLoading } = useSWR(
    user?.role === "DOCTOR" ? "/me/dashboard" : null,
    fetcher
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-20 w-full" />
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
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

  // Only doctors can access this page
  if (user.role !== "DOCTOR") {
    router.push("/dashboard");
    return null;
  }

  const userName = user.name ?? "User";
  const userType = "doctor";

  // Get patients from dashboard data
  const patients = data?.patients || [];
  
  // Also get all appointments to find last visit and upcoming appointments
  const allAppointments = data?.allAppointments || [];

  const filteredPatients = patients.filter(
    (patient: any) =>
      patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage your patient records</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient: any) => {
              // Find appointments for this patient
              const patientAppointments = allAppointments.filter(
                (appt: any) => appt.patient && appt.patient.id === patient.id
              );
              
              // Find last completed appointment
              const now = new Date();
              const pastAppointments = patientAppointments.filter(
                (appt: any) => new Date(appt.appointmentDate) < now
              );
              const lastVisit = pastAppointments.length > 0 
                ? pastAppointments.sort((a: any, b: any) => 
                    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
                  )[0]
                : null;
              
              // Find next upcoming appointment
              const futureAppointments = patientAppointments.filter(
                (appt: any) => new Date(appt.appointmentDate) >= now
              );
              const upcomingAppointment = futureAppointments.length > 0
                ? futureAppointments.sort((a: any, b: any) =>
                    new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
                  )[0]
                : null;
              
              return (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{patient.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{patient.user.email}</p>
                          <div className="flex items-center gap-4 mt-3">
                            {lastVisit && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                Last visit: {format(new Date(lastVisit.appointmentDate), "MMM d, yyyy")}
                              </div>
                            )}
                            {upcomingAppointment && (
                              <Badge variant="secondary">
                                Next: {format(new Date(upcomingAppointment.appointmentDate), "MMM d, yyyy")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12">
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No patients found matching your search" : "No patients yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
