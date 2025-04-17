import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HomePage() {
  const { user, isLoading, logout } = useSession();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
              <FontAwesomeIcon icon="people-arrows" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-900">SkillX</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">@{user.username}</p>
              <p className="mt-2">{user.bio || "No bio provided yet."}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to SkillX</h2>
          <p className="text-gray-600 mb-4">
            SkillX is a peer-to-peer skill exchange platform where you can share your expertise and learn from others.
          </p>
          <p className="text-gray-600">
            This is a simplified home page to demonstrate successful authentication.
          </p>
        </div>
      </main>
    </div>
  );
}