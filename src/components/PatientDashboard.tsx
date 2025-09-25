import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, FileText, Pill, Plus, User } from "lucide-react";

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2024-01-15",
    time: "10:30 AM",
    type: "Follow-up",
    avatar: "/api/placeholder/40/40"
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Practice",
    date: "2024-01-22",
    time: "2:15 PM",
    type: "Check-up",
    avatar: "/api/placeholder/40/40"
  }
];

const recentVisits = [
  {
    id: 1,
    doctor: "Dr. Emily Davis",
    date: "2024-01-08",
    diagnosis: "Routine Physical",
    status: "completed"
  },
  {
    id: 2,
    doctor: "Dr. Sarah Johnson",
    date: "2024-12-15",
    diagnosis: "Blood Pressure Check",
    status: "completed"
  }
];

const activePrescriptions = [
  {
    id: 1,
    medication: "Lisinopril 10mg",
    dosage: "Once daily",
    remaining: "23 days",
    refills: 2
  },
  {
    id: 2,
    medication: "Metformin 500mg",
    dosage: "Twice daily",
    remaining: "45 days",
    refills: 1
  }
];

export const PatientDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, John</h2>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>
        <Button className="bg-gradient-medical hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="h-5 w-5 mr-2 text-medical-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={appointment.avatar} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{appointment.doctor}</p>
                  <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {appointment.date} at {appointment.time}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {appointment.type}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-sm">
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-medical-secondary" />
              Recent Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentVisits.map((visit) => (
              <div key={visit.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{visit.doctor}</p>
                  <Badge variant="outline" className="text-xs">
                    {visit.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                <p className="text-xs text-muted-foreground mt-1">{visit.date}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full text-sm">
              View Medical History
            </Button>
          </CardContent>
        </Card>

        {/* Active Prescriptions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Pill className="h-5 w-5 mr-2 text-medical-accent" />
              Active Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activePrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{prescription.medication}</p>
                    <p className="text-xs text-muted-foreground">{prescription.dosage}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {prescription.refills} refills
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{prescription.remaining} remaining</span>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Request Refill
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-sm">
              View All Prescriptions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Health Reminders */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Health Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Medication Reminder</p>
                  <p className="text-xs text-muted-foreground">Take Lisinopril - 8:00 AM</p>
                </div>
                <Button size="sm" variant="outline">
                  Mark Taken
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-medical-primary/10 border border-medical-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Lab Results</p>
                  <p className="text-xs text-muted-foreground">New results available</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-medical-accent/10 border border-medical-accent/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Annual Check-up</p>
                  <p className="text-xs text-muted-foreground">Due in 2 weeks</p>
                </div>
                <Button size="sm" variant="outline">
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};