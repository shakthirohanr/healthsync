"use client";

import { useState } from "react";
import { Header } from "~/components/Header";
import { PatientDashboard } from "~/components/PatientDashboard";
import { DoctorDashboard } from "~/components/DoctorDashboard";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const [isLoggedIn, setIsLoggedIn] = useState(false);


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
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold">Choose Your Role</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={userType === "patient" ? "default" : "outline"}
                  className="h-16 flex-col space-y-2"
                  onClick={() => setUserType("patient")}
                >
                  <span className="text-lg">👤</span>
                  <span>Patient</span>
                </Button>
                <Button
                  variant={userType === "doctor" ? "default" : "outline"}
                  className="h-16 flex-col space-y-2"
                  onClick={() => setUserType("doctor")}
                >
                  <span className="text-lg">🩺</span>
                  <span>Doctor</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-medical hover:opacity-90"
                onClick={() => setIsLoggedIn(true)}
              >
                Continue as {userType === "patient" ? "Patient" : "Doctor"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo mode - Click continue to explore the interface
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = userType === "patient" ? "John Smith" : "Dr. Sarah Johnson";

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} notifications={3} />
      <main>
        {userType === "patient" ? <PatientDashboard /> : <DoctorDashboard />}
      </main>
    </div>
  );
}