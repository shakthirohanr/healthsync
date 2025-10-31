"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Bell, Calendar, Clock, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { API_URL, getAuthHeader } from "~/lib/auth";
import Link from "next/link";

const fetcher = (url: string) =>
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() }).then((res) =>
    res.json()
  );

interface NotificationPanelProps {
  userType: "patient" | "doctor";
}

export const NotificationPanel = ({ userType }: NotificationPanelProps) => {
  const [open, setOpen] = useState(false);
  const { data, error, isLoading } = useSWR("/me/dashboard", fetcher);

  const upcomingAppointments = data?.upcomingAppointments || [];
  const todaySchedule = data?.todaySchedule || [];
  
  // Combine and get notifications based on user type
  const notifications = userType === "patient" ? upcomingAppointments : todaySchedule;
  const notificationCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {notificationCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {notificationCount} {notificationCount === 1 ? "notification" : "notifications"}
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              Failed to load notifications
            </div>
          ) : notificationCount === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((appointment: any, index: number) => {
                const isPatient = userType === "patient";
                const otherPerson = isPatient 
                  ? appointment.doctor?.user 
                  : appointment.patient?.user;
                const specialty = isPatient ? appointment.doctor?.specialty : null;

                return (
                  <div key={appointment.id}>
                    <div className="p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {isPatient ? "Upcoming Appointment" : "Today's Appointment"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {isPatient ? "Dr. " : ""}{otherPerson?.name}
                              </p>
                              {specialty && (
                                <p className="text-xs text-muted-foreground">
                                  {specialty}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(appointment.appointmentDate), "PPP")}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(appointment.appointmentDate), "p")}
                            </div>
                          </div>
                          
                          {appointment.reasonForVisit && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {appointment.reasonForVisit}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="my-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {notificationCount > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Link href="/appointments" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full text-sm">
                  View All Appointments
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
