import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { studentApi, SubmitTicketResponse } from "@/lib/api";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";

const formSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  student_email: z.string().email("Please enter a valid email address").max(255),
  complaint_text: z.string().min(20, "Please provide more details (at least 20 characters)").max(2000),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitComplaintPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitTicketResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_name: "",
      student_email: "",
      complaint_text: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await studentApi.submitTicket({
        student_name: data.student_name,
        student_email: data.student_email,
        complaint: data.complaint_text, // API expects 'complaint', not 'complaint_text'
      });
      setResult(response);

      if (response.valid) {
        toast({
          title: "Complaint Submitted Successfully",
          description: `Your ticket ID is ${response.ticket_id}`,
        });
        form.reset();
      } else {
        toast({
          title: "Complaint Rejected",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewComplaint = () => {
    setResult(null);
    form.reset();
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Submit a Complaint</h1>
        <p className="mt-1 text-muted-foreground">
          Describe your maintenance issue and we'll route it to the right team
        </p>
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help us address your issue quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="student_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="student_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@college.edu" {...field} />
                      </FormControl>
                      <FormDescription>
                        We'll use this to send you updates about your complaint
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complaint_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the maintenance issue in detail. Include the location, what's broken, and any safety concerns..."
                          className="min-h-[150px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include location, severity, and any relevant details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className={result.valid ? "border-success/50" : "border-destructive/50"}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {result.valid ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
              )}
              <div>
                <CardTitle>
                  {result.valid ? "Complaint Submitted" : "Complaint Rejected"}
                </CardTitle>
                <CardDescription>
                  {result.valid
                    ? "Your complaint has been received and categorized"
                    : "We couldn't process your complaint"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.valid ? (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Ticket ID</dt>
                      <dd className="mt-1 font-mono text-lg font-semibold">{result.ticket_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd className="mt-1">
                        <StatusBadge status={result.status as any} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                      <dd className="mt-1 text-sm font-medium">{result.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Priority</dt>
                      <dd className="mt-1">
                        <PriorityBadge priority={result.priority as any} />
                      </dd>
                    </div>
                  </dl>
                </div>

                {result.decision_reason && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-primary">AI System Note:</p>
                    <p className="mt-1 text-sm text-foreground">{result.decision_reason}</p>
                    {/* <p className="text-xs text-muted-foreground mt-1">Confidence: {(result.confidence * 100).toFixed(1)}%</p> */}
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">What happens next?</p>
                    <p className="mt-1 text-muted-foreground">
                      A maintainer will be assigned to your ticket shortly. You'll receive updates via email.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                  <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
                </div>

                {result.decision_reason && result.decision_reason !== result.message && (
                  <div className="rounded-lg border border-muted bg-muted/30 p-4">
                    <p className="text-sm font-medium text-muted-foreground">System Detail:</p>
                    <p className="mt-1 text-sm text-foreground">{result.decision_reason}</p>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleNewComplaint} variant="outline" className="w-full">
              Submit Another Complaint
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
