import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Ranking = lazy(() => import("./pages/TopSellers"));
const Signups = lazy(() => import("./pages/Signups"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--primary) / 0.2)',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--card))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--card))',
              },
            },
          }}
        />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/cadastros" element={<Signups />} />
            <Route path="/usuarios/:userId" element={<UserDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
