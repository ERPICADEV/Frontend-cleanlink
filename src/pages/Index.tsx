import { Link } from "react-router-dom";
import { FileText, BarChart3, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/favicon.ico" 
              alt="CleanLink Logo" 
              className="w-8 h-8"
            />
            <span className="font-bold text-xl">CleanLink</span>
          </div>
          <Button asChild>
            <Link to="/admin">
              Admin Panel
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Admin Dashboard Ready
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Civic Report Administration System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage citizen reports, track resolutions, and analyze civic issues with a powerful admin dashboard built for efficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/admin">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/admin/reports">
                View Reports
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Dashboard Overview",
                description: "Real-time stats on pending, assigned, and resolved reports",
                href: "/admin",
              },
              {
                icon: FileText,
                title: "Reports Management",
                description: "Filter, search, assign, and resolve citizen reports",
                href: "/admin/reports",
              },
              {
                icon: Users,
                title: "Audit Logs",
                description: "Complete timeline of all actions taken on reports",
                href: "/admin/audit",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Insights and metrics for informed decision making",
                href: "/admin/analytics",
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                to={feature.href}
                className="bg-card rounded-xl border border-border p-6 card-hover group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl border border-border p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Total Reports", value: "1,234", trend: "+12%" },
                { label: "Resolved", value: "987", trend: "+8%" },
                { label: "Avg Resolution", value: "2.4 days", trend: "-15%" },
                { label: "Active Admins", value: "24", trend: "+3" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CleanLink Admin Dashboard • Built with React & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
