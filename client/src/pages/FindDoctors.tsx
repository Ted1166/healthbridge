import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Star, MapPin, DollarSign, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FindDoctors = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with blockchain data
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      consultations: 234,
      fee: "0.5 DOT",
      location: "Nairobi, Kenya",
      verified: true,
      initials: "SJ",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Rheumatology",
      rating: 4.8,
      consultations: 189,
      fee: "0.45 DOT",
      location: "Lagos, Nigeria",
      verified: true,
      initials: "MC",
    },
    {
      id: 3,
      name: "Dr. Amara Okafor",
      specialty: "Pediatrics",
      rating: 5.0,
      consultations: 312,
      fee: "0.4 DOT",
      location: "Accra, Ghana",
      verified: true,
      initials: "AO",
    },
    {
      id: 4,
      name: "Dr. James Williams",
      specialty: "Neurology",
      rating: 4.7,
      consultations: 156,
      fee: "0.6 DOT",
      location: "Cape Town, South Africa",
      verified: true,
      initials: "JW",
    },
    {
      id: 5,
      name: "Dr. Fatima Hassan",
      specialty: "Dermatology",
      rating: 4.9,
      consultations: 278,
      fee: "0.35 DOT",
      location: "Cairo, Egypt",
      verified: true,
      initials: "FH",
    },
    {
      id: 6,
      name: "Dr. David Kamau",
      specialty: "Orthopedics",
      rating: 4.6,
      consultations: 145,
      fee: "0.55 DOT",
      location: "Kampala, Uganda",
      verified: true,
      initials: "DK",
    },
  ];

  const specialties = [
    "All Specialties",
    "Cardiology",
    "Rheumatology",
    "Pediatrics",
    "Neurology",
    "Dermatology",
    "Orthopedics",
  ];

  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Verified Specialists</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our network of blockchain-verified healthcare professionals
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name or specialty..."
                className="pl-12 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {specialties.map((specialty) => (
                <Button
                  key={specialty}
                  variant={selectedSpecialty === specialty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty)}
                  className="whitespace-nowrap"
                >
                  {specialty}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          {/* Doctors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-medium transition-all duration-300 animate-fade-in">
                <CardContent className="p-6 space-y-4">
                  {/* Doctor Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 bg-gradient-hero">
                      <AvatarFallback className="text-primary-foreground font-semibold text-lg">
                        {doctor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        {doctor.verified && (
                          <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {doctor.consultations} consultations
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-foreground">{doctor.fee}</span>
                      <span>per consultation</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link to={`/book-consultation/${doctor.id}`}>
                      <Button variant="hero" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Consultation
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No doctors found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindDoctors;
