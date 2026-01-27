import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, FileText, Sparkles, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-16 text-primary-foreground sm:px-12 sm:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            AI-Powered Complaint System
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Report Campus Issues
            <span className="block text-primary-foreground/90">Get Them Fixed Fast</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Submit maintenance complaints for dorms, classrooms, or any campus facility. 
            Our AI automatically categorizes and prioritizes your issues for faster resolution.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="w-full gap-2 text-base sm:w-auto">
              <Link to="/student/submit">
                <FileText className="h-5 w-5" />
                Submit a Complaint
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="relative overflow-hidden border-2 transition-all hover:border-primary/20 hover:shadow-lg">
            <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              1
            </div>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Submit Your Complaint</h3>
              <p className="text-sm text-muted-foreground">
                Fill out a simple form describing the maintenance issue you've encountered on campus.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 transition-all hover:border-primary/20 hover:shadow-lg">
            <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              2
            </div>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI instantly categorizes your complaint and assigns the appropriate priority level.
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 transition-all hover:border-primary/20 hover:shadow-lg">
            <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              3
            </div>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Quick Resolution</h3>
              <p className="text-sm text-muted-foreground">
                Maintenance staff receives your ticket and works on resolving the issue promptly.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-16 rounded-2xl bg-gradient-to-r from-muted/50 to-muted p-8">
        <div className="grid gap-8 text-center sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-primary">24/7</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Complaint Submission</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-primary">&lt;2hrs</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Average Response Time</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-3xl font-bold text-primary">98%</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center">
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
          <CardContent className="py-12">
            <h2 className="mb-4 text-2xl font-semibold">Ready to Report an Issue?</h2>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Don't let maintenance problems disrupt your campus life. Submit a complaint now and we'll handle the rest.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/student/submit">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
