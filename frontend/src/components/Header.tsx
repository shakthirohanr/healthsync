"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Bell, Settings, User } from "lucide-react";
import { logout } from "~/lib/auth";

interface HeaderProps {
  userType: "patient" | "doctor";
  userName: string;
  notifications?: number;
}

export const Header = ({ userType, userName, notifications = 0 }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  // Define navigation items based on user type
  const patientNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Appointments", path: "/appointments" },
    { label: "Records", path: "/records" },
  ];

  const doctorNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Appointments", path: "/appointments" },
    { label: "Patients", path: "/patients" },
    { label: "Records", path: "/records" },
  ];

  const navItems = userType === "patient" ? patientNavItems : doctorNavItems;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-foreground">HealthSync</h1>
          </div>
          
          <nav className="flex space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={pathname === item.path ? "default" : "ghost"}
                className="capitalize"
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {notifications}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 pl-4 border-l border-border">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm text-left">
                  <p className="font-medium">{userName}</p>
                  <p className="text-muted-foreground capitalize">{userType}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout()}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};