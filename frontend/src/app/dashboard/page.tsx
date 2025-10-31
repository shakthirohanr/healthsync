
"use client";

import { useAuth } from "~/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Header } from "~/components/Header";
import { PatientDashboard } from "~/components/PatientDashboard";
import { DoctorDashboard } from "~/components/DoctorDashboard";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-16" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-16" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-16" />
              </CardContent>
            </Card>
          </div>
        </main>
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
      <main>
        {userType === "patient" ? <PatientDashboard userName={userName} /> : <DoctorDashboard />}
      </main>
    </div>
  );
}
