import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
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
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute, AdminRoute } from "./lib/simplified-protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <HomePage />
        </Layout>
      </Route>
      <Route path="/auth" component={SimplifiedAuthPage} />
      <Route path="/discover">
        <Layout>
          <DiscoverPage />
        </Layout>
      </Route>
      <ProtectedRoute path="/profile">
        <Layout>
          <ProfilePage />
        </Layout>
      </ProtectedRoute>
      <ProtectedRoute path="/profile/:username">
        <Layout>
          <ProfilePage />
        </Layout>
      </ProtectedRoute>
      <ProtectedRoute path="/messages">
        <Layout>
          <MessagesPage />
        </Layout>
      </ProtectedRoute>
      <ProtectedRoute path="/exchanges">
        <Layout>
          <ExchangesPage />
        </Layout>
      </ProtectedRoute>
      <Route path="/skills/:id">
        <Layout>
          <SkillDetailPage />
        </Layout>
      </Route>
      <AdminRoute path="/admin">
        <Layout>
          <AdminDashboard />
        </Layout>
      </AdminRoute>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </QueryClientProvider>
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
