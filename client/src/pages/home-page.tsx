import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { Link, useLocation } from "wouter";
import { 
  Loader2, 
  Search, 
  Clock, 
  Star, 
  BookOpen, 
  Award, 
  ArrowRight, 
  Users, 
  MessageSquare, Handshake 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

type RecentSkill = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  user: {
    id: number;
    name: string;
    username: string;
    profileImage: string | null;
  } | null;
};

export default function HomePage() {
  const { user, isLoading } = useSession();
  const [recentSkills, setRecentSkills] = useState<RecentSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchRecentSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const response = await fetch('/api/skills/recent?limit=3');
        if (response.ok) {
          const data = await response.json();
          setRecentSkills(data);
        }
      } catch (error) {
        console.error("Error fetching recent skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchRecentSkills();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Share Your Skills, Grow Together</h1>
            <p className="text-xl mb-8">
              SkillX is a peer-to-peer platform that connects people who want to exchange skills and knowledge.
              Learn something new while sharing what you know!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/discover')} 
                size="lg" 
                variant="secondary"
                className="font-semibold"
              >
                Discover Skills
              </Button>
              {!user && (
                <Button 
                  onClick={() => navigate('/auth')} 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold"
                >
                  Join SkillX
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How SkillX Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect with others, exchange skills, and grow your knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Discover</h3>
              <p className="text-gray-600">
                Find people with skills you want to learn or who want to learn what you know.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-600">
                Message potential skill partners and arrange your exchange sessions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Handshake className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Exchange</h3>
              <p className="text-gray-600">
                Share your knowledge and learn new skills through collaborative sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Skills Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added Skills</h2>
            <Button variant="ghost" onClick={() => navigate('/discover')} className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoadingSkills ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentSkills.length > 0 ? (
                recentSkills.map((skill) => (
                  <Card key={skill.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="mb-1">{skill.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <span className="capitalize py-1 px-2 text-xs rounded-full bg-gray-100 text-gray-700">
                              {skill.category}
                            </span>
                            <span className="capitalize py-1 px-2 text-xs rounded-full bg-primary/10 text-primary">
                              {skill.type}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
                      <div className="mt-4 flex gap-1">
                        {skill.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs py-0.5 px-2 bg-gray-100 text-gray-700 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {skill.tags.length > 3 && (
                          <span className="text-xs py-0.5 px-2 bg-gray-100 text-gray-700 rounded-full">
                            +{skill.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                          {skill.user?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium">{skill.user?.name || 'Unknown User'}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/skills/${skill.id}`)}
                      >
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No skills available yet. Be the first to add one!</p>
                  {user && (
                    <Button className="mt-4" onClick={() => navigate('/profile')}>
                      Add Your Skills
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose SkillX?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to make skill exchange easy, enjoyable, and productive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Community Focused</h3>
              <p className="text-gray-600">
                Join a supportive community of learners and teachers passionate about skill exchange.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Time Efficient</h3>
              <p className="text-gray-600">
                Schedule sessions at your convenience and manage your learning journey effectively.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Learning</h3>
              <p className="text-gray-600">
                Get personalized instruction from people who are passionate about what they teach.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Users</h3>
              <p className="text-gray-600">
                Review system ensures high-quality exchanges and accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Skill Exchange Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join SkillX today and become part of a community that values sharing knowledge and continuous learning.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Button 
                onClick={() => navigate('/discover')} 
                size="lg" 
                variant="secondary"
                className="font-semibold"
              >
                Explore Skills
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                variant="secondary"
                className="font-semibold"
              >
                Join SkillX Now
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white">SkillX</h2>
              <p className="mt-2">Connecting skills, empowering people</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h3 className="font-semibold text-white mb-3">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
                  <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} SkillX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}