
"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Calendar, Clock, Users, FileText, Activity, Plus, User } from "lucide-react";
import { format } from "date-fns";
import { API_URL, getAuthHeader } from "~/lib/auth";

const fetcher = (url: string) => 
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() })
    .then(res => res.json());

interface DoctorDashboardProps {
  userName?: string;
}

export const DoctorDashboard = ({ userName = "Doctor" }: DoctorDashboardProps) => {
  const { data, error, isLoading } = useSWR('/me/dashboard', fetcher);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-6 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Failed to load dashboard data.</div>;
  }

  const stats = [
    { label: "Today's Patients", value: data?.stats?.totalPatientsToday, icon: Users, color: "text-medical-primary" },
    { label: "Pending Reviews", value: data?.stats?.pendingLabResults, icon: FileText, color: "text-warning" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Good morning, {userName}</h2>
          <p className="text-muted-foreground">You have {data?.stats?.totalPatientsToday} appointments today</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/calendar">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-medical-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.todaySchedule?.map((appointment: any) => (
              <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{appointment.patient.user.name}</p>
                    <Badge 
                      variant={appointment.status === "SCHEDULED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span>{format(new Date(appointment.appointmentDate), "p")}</span>
                    <span>•</span>
                    <span>{appointment.reasonForVisit}</span>
                    <span>•</span>
                    <span>{appointment.duration} min</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
            <Link href="/appointments" className="w-full">
              <Button variant="outline" className="w-full">
                View Full Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-medical-secondary" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.recentPatients?.map((patient: any) => (
              <div key={patient.id} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.user.image} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{patient.user.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.address}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Link href="/patients" className="w-full">
              <Button variant="outline" className="w-full">
                View All Patients
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
