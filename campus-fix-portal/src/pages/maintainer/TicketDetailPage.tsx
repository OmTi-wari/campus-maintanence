import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { maintainerApi, Ticket, ChecklistItem } from "@/lib/api";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = id ? parseInt(id, 10) : null;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintainerEmail, setMaintainerEmail] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [logAction, setLogAction] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);

    try {
      const [ticketData, checklistData] = await Promise.all([
        maintainerApi.getTicket(ticketId),
        maintainerApi.getChecklist(ticketId).catch(() => []),
      ]);

      setTicket(ticketData);
      setChecklist(checklistData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load ticket";
      setError(message);
      toast({
        title: "Error Loading Ticket",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ticketId]);

  const handleAssign = async () => {
    if (!ticketId || !maintainerEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setAssignLoading(true);
    try {
      await maintainerApi.assignTicket(ticketId, maintainerEmail);
      // Refresh ticket data to get updated status/assignee
      const updatedTicket = await maintainerApi.getTicket(ticketId);
      setTicket(updatedTicket);
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
      setAssignLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;
    setStatusLoading(true);

    try {
      await maintainerApi.updateStatus(ticketId, newStatus);
      // Refresh ticket to confirm update
      const updatedTicket = await maintainerApi.getTicket(ticketId);
      setTicket(updatedTicket);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleChecklistToggle = async (itemId: number) => {
    try {
      const updatedItem = await maintainerApi.toggleChecklistItem(itemId);
      setChecklist((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
    } catch (err) {
      toast({
        title: "Toggle Failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAddLog = async () => {
    if (!ticketId || !logAction.trim()) {
      toast({
        title: "Action Required",
        description: "Please describe the action taken",
        variant: "destructive",
      });
      return;
    }

    setLogLoading(true);
    try {
      await maintainerApi.addWorkLog(ticketId, maintainerEmail || "maintainer", logAction, logNotes);
      setLogAction("");
      setLogNotes("");
      toast({
        title: "Log Added",
        description: "Work log entry saved successfully",
      });
    } catch (err) {
      toast({
        title: "Failed to Add Log",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to Load Ticket</h2>
        <p className="mt-2 text-muted-foreground">{error || "Ticket not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/maintainer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const completedTasks = checklist.filter((item) => item.is_completed).length; // Changed from .completed to .is_completed
  const totalTasks = checklist.length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back Link */}
      <Link
        to="/maintainer/dashboard"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Ticket #{ticket.id}</h1>
            <StatusBadge status={ticket.status as any} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {/* Removed student_name/email if not available in Ticket interface, or need to fetch User */}
            Submitted by Student (ID: {ticket.student_id})
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-foreground">{ticket.complaint_text}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="mt-1 font-medium">{ticket.category || "Uncategorized"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <div className="mt-1">
                    <PriorityBadge priority={ticket.priority as any} />
                  </div>
                </div>
                {ticket.confidence !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                    <p className="mt-1 font-medium">{(ticket.confidence * 100).toFixed(0)}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Checklist</CardTitle>
                {totalTasks > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} completed
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {checklist.length === 0 ? (
                <p className="text-sm text-muted-foreground">No checklist items for this ticket</p>
              ) : (
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox
                        id={item.id.toString()}
                        checked={item.is_completed}
                        onCheckedChange={() => handleChecklistToggle(item.id)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={item.id.toString()}
                        className={`text-sm cursor-pointer ${item.is_completed ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                      >
                        {item.task_name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Work Log
              </CardTitle>
              <CardDescription>Document actions and notes for this ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Log Form */}
              <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Action Taken</label>
                  <Input
                    placeholder="e.g., Inspected the issue, replaced part..."
                    value={logAction}
                    onChange={(e) => setLogAction(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="Additional details, observations, or next steps..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddLog} disabled={logLoading}>
                  {logLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Add Log Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.assigned_to ? (
                <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Assigned to</p>
                    <p className="text-sm text-muted-foreground">{ticket.assigned_to}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    This ticket is currently unassigned
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="your.email@college.edu"
                      value={maintainerEmail}
                      onChange={(e) => setMaintainerEmail(e.target.value)}
                    />
                    <Button onClick={handleAssign} className="w-full" disabled={assignLoading}>
                      {assignLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Assign to Me
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={ticket.status}
                onValueChange={handleStatusChange}
                disabled={statusLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{format(new Date(ticket.updated_at), "MMM d, yyyy h:mm a")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
