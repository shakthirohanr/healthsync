"use client";

import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { Header } from "~/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowLeft,
  Plus,
  Pill,
  FileText,
  CheckCircle,
  CalendarPlus
} from "lucide-react";
import { useAuth } from "~/lib/AuthContext";
import { API_URL, getAuthHeader } from "~/lib/auth";
import { format, parseISO, addDays } from "date-fns";
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";

const fetcher = (url: string) =>
  fetch(`${API_URL}${url}`, { headers: getAuthHeader() }).then((res) =>
    res.json()
  );

export default function PrescriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const appointmentId = params.id as string;

  // Fetch all appointments to find this one
  const { data, error, isLoading } = useSWR(
    user?.role === "DOCTOR" ? "/me/dashboard" : null,
    fetcher
  );

  // Fetch existing prescriptions for this appointment
  const { data: prescriptions, mutate: mutatePrescriptions } = useSWR(
    appointmentId ? `/prescriptions/appointment/${appointmentId}` : null,
    fetcher
  );

  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    refillsAvailable: "0",
    notes: "",
  });

  const [followUpData, setFollowUpData] = useState({
    appointmentDate: addDays(new Date(), 7).toISOString().split("T")[0],
    appointmentTime: "09:00",
    duration: "30",
    reasonForVisit: "Follow-up visit",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);
  const [isSchedulingFollowUp, setIsSchedulingFollowUp] = useState(false);

  // Get user info and appointment data
  const userName = user?.name ?? "User";
  const userType = "doctor";
  const allAppointments = data?.allAppointments || [];
  const appointment = allAppointments.find((appt: any) => appt.id === appointmentId);

  // Handler functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/prescriptions/`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          patientId: appointment.patient.id,
          medication: formData.medication,
          dosage: formData.dosage,
          frequency: formData.frequency,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          refillsAvailable: parseInt(formData.refillsAvailable),
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create prescription");
      }

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      // Reset form
      setFormData({
        medication: "",
        dosage: "",
        frequency: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        refillsAvailable: "0",
        notes: "",
      });

      // Refresh prescriptions list
      mutatePrescriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAppointment = async () => {
    setIsCompletingAppointment(true);

    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete appointment");
      }

      toast({
        title: "Success",
        description: "Appointment marked as completed",
      });

      // Refresh dashboard data to get updated appointment
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete appointment",
        variant: "destructive",
      });
    } finally {
      setIsCompletingAppointment(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSchedulingFollowUp(true);

    try {
      // Combine date and time
      const appointmentDateTime = new Date(
        `${followUpData.appointmentDate}T${followUpData.appointmentTime}`
      );

      const response = await fetch(`${API_URL}/appointments/doctor/create`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: appointment.patient.id,
          appointmentDate: appointmentDateTime.toISOString(),
          duration: parseInt(followUpData.duration),
          reasonForVisit: followUpData.reasonForVisit,
          notes: followUpData.notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule follow-up");
      }

      toast({
        title: "Success",
        description: "Follow-up appointment scheduled successfully",
      });

      // Reset form
      setFollowUpData({
        appointmentDate: addDays(new Date(), 7).toISOString().split("T")[0],
        appointmentTime: "09:00",
        duration: "30",
        reasonForVisit: "Follow-up visit",
        notes: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up appointment",
        variant: "destructive",
      });
    } finally {
      setIsSchedulingFollowUp(false);
    }
  };

  // Early returns for loading and auth
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-20 w-full" />
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "DOCTOR") {
    router.push("/dashboard");
    return null;
  }

  if (!appointment && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userType={userType} userName={userName} />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
            <Button onClick={() => router.push("/appointments")}>
              Back to Appointments
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userType={userType} userName={userName} />
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2 text-medical-primary" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {appointment?.patient?.user?.name || "Unknown Patient"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment?.patient?.user?.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appointment?.status === "SCHEDULED"
                        ? "default"
                        : appointment?.status === "COMPLETED"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {appointment?.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {appointment && format(parseISO(appointment.appointmentDate), "PPP")}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {appointment && format(parseISO(appointment.appointmentDate), "p")}
                  </div>
                  {appointment?.reasonForVisit && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      {appointment.reasonForVisit}
                    </div>
                  )}
                </div>

                {/* Complete Appointment Button */}
                {appointment?.status !== "COMPLETED" && (
                  <div className="mt-4">
                    <Button
                      onClick={handleCompleteAppointment}
                      disabled={isCompletingAppointment}
                      className="w-full bg-gradient-medical hover:opacity-90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isCompletingAppointment ? "Completing..." : "Mark as Completed"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Prescriptions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Prescription Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-medical-primary" />
                Add Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication Name *</Label>
                  <Input
                    id="medication"
                    value={formData.medication}
                    onChange={(e) =>
                      setFormData({ ...formData, medication: e.target.value })
                    }
                    placeholder="e.g., Amoxicillin"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      placeholder="e.g., 500mg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      placeholder="e.g., Twice daily"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refillsAvailable">Refills Available</Label>
                  <Input
                    id="refillsAvailable"
                    type="number"
                    min="0"
                    value={formData.refillsAvailable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refillsAvailable: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Instructions</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional instructions for the patient..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Prescription"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Pill className="h-5 w-5 mr-2 text-medical-secondary" />
                Existing Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions?.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription: any) => (
                    <Card key={prescription.id} className="border-l-4 border-l-medical-primary">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-lg">
                              {prescription.medication}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {prescription.refillsAvailable} refills
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Dosage:</span>{" "}
                              {prescription.dosage}
                            </p>
                            <p>
                              <span className="font-medium">Frequency:</span>{" "}
                              {prescription.frequency}
                            </p>
                            <p>
                              <span className="font-medium">Start:</span>{" "}
                              {format(parseISO(prescription.startDate), "PPP")}
                            </p>
                            {prescription.endDate && (
                              <p>
                                <span className="font-medium">End:</span>{" "}
                                {format(parseISO(prescription.endDate), "PPP")}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No prescriptions added yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Follow-up Appointments Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Follow-up Appointments</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Follow-up Form */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarPlus className="h-5 w-5 mr-2 text-medical-accent" />
              Schedule Follow-up Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Appointment Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={followUpData.appointmentDate}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, appointmentDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Time *</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={followUpData.appointmentTime}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, appointmentTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={followUpData.duration}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, duration: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                  <Input
                    id="reasonForVisit"
                    value={followUpData.reasonForVisit}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, reasonForVisit: e.target.value })
                    }
                    placeholder="e.g., Follow-up checkup"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpNotes">Notes</Label>
                <Textarea
                  id="followUpNotes"
                  value={followUpData.notes}
                  onChange={(e) =>
                    setFollowUpData({ ...followUpData, notes: e.target.value })
                  }
                  placeholder="Additional notes for the follow-up..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSchedulingFollowUp}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                {isSchedulingFollowUp ? "Scheduling..." : "Schedule Follow-up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upcoming Follow-up Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarIcon className="h-5 w-5 mr-2 text-medical-secondary" />
              Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.upcomingAppointments?.filter((appt: any) => 
              appt.patient?.id === appointment?.patient?.id && 
              new Date(appt.appointmentDate) > new Date()
            ).length > 0 ? (
              <div className="space-y-4">
                {data.upcomingAppointments
                  .filter((appt: any) => 
                    appt.patient?.id === appointment?.patient?.id && 
                    new Date(appt.appointmentDate) > new Date()
                  )
                  .map((followUp: any) => (
                    <Card key={followUp.id} className="border-l-4 border-l-medical-accent">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">
                                {format(parseISO(followUp.appointmentDate), "PPP")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(followUp.appointmentDate), "p")}
                              </p>
                            </div>
                            <Badge
                              variant={
                                followUp.status === "SCHEDULED"
                                  ? "default"
                                  : followUp.status === "COMPLETED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {followUp.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Duration:</span>{" "}
                              {followUp.duration} minutes
                            </p>
                            <p>
                              <span className="font-medium">Reason:</span>{" "}
                              {followUp.reasonForVisit}
                            </p>
                            {followUp.notes && (
                              <p className="mt-2 p-2 bg-secondary/50 rounded">
                                {followUp.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No follow-up appointments scheduled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        </div>
      </main>
    </div>
  );
}
