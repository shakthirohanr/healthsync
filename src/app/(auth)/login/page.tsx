"use client";

import Link from "next/link";
import { LoginForm } from "~/components/LoginForm";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function LoginPage({ searchParams }: { searchParams: { error: string } }) {
  return (
    <Card className="w-full max-w-md shadow-medical">
      <CardHeader className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-medical">
          <div className="h-8 w-8 rounded-lg bg-white"></div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account.</p>
      </CardHeader>
      <CardContent>
        <LoginForm error={searchParams.error} />
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="underline hover:text-primary">
            Sign Up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}