import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, FileText, Activity, Plus, User } from "lucide-react";

const todaySchedule = [
  {
    id: 1,
    patient: "John Smith",
    time: "9:00 AM",
    type: "Follow-up",
    duration: "30 min",
    status: "confirmed",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    patient: "Maria Garcia",
    time: "10:30 AM",
    type: "New Patient",
    duration: "60 min",
    status: "confirmed",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    patient: "Robert Johnson",
    time: "2:00 PM",
    type: "Check-up",
    duration: "30 min",
    status: "pending",
    avatar: "/api/placeholder/40/40"
  }
];

const recentPatients = [
  {
    id: 1,
    name: "Alice Brown",
    lastVisit: "2024-01-10",
    condition: "Hypertension",
    nextAppointment: "2024-02-15",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    name: "David Wilson",
    lastVisit: "2024-01-09",
    condition: "Diabetes Type 2",
    nextAppointment: "2024-01-25",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 3,
    name: "Sarah Thompson",
    lastVisit: "2024-01-08",
    condition: "Annual Physical",
    nextAppointment: "2025-01-08",
    avatar: "/api/placeholder/40/40"
  }
];

const stats = [
  { label: "Today's Patients", value: "8", icon: Users, color: "text-medical-primary" },
  { label: "This Week", value: "42", icon: Calendar, color: "text-medical-secondary" },
  { label: "Pending Reviews", value: "5", icon: FileText, color: "text-warning" },
  { label: "Active Patients", value: "156", icon: Activity, color: "text-medical-accent" }
];

export const DoctorDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Good morning, Dr. Johnson</h2>
          <p className="text-muted-foreground">You have 8 appointments today</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
          <Button className="bg-gradient-medical hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2 text-medical-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.map((appointment) => (
              <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={appointment.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{appointment.patient}</p>
                    <Badge 
                      variant={appointment.status === "confirmed" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span>{appointment.time}</span>
                    <span>•</span>
                    <span>{appointment.type}</span>
                    <span>•</span>
                    <span>{appointment.duration}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-medical-secondary" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center space-x-4 p-3 border border-border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatar} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.condition}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Last: {patient.lastVisit}</span>
                    <span>Next: {patient.nextAppointment}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Patients
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Write Prescription</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Follow-up</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm">Lab Results</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">New Patient</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};