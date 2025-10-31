
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-subtle p-6">
      {children}
    </main>
  );
}
