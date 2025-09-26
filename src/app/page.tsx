
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-subtle p-6">
      <div className="space-y-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-medical">
          <div className="h-8 w-8 rounded-lg bg-white"></div>
        </div>
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
