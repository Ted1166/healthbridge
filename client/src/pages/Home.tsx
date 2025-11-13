import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Shield,
  Clock,
  DollarSign,
  Lock,
  CheckCircle,
  Calendar,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-doctor.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Credentials",
      description: "On-chain doctor verification prevents fraud and ensures quality care.",
    },
    {
      icon: Clock,
      title: "Instant Access",
      description: "Connect with specialists in minutes, not months. No more waiting.",
    },
    {
      icon: Lock,
      title: "Patient-Owned Data",
      description: "Your medical records, your control. Share only what you want.",
    },
    {
      icon: DollarSign,
      title: "Smart Escrow",
      description: "Automated payments with 3% fee. Fair, transparent, and secure.",
    },
    {
      icon: Activity,
      title: "Cross-Chain Ready",
      description: "Accept payments in DOT, USDC, and other tokens via XCM.",
    },
    {
      icon: CheckCircle,
      title: "Dispute Resolution",
      description: "24-hour dispute window with transparent resolution process.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Connect Your Wallet",
      description: "Link your Polkadot wallet to get started. Your identity, your control.",
      icon: Shield,
    },
    {
      step: "2",
      title: "Find a Specialist",
      description: "Browse verified doctors by specialty, rating, and availability.",
      icon: Users,
    },
    {
      step: "3",
      title: "Book & Pay",
      description: "Schedule your consultation. Payment held in secure escrow.",
      icon: Calendar,
    },
    {
      step: "4",
      title: "Get Care",
      description: "Video consultation with your specialist. Records automatically shared.",
      icon: FileText,
    },
  ];

  const stats = [
    { value: "1.4B", label: "People Lacking Healthcare Access" },
    { value: "3+ Months", label: "Average Wait Time for Specialists" },
    { value: "60%", label: "Patients Without Complete Records" },
    { value: "3%", label: "Our Platform Fee (vs 20-30%)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge variant="secondary" className="text-sm">
                Built on Polkadot
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Healthcare Without
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Barriers</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Connect with verified specialists across borders. Own your medical data. Get care in minutes, not months.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/find-doctors">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Find a Doctor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/doctor/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    I'm a Doctor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full"></div>
              <img
                src={heroImage}
                alt="Doctor providing telemedicine consultation"
                className="relative rounded-2xl shadow-large w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2 animate-fade-in">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Why HealthBridge?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leveraging Polkadot's blockchain infrastructure to create trustless, accessible healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-border hover:shadow-medium transition-shadow animate-fade-in">
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3 bg-gradient-hero rounded-lg w-fit">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with HealthBridge in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative animate-fade-in">
                  <Card className="border-border h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                        <div className="p-3 bg-gradient-hero rounded-lg">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-hero border-0 text-primary-foreground overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMS4xLjktMiAyLTJzMiAuOSAyIDItLjkgMi0yIDItMi0uOS0yLTJ6bTAgMjBjMC0xLjEuOS0yIDItMnMyIC45IDIgMi0uOSAyLTIgMi0yLS45LTItMnpNMTYgMTZjMC0xLjEuOS0yIDItMnMyIC45IDIgMi0uOSAyLTIgMi0yLS45LTItMnptMCAyMGMwLTEuMS45LTIgMi0yczIgLjkgMiAyLS45IDItMiAyLTItLjktMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Healthcare?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of patients and doctors building a more accessible healthcare system
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;