import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppShell } from "@/features/sentra/components/AppShell";
import { CheckoutPlaceholderPage } from "@/features/sentra/components/CheckoutPlaceholderPage";
import { PricingPage } from "@/features/sentra/components/PricingPage";
import { RequestDetailPage } from "@/features/sentra/components/requests/RequestDetailPage";
import { RequestFormPage } from "@/features/sentra/components/requests/RequestFormPage";
import { RequestHistoryPage } from "@/features/sentra/components/requests/RequestHistoryPage";
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
            <Route path="/admin/users/usage" element={<AppShell initialView="app" adminUsageMode="list" />} />
            <Route path="/admin/users/usage/:userId" element={<AppShell initialView="app" adminUsageMode="detail" />} />
            <Route path="/dashboard" element={<AppShell initialView="app" />} />
            <Route path="/onboarding" element={<AppShell initialView="app" />} />
            <Route path="/sample-report" element={<AppShell initialView="app" />} />
            <Route path="/request-form" element={<RequestFormPage />} />
            <Route path="/request-history" element={<RequestHistoryPage />} />
            <Route path="/request-history/:requestId" element={<RequestDetailPage />} />

            <Route path="/about" element={<AppShell initialView="landing" />} />
            <Route path="/privacy" element={<AppShell initialView="landing" />} />
            <Route path="/terms" element={<AppShell initialView="landing" />} />
            <Route path="/contact" element={<AppShell initialView="landing" />} />
            <Route path="/cookies" element={<AppShell initialView="landing" />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout" element={<CheckoutPlaceholderPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
