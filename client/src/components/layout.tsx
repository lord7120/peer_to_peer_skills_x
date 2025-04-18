import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { useLocation } from "wouter";

type LayoutProps = {
  children: ReactNode;
  hideNavbar?: boolean;
};

export function Layout({ children, hideNavbar = false }: LayoutProps) {
  const [location] = useLocation();
  
  // Do not show the Navbar on the auth page
  const shouldHideNavbar = hideNavbar || location === "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
    </div>
  );
}