import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, UserPlus, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Register = () => {
  const [activeTab, setActiveTab] = useState("patient");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-hero rounded-2xl">
                <Activity className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Join HealthBridge</h1>
            <p className="text-muted-foreground">
              Connect your wallet to get started
            </p>
          </div>

          {/* Registration Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="gap-2">
                <UserPlus className="w-4 h-4" />
                I'm a Patient
              </TabsTrigger>
              <TabsTrigger value="doctor" className="gap-2">
                <Stethoscope className="w-4 h-4" />
                I'm a Doctor
              </TabsTrigger>
            </TabsList>

            {/* Patient Registration */}
            <TabsContent value="patient">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full Name</Label>
                    <Input id="patient-name" placeholder="John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input id="patient-email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-wallet">Polkadot Wallet Address</Label>
                    <Input
                      id="patient-wallet"
                      placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your wallet address will be used for consultations and medical records
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-emergency">Emergency Contact</Label>
                    <Input id="patient-emergency" placeholder="Emergency contact name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-emergency-phone">Emergency Phone</Label>
                    <Input id="patient-emergency-phone" type="tel" placeholder="+254 700 000 000" />
                  </div>

                  <Button variant="hero" className="w-full" size="lg">
                    Register as Patient
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Doctor Registration */}
            <TabsContent value="doctor">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-name">Full Name</Label>
                    <Input id="doctor-name" placeholder="Dr. Jane Smith" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input id="doctor-email" type="email" placeholder="jane@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-specialty">Specialty</Label>
                    <Input id="doctor-specialty" placeholder="e.g., Cardiology" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-license">License Number</Label>
                    <Input id="doctor-license" placeholder="MED-12345" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-license-hash">License Document (IPFS Hash)</Label>
                    <Input
                      id="doctor-license-hash"
                      placeholder="Qm..."
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your medical license to IPFS and paste the hash here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-fee">Consultation Fee (DOT)</Label>
                    <Input id="doctor-fee" type="number" step="0.01" placeholder="0.5" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-bio">Professional Bio</Label>
                    <Textarea
                      id="doctor-bio"
                      placeholder="Brief description of your experience and expertise..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-wallet">Polkadot Wallet Address</Label>
                    <Input
                      id="doctor-wallet"
                      placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning-foreground">
                      <strong>Verification Required:</strong> Your credentials will be verified by our team before you can start accepting consultations.
                    </p>
                  </div>

                  <Button variant="hero" className="w-full" size="lg">
                    Register as Doctor
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
