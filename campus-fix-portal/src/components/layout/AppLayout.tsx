import { Link, useLocation } from "react-router-dom";
import { Building2, Home, Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const studentNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Submit Complaint", href: "/student/submit", icon: Send },
  { name: "Track Tickets", href: "/student/my-tickets", icon: Search },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Check if we're on a maintainer route
  const isMaintainerRoute = location.pathname.startsWith("/maintainer");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Campus Maintenance</h1>
              <p className="text-xs text-muted-foreground">
                {isMaintainerRoute ? "Staff Portal" : "Student Portal"}
              </p>
            </div>
          </Link>

          {/* Only show student navigation on student routes */}
          {!isMaintainerRoute && (
            <nav className="flex items-center gap-1">
              {studentNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
