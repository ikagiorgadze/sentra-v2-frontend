import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppShell } from "@/features/sentra/components/AppShell";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force dark mode by default for Sentra
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<AppShell initialView="landing" />} />
            <Route path="/login" element={<AppShell initialView="auth" />} />
            <Route path="/register" element={<AppShell initialView="auth" />} />
            <Route path="/registration-notice" element={<AppShell initialView="auth" />} />

            <Route path="/chat" element={<AppShell initialView="app" />} />
            <Route path="/admin/demo" element={<AppShell initialView="app" adminDemoMode />} />
            <Route path="/dashboard" element={<AppShell initialView="app" />} />
            <Route path="/billing" element={<AppShell initialView="app" />} />
            <Route path="/onboarding" element={<AppShell initialView="app" />} />
            <Route path="/sample-report" element={<AppShell initialView="app" />} />

            <Route path="/about" element={<AppShell initialView="landing" />} />
            <Route path="/privacy" element={<AppShell initialView="landing" />} />
            <Route path="/terms" element={<AppShell initialView="landing" />} />
            <Route path="/contact" element={<AppShell initialView="landing" />} />
            <Route path="/cookies" element={<AppShell initialView="landing" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
