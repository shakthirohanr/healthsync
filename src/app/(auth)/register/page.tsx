
"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { RegisterForm } from "~/components/RegisterForm";
import { UserRole } from "@prisma/client";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md shadow-medical">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-medical">
          <div className="h-8 w-8 rounded-lg bg-white"></div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Create an Account</h1>
        <p className="text-muted-foreground">Choose your role and enter your details.</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">As a Patient</TabsTrigger>
            <TabsTrigger value="doctor">As a Doctor</TabsTrigger>
          </TabsList>
          <TabsContent value="patient">
            <RegisterForm role={UserRole.PATIENT} />
          </TabsContent>
          <TabsContent value="doctor">
            <RegisterForm role={UserRole.DOCTOR} />
          </TabsContent>
        </Tabs>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
