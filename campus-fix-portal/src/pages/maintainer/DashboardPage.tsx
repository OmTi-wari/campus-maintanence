import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Eye, Filter, Loader2, RefreshCw, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { maintainerApi, Ticket } from "@/lib/api";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";

const CATEGORIES = ["All", "Electrical", "Plumbing", "HVAC", "Structural", "Cleaning", "Other"];
const STATUSES = ["All", "Open", "In Progress", "Resolved", "Rejected"];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [maintainerEmail, setMaintainerEmail] = useState("");
  const [assigningTicketId, setAssigningTicketId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintainerApi.getTickets();
      setTickets(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tickets";
      setError(message);
      toast({
        title: "Error Loading Tickets",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleQuickAssign = async (ticketId: number) => {
    if (!maintainerEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address at the top of the dashboard",
        variant: "destructive",
      });
      return;
    }

    setAssigningTicketId(ticketId);
    try {
      await maintainerApi.assignTicket(ticketId, maintainerEmail);
      // Refresh to get updated state
      const updatedTickets = await maintainerApi.getTickets();
      setTickets(updatedTickets);

      toast({
        title: "Ticket Assigned",
        description: `Ticket assigned to ${maintainerEmail}`,
      });
    } catch (err) {
      toast({
        title: "Assignment Failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setAssigningTicketId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (categoryFilter !== "All" && ticket.category !== categoryFilter) return false;
    if (statusFilter !== "All" && ticket.status !== statusFilter) return false;
    if (unassignedOnly && ticket.assigned_to) return false;
    return true;
  });

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maintainer Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage and resolve maintenance tickets</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-2">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-status-open">
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-3xl text-status-open">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-status-in-progress">
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-status-in-progress">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-status-resolved">
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-status-resolved">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Maintainer Email + Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Quick Actions & Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Maintainer Email Input */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="maintainer-email" className="text-sm font-medium">
                Your Email (for quick assignment)
              </Label>
              <Input
                id="maintainer-email"
                type="email"
                placeholder="maintainer@college.edu"
                value={maintainerEmail}
                onChange={(e) => setMaintainerEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground sm:pb-2">
              Enter your email once to quickly assign tickets to yourself
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="unassigned"
                checked={unassignedOnly}
                onCheckedChange={(checked) => setUnassignedOnly(checked === true)}
              />
              <label htmlFor="unassigned" className="text-sm text-muted-foreground cursor-pointer">
                Show only unassigned
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>Click on a ticket to view full details and manage it</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchTickets} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No tickets match your filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ticket ID</TableHead>
                    <TableHead className="min-w-[200px]">Complaint</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="group">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ticket.id}
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-medium text-foreground"
                          title={ticket.complaint_text}
                        >
                          {truncateText(ticket.complaint_text)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{ticket.category}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority as any} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status as any} />
                      </TableCell>
                      <TableCell>
                        {ticket.assigned_to ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3" />
                            <span className="max-w-[120px] truncate" title={ticket.assigned_to.toString()}>
                              {ticket.assigned_to}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm italic text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!ticket.assigned_to && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAssign(ticket.id)}
                              disabled={assigningTicketId === ticket.id}
                              title="Assign to me"
                            >
                              {assigningTicketId === ticket.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                              <span className="ml-1 hidden lg:inline">Assign</span>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/maintainer/ticket/${ticket.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="ml-1 hidden lg:inline">View</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
