"use client";

import { useRouter } from "next/navigation";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Calendar, Clock, User, Plus } from "lucide-react";
import useSWR from "swr";
import { format } from "date-fns";
import { useState } from "react";
import { BookAppointmentForm } from "~/components/BookAppointmentForm";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { useAuth } from "~/lib/AuthContext";
import { API_URL, getAuthHeader } from "~/lib/auth";

const fetcher = (url: string) => 
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() })
    .then(res => res.json());

export default function AppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your appointments</p>
          </div>
          {userType === "patient" && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-medical hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <BookAppointmentForm onFormSubmit={() => setIsFormOpen(false)} />
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Failed to load appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-medical-primary" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.upcomingAppointments?.length > 0 ? (
                  <div className="space-y-4">
                    {data.upcomingAppointments.map((appointment: any) => {
                      // For patients: appointment has doctor, for doctors: appointment has patient
                      const otherPerson = userType === "patient" ? appointment.doctor : appointment.patient;
                      const personName = otherPerson?.user?.name || "Unknown";
                      const personDetail = userType === "patient" 
                        ? otherPerson?.specialty 
                        : otherPerson?.user?.email;
                      
                      return (
                        <div key={appointment.id} className="flex items-start justify-between p-4 bg-secondary/50 rounded-lg border">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{personName}</p>
                              {personDetail && (
                                <p className="text-sm text-muted-foreground">{personDetail}</p>
                              )}
                              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(appointment.appointmentDate), "PPPp")}
                              </div>
                              <Badge variant="secondary" className="mt-2">
                                {appointment.reasonForVisit}
                              </Badge>
                            </div>
                          </div>
                          <Badge>{appointment.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            {/* Past Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  All Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.allAppointments?.length > 0 ? (
                  <div className="space-y-4">
                    {data.allAppointments.map((appointment: any) => {
                      // For patients: appointment has doctor, for doctors: appointment has patient
                      const otherPerson = userType === "patient" ? appointment.doctor : appointment.patient;
                      const personName = otherPerson?.user?.name || "Unknown";
                      const personDetail = userType === "patient" 
                        ? otherPerson?.specialty 
                        : otherPerson?.user?.email;
                      
                      return (
                        <div key={appointment.id} className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{personName}</p>
                              {personDetail && (
                                <p className="text-sm text-muted-foreground">{personDetail}</p>
                              )}
                              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(appointment.appointmentDate), "PPPp")}
                              </div>
                              <Badge variant="secondary" className="mt-2">
                                {appointment.reasonForVisit}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline">{appointment.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No appointments found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
