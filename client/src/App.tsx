import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import SimplifiedAuthPage from "@/pages/simplified-auth-page";
import DiscoverPage from "@/pages/discover-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import ExchangesPage from "@/pages/exchanges-page";
import SkillDetailPage from "@/pages/skill-detail-page";
import AdminDashboard from "@/pages/admin-dashboard";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "./hooks/use-session";
import { ProtectedRoute, AdminRoute } from "./lib/simplified-protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={SimplifiedAuthPage} />
      <Route path="/discover" component={DiscoverPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/profile/:username" component={ProfilePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/exchanges" component={ExchangesPage} />
      <Route path="/skills/:id" component={SkillDetailPage} />
      <AdminRoute path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
