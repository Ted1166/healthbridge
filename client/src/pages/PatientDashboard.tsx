import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  FileText,
  Search,
  Clock,
  Star,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PatientDashboard = () => {
  // Mock data - will be replaced with blockchain data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      time: "Today, 3:00 PM",
      fee: "0.5 DOT",
      status: "confirmed",
      initials: "SJ",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Rheumatology",
      time: "Tomorrow, 10:00 AM",
      fee: "0.45 DOT",
      status: "confirmed",
      initials: "MC",
    },
  ];

  const recentConsultations = [
    {
      id: 1,
      doctor: "Dr. Amara Okafor",
      specialty: "Pediatrics",
      date: "Last week",
      rating: 5,
      initials: "AO",
    },
    {
      id: 2,
      doctor: "Dr. James Williams",
      specialty: "Neurology",
      date: "2 weeks ago",
      rating: 5,
      initials: "JW",
    },
  ];

  const medicalRecords = [
    {
      id: 1,
      title: "Blood Test Results",
      date: "Jan 15, 2025",
      type: "Lab Report",
    },
    {
      id: 2,
      title: "Cardiology Consultation Notes",
      date: "Jan 10, 2025",
      type: "Consultation",
    },
    {
      id: 3,
      title: "Prescription - Medication",
      date: "Jan 8, 2025",
      type: "Prescription",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Patient Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John Doe</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link to="/find-doctors">
              <Card className="hover:shadow-medium transition-all cursor-pointer bg-gradient-card h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-gradient-hero rounded-lg">
                    <Search className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Find Doctors</div>
                    <div className="text-sm text-muted-foreground">Browse specialists</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/medical-records">
              <Card className="hover:shadow-medium transition-all cursor-pointer bg-gradient-card h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-accent rounded-lg">
                    <FileText className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">My Records</div>
                    <div className="text-sm text-muted-foreground">View medical history</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/appointments">
              <Card className="hover:shadow-medium transition-all cursor-pointer bg-gradient-card h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Appointments</div>
                    <div className="text-sm text-muted-foreground">Manage bookings</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Appointments
                  </CardTitle>
                  <Link to="/appointments">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-secondary rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-gradient-hero">
                          <AvatarFallback className="text-primary-foreground">
                            {appointment.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{appointment.doctor}</div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.specialty}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success text-success-foreground">
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                      <div className="font-semibold">{appointment.fee}</div>
                    </div>
                    <Button variant="hero" className="w-full">
                      Join Consultation
                    </Button>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming appointments
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-gradient-hero">
                        <AvatarFallback className="text-primary-foreground">
                          {consultation.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{consultation.doctor}</div>
                        <div className="text-sm text-muted-foreground">
                          {consultation.specialty}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {consultation.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="w-4 h-4 fill-warning" />
                      <span className="font-semibold">{consultation.rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Medical Records Section */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Medical Records
                </CardTitle>
                <Link to="/medical-records">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{record.title}</div>
                        <div className="text-sm text-muted-foreground">{record.type}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{record.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
