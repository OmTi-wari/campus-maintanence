import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Search, Loader2, AlertCircle, Inbox } from "lucide-react";
import { studentApi, type Ticket } from "@/lib/api";
import { format } from "date-fns";

export default function MyTicketsPage() {
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await studentApi.getMyTickets(trimmedEmail);
      setTickets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets. Please try again.");
      setTickets(null);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Track Your Tickets
        </h1>
        <p className="mt-2 text-muted-foreground">
          Enter your email to view the status of your maintenance requests
        </p>
      </div>

      {/* Email Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Your Tickets</CardTitle>
          <CardDescription>
            Enter the email address you used when submitting your complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Student Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Tickets
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {hasSearched && !isLoading && !error && (
        <>
          {tickets && tickets.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Tickets</CardTitle>
                <CardDescription>
                  Found {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} for {email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead className="min-w-[200px]">Complaint</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs">
                          {ticket.id}
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <span title={ticket.complaint_text}>
                            {truncateText(ticket.complaint_text)}
                          </span>
                        </TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>
                          <PriorityBadge priority={ticket.priority as any} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.status as any} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(ticket.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  No tickets found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No tickets found for this email. Make sure you're using the same email you used to submit your complaint.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
