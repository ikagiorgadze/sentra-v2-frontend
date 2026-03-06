import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppShell } from "@/features/sentra/components/AppShell";
import { AppLayout } from "@/features/sentra/components/AppLayout";
import { AdminDemoPage } from "@/features/sentra/components/AdminDemoPage";
import { AdminUsersUsagePage } from "@/features/sentra/components/AdminUsersUsagePage";
import { AdminUserUsageDetailPage } from "@/features/sentra/components/AdminUserUsageDetailPage";
import { CheckoutPlaceholderPage } from "@/features/sentra/components/CheckoutPlaceholderPage";
import { PricingPage } from "@/features/sentra/components/PricingPage";
import { RequestAnalysisPage } from "@/features/sentra/components/requests/RequestAnalysisPage";
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
            {/* Public / auth routes */}
            <Route path="/" element={<AppShell initialView="landing" />} />
            <Route path="/login" element={<AppShell initialView="auth" />} />
            <Route path="/register" element={<AppShell initialView="auth" />} />
            <Route path="/registration-notice" element={<AppShell initialView="auth" />} />

            <Route path="/about" element={<AppShell initialView="landing" />} />
            <Route path="/privacy" element={<AppShell initialView="landing" />} />
            <Route path="/terms" element={<AppShell initialView="landing" />} />
            <Route path="/contact" element={<AppShell initialView="landing" />} />
            <Route path="/cookies" element={<AppShell initialView="landing" />} />

            {/* Authenticated routes — wrapped in AppLayout (top navbar) */}
            <Route path="/request-form" element={<AppLayout><RequestFormPage /></AppLayout>} />
            <Route path="/request-history" element={<AppLayout><RequestHistoryPage /></AppLayout>} />
            <Route path="/request-history/:requestId" element={<AppLayout><RequestDetailPage /></AppLayout>} />
            <Route path="/request-history/:requestId/analysis" element={<AppLayout><RequestAnalysisPage /></AppLayout>} />
            <Route path="/pricing" element={<AppLayout><PricingPage /></AppLayout>} />
            <Route path="/checkout" element={<AppLayout><CheckoutPlaceholderPage /></AppLayout>} />

            {/* Admin routes */}
            <Route path="/admin/demo" element={<AppLayout><AdminDemoPage /></AppLayout>} />
            <Route path="/admin/users/usage" element={<AppLayout adminOnly><AdminUsersUsagePage /></AppLayout>} />
            <Route path="/admin/users/usage/:userId" element={<AppLayout adminOnly><AdminUserUsageDetailPage /></AppLayout>} />

            {/* Redirect old chat route */}
            <Route path="/chat" element={<Navigate to="/request-history" replace />} />
            <Route path="/dashboard" element={<Navigate to="/request-history" replace />} />
            <Route path="/onboarding" element={<Navigate to="/request-history" replace />} />
            <Route path="/sample-report" element={<Navigate to="/request-history" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
