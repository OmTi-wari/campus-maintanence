import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import SubmitComplaintPage from "./pages/student/SubmitComplaintPage";
import MyTicketsPage from "./pages/student/MyTicketsPage";
import DashboardPage from "./pages/maintainer/DashboardPage";
import TicketDetailPage from "./pages/maintainer/TicketDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/student/submit" element={<SubmitComplaintPage />} />
            <Route path="/student/my-tickets" element={<MyTicketsPage />} />
            <Route path="/maintainer/dashboard" element={<DashboardPage />} />
            <Route path="/maintainer/ticket/:id" element={<TicketDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
