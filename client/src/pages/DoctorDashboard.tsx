import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DoctorDashboard = () => {
  // Mock data - will be replaced with blockchain data
  const stats = {
    totalConsultations: 234,
    completedConsultations: 228,
    earnings: "117 DOT",
    rating: 4.9,
    completionRate: 97,
  };

  const upcomingConsultations = [
    {
      id: 1,
      patient: "John Doe",
      time: "Today, 2:00 PM",
      status: "upcoming",
      fee: "0.5 DOT",
      initials: "JD",
    },
    {
      id: 2,
      patient: "Mary Johnson",
      time: "Today, 4:30 PM",
      status: "upcoming",
      fee: "0.5 DOT",
      initials: "MJ",
    },
    {
      id: 3,
      patient: "Ahmed Hassan",
      time: "Tomorrow, 10:00 AM",
      status: "upcoming",
      fee: "0.5 DOT",
      initials: "AH",
    },
  ];

  const recentConsultations = [
    {
      id: 1,
      patient: "Sarah Wilson",
      date: "Yesterday",
      status: "completed",
      fee: "0.5 DOT",
      rating: 5,
      initials: "SW",
    },
    {
      id: 2,
      patient: "Michael Brown",
      date: "2 days ago",
      status: "completed",
      fee: "0.5 DOT",
      rating: 5,
      initials: "MB",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Dr. Sarah Johnson</p>
            </div>
            <Badge variant="secondary" className="bg-success text-success-foreground w-fit">
              Verified Specialist
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.totalConsultations}</div>
                <div className="text-sm text-muted-foreground">Total Consultations</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.completedConsultations}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.earnings}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.rating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upcoming Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingConsultations.map((consultation) => (
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
                        <div className="font-semibold">{consultation.patient}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {consultation.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm font-semibold">{consultation.fee}</div>
                      <Button variant="hero" size="sm">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
                {upcomingConsultations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming consultations
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
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
                        <div className="font-semibold">{consultation.patient}</div>
                        <div className="text-sm text-muted-foreground">{consultation.date}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-semibold text-success">{consultation.fee}</div>
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="w-4 h-4 fill-warning" />
                        <span className="text-sm">{consultation.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;
