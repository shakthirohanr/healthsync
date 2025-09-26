
"use client";

import { useSession, SessionProvider } from "next-auth/react";
import { Header } from "~/components/Header";
import { PatientDashboard } from "~/components/PatientDashboard";
import { DoctorDashboard } from "~/components/DoctorDashboard";
import { LoginForm } from "~/components/LoginForm";
import { Button } from "~/components/ui/button";

function HomePageContent() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-medical">
              <div className="h-8 w-8 rounded-lg bg-white"></div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">HealthSync Portal</h1>
            <p className="text-muted-foreground">healthcare management system</p>
          </div>
          <div className="space-y-6 rounded-2xl bg-card p-8 shadow-medical">
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  const userName = session.user?.name ?? "User";
  const userType = session.user?.role === "DOCTOR" ? "doctor" : "patient";

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} notifications={3} />
      <main>
        {userType === "patient" ? <PatientDashboard /> : <DoctorDashboard />}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  );
}
