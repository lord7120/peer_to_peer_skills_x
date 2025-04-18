import { ReactNode } from "react";
import { useSession } from "../hooks/use-session";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component?: () => React.JSX.Element;
  children?: ReactNode;
};

export function ProtectedRoute({ path, component: Component, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Return either the component or children
  return (
    <Route path={path}>
      {Component ? <Component /> : children}
    </Route>
  );
}

type AdminRouteProps = {
  path: string;
  component?: () => React.JSX.Element;
  children?: ReactNode;
};

export function AdminRoute({ path, component: Component, children }: AdminRouteProps) {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (!user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Return either the component or children
  return (
    <Route path={path}>
      {Component ? <Component /> : children}
    </Route>
  );
}