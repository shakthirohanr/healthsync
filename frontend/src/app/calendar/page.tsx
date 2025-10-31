"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { User, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useAuth } from "~/lib/AuthContext";
import { API_URL, getAuthHeader } from "~/lib/auth";
import { format, parseISO, startOfDay, isSameDay, addDays } from "date-fns";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

const fetcher = (url: string) =>
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() }).then((res) =>
    res.json()
  );

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch dashboard data which includes appointments
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
              <Skeleton key={i} className="h-32 w-full" />
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

  // Get all appointments from dashboard data
  const allAppointments = data?.allAppointments || [];
  
  // Group appointments by date
  const appointmentsByDate: Record<string, any[]> = {};
  allAppointments.forEach((appt: any) => {
    const dateKey = format(parseISO(appt.appointmentDate), "yyyy-MM-dd");
    if (!appointmentsByDate[dateKey]) {
      appointmentsByDate[dateKey] = [];
    }
    appointmentsByDate[dateKey].push(appt);
  });

  // Get next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Get appointments for selected date
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateAppointments = appointmentsByDate[selectedDateKey] || [];
  
  // Sort appointments by time
  selectedDateAppointments.sort((a, b) => 
    new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage your appointments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selector */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {next7Days.map((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const appointmentsCount = appointmentsByDate[dateKey]?.length || 0;
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <Button
                    key={dateKey}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-between h-auto py-3"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {format(date, "EEEE, MMM d")}
                      </span>
                      {isToday && (
                        <span className="text-xs text-muted-foreground">Today</span>
                      )}
                    </div>
                    {appointmentsCount > 0 && (
                      <Badge variant={isSelected ? "secondary" : "default"}>
                        {appointmentsCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Appointments List for Selected Date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarIcon className="h-5 w-5 mr-2 text-medical-primary" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : selectedDateAppointments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateAppointments.map((appointment: any) => (
                    <Card key={appointment.id} className="border-l-4 border-l-medical-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {appointment.patient?.user?.name || "Unknown Patient"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.patient?.user?.email}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  appointment.status === "SCHEDULED"
                                    ? "default"
                                    : appointment.status === "COMPLETED"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mr-2" />
                                {format(parseISO(appointment.appointmentDate), "h:mm a")}
                                {appointment.duration && ` • ${appointment.duration} min`}
                              </div>
                              {appointment.reasonForVisit && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {appointment.reasonForVisit}
                                </div>
                              )}
                            </div>

                            {appointment.notes && (
                              <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                            
                            <div className="mt-4">
                              <Link href={`/prescriptions/${appointment.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  Add Prescription / Notes
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No appointments scheduled for this date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {next7Days.map((date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const count = appointmentsByDate[dateKey]?.length || 0;
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={dateKey}
                    className={`p-4 rounded-lg border ${
                      isToday ? "border-medical-primary bg-medical-primary/5" : "border-border"
                    }`}
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {format(date, "EEE")}
                    </div>
                    <div className="text-2xl font-bold mt-1">{count}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(date, "MMM d")}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
