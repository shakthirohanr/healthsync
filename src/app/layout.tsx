import "~/styles/globals.css";

import { type Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { TooltipProvider } from "~/components/ui/tooltip";
import { Toaster as Sonner } from "~/components/ui/sonner";
import { Toaster } from "~/components/ui/toaster";
import { ThemeProvider } from "~/components/theme-provider"; // Import the new provider

export const metadata: Metadata = {
  title: "HealthSync - Patient Management System",
  description: "Healthcare management system for patients and doctors. Book appointments, manage prescriptions, and access medical records.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}