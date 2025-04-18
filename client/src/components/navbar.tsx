import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useState } from "react";
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  User, 
  MessageSquare, 
  Handshake,
  Bell,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isLoading, logout } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Navigation links with their paths and icons
  const navLinks = [
    { label: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Discover", path: "/discover", icon: <Search className="h-5 w-5" /> },
    { label: "Messages", path: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { label: "Exchanges", path: "/exchanges", icon: <Handshake className="h-5 w-5" /> },
    { label: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold">
                S
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">SkillX</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold">
                  S
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">SkillX</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  location === link.path 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100"
                )}>
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="mr-2">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.profileImage || ""} alt={user.name} />
                        <AvatarFallback className="bg-primary text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/messages">
                      <DropdownMenuItem className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/exchanges">
                      <DropdownMenuItem className="cursor-pointer">
                        <Handshake className="mr-2 h-4 w-4" />
                        <span>Exchanges</span>
                      </DropdownMenuItem>
                    </Link>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href="/auth">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                      location === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </a>
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarImage src={user.profileImage || ""} alt={user.name} />
                        <AvatarFallback className="bg-primary text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Button 
                      onClick={handleLogout} 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                  <Link href="/auth">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}