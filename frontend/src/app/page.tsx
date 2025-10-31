
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/Logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-subtle p-6">
      <div className="space-y-8 text-center">
        <Logo />
        <h1 className="mb-2 text-3xl font-bold text-foreground">HealthSync Portal</h1>
        <p className="text-muted-foreground">Your integrated healthcare management system</p>

        <div className="flex justify-center gap-4 pt-4">
          <Button asChild className="bg-gradient-medical hover:opacity-90">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
