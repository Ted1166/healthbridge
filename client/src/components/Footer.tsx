import { Link } from "react-router-dom";
import { Activity, Twitter, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="p-2 bg-gradient-hero rounded-lg">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>HealthBridge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Decentralized telemedicine platform connecting patients with verified specialists on Polkadot.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/find-doctors" className="hover:text-primary transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h3 className="font-semibold mb-4">For Doctors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/doctor/register" className="hover:text-primary transition-colors">
                  Register as Doctor
                </Link>
              </li>
              <li>
                <Link to="/doctor/dashboard" className="hover:text-primary transition-colors">
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Verification Process
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Built for Polkadot Cloud Builder Party 2025
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 HealthBridge. Built with ❤️ for a healthier, more accessible world.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;