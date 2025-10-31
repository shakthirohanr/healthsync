"use client";

import { useRouter } from "next/navigation";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { User, Search, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/lib/AuthContext";

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Mock patient data - replace with actual API call
  const patients = [
    {
      id: "1",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      lastVisit: "2025-10-15",
      upcomingAppointment: "2025-11-05",
      status: "Active",
    },
    {
      id: "2",
      name: "Bob Johnson",
      email: "bob.j@example.com",
      lastVisit: "2025-09-20",
      upcomingAppointment: null,
      status: "Active",
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} notifications={3} />
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
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
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
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">{patient.email}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            Last visit: {patient.lastVisit}
                          </div>
                          {patient.upcomingAppointment && (
                            <Badge variant="secondary">
                              Next: {patient.upcomingAppointment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={patient.status === "Active" ? "default" : "secondary"}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
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
