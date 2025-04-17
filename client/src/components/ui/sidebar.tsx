import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";

type SidebarLinkProps = {
  href: string;
  icon: any;
  text: string;
  active?: boolean;
  badge?: number;
};

const SidebarLink = ({ href, icon, text, active, badge }: SidebarLinkProps) => (
  <Link href={href}>
    <a className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
      active 
        ? "text-primary bg-indigo-50" 
        : "text-gray-700 hover:text-primary hover:bg-indigo-50"
    }`}>
      <FontAwesomeIcon 
        icon={icon} 
        className={`w-5 h-5 mr-3 ${active ? "text-primary" : "text-gray-400"}`} 
      />
      {text}
      {badge ? (
        <span className="ml-auto bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </a>
  </Link>
);

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get unread messages count
  const { data: unreadData } = useQuery({
    queryKey: ["/api/messages/unread"],
    enabled: !!user,
  });

  // Close sidebar when location changes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      
      if (window.innerWidth < 1024 && 
          sidebar && 
          mobileMenuButton && 
          !sidebar.contains(e.target as Node) && 
          !mobileMenuButton.contains(e.target as Node) && 
          isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
    : '?';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          type="button" 
          id="mobile-menu-button"
          className="text-gray-600 hover:text-primary focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon="bars" className="text-xl" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div 
        id="sidebar" 
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-40 transition duration-200 ease-in-out lg:static lg:inset-0 w-64 bg-white shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 pt-8 pb-6 border-b">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                <FontAwesomeIcon icon="people-arrows" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">SkillX</h1>
            </div>
            <p className="mt-1 text-xs text-gray-500">Peer-to-Peer Skill Exchange</p>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <SidebarLink 
              href="/" 
              icon="home" 
              text="Dashboard" 
              active={location === '/'} 
            />
            <SidebarLink 
              href={`/profile/${user?.id}`} 
              icon="user" 
              text="My Profile" 
              active={location.startsWith('/profile')} 
            />
            <SidebarLink 
              href={`/profile/${user?.id}?tab=skills`} 
              icon="lightbulb" 
              text="My Skills" 
              active={location === `/profile/${user?.id}?tab=skills`} 
            />
            <SidebarLink 
              href="/discover" 
              icon="search" 
              text="Discover" 
              active={location === '/discover'} 
            />
            <SidebarLink 
              href="/messages" 
              icon="comments" 
              text="Messages" 
              active={location.startsWith('/messages')}
              badge={unreadData?.count || 0}
            />
            <SidebarLink 
              href="/exchanges" 
              icon="exchange-alt" 
              text="Exchanges" 
              active={location === '/exchanges'} 
            />
            <SidebarLink 
              href={`/profile/${user?.id}?tab=reviews`}
              icon="star" 
              text="Reviews" 
              active={location === `/profile/${user?.id}?tab=reviews`} 
            />
            {user?.isAdmin && (
              <SidebarLink 
                href="/admin" 
                icon="user" 
                text="Admin Panel" 
                active={location === '/admin'} 
              />
            )}
          </nav>

          <div className="px-4 py-4 border-t">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={user?.profileImage} alt={user?.name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
