import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { CategoryGrid } from "@/components/ui/category-card";
import { SkillCard, SkillCardProps } from "@/components/ui/skill-card";
import { ExchangeItem, ExchangeItemProps } from "@/components/ui/exchange-item";
import { MatchCard } from "@/components/ui/match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { SkillFormDialog } from "@/components/ui/skill-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Home page layout
export default function HomePage() {
  const { user } = useAuth();
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [skillFilter, setSkillFilter] = useState<"all" | "offering" | "requesting">("all");

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !!user,
  });

  // Fetch recent skills
  const { data: recentSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ["/api/skills/recent"],
    enabled: !!user,
  });

  // Fetch active exchanges
  const { data: activeExchanges, isLoading: isLoadingExchanges } = useQuery({
    queryKey: ["/api/exchanges/active"],
    enabled: !!user,
  });

  const filteredSkills = recentSkills
    ? skillFilter === "all"
      ? recentSkills
      : skillFilter === "offering"
        ? recentSkills.filter((skill: any) => skill.isOffering)
        : recentSkills.filter((skill: any) => !skill.isOffering)
    : [];

  // Mock recommended matches for demo (in a real app, this would come from an API)
  const recommendedMatches = [
    {
      user: {
        id: 2,
        name: "Robert Lee",
        profileImage: undefined,
        rating: 4.5
      },
      theirSkills: ["UX Design", "Wireframing", "Figma"],
      yourNeeds: ["JavaScript", "React"]
    },
    {
      user: {
        id: 3,
        name: "Jessica Park",
        profileImage: undefined,
        rating: 4.0
      },
      theirSkills: ["Photography", "Photo Editing"],
      yourNeeds: ["Web Development", "Responsive Design"]
    }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm lg:static z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:hidden">
                {/* Spacer for mobile */}
                <div className="w-8"></div>
              </div>
              <div className="flex-1 flex">
                <div className="max-w-lg w-full lg:max-w-md mx-auto">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon="search" className="text-gray-400" />
                    </div>
                    <Input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Search skills, users, or categories"
                      type="search"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="ml-3 p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none relative">
                  <span className="sr-only">View notifications</span>
                  <FontAwesomeIcon icon="bell" className="text-lg" />
                  {stats?.unreadMessages > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                      {stats.unreadMessages}
                    </span>
                  )}
                </button>
                <button className="ml-3 p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none">
                  <span className="sr-only">Help</span>
                  <FontAwesomeIcon icon="question-circle" className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Dashboard Stats */}
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {isLoadingStats ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-4">
                      <Skeleton className="h-10 w-10 rounded-md mb-2" />
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : (
                  <>
                    <StatCard
                      title="Active Exchanges"
                      value={stats?.activeExchanges || 0}
                      icon="handshake"
                      iconBgColor="bg-primary bg-opacity-10"
                      iconColor="text-primary"
                    />
                    <StatCard
                      title="Completed Exchanges"
                      value={stats?.completedExchanges || 0}
                      icon="check"
                      iconBgColor="bg-secondary bg-opacity-10"
                      iconColor="text-secondary"
                    />
                    <StatCard
                      title="Average Rating"
                      value={`${stats?.averageRating || 0}/5`}
                      icon="star"
                      iconBgColor="bg-accent bg-opacity-10"
                      iconColor="text-accent"
                    />
                    <StatCard
                      title="New Messages"
                      value={stats?.unreadMessages || 0}
                      icon="envelope"
                      iconBgColor="bg-purple-100"
                      iconColor="text-purple-600"
                    />
                  </>
                )}
              </div>
              
              {/* Skill Categories */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Browse Skill Categories</h2>
                <div className="mt-4">
                  <CategoryGrid />
                </div>
              </div>
              
              {/* Recently Added Skills */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recently Added Skills</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-gray-500">Filter:</span>
                      <select 
                        className="text-sm border-gray-300 rounded-md focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value as any)}
                      >
                        <option value="all">All Skills</option>
                        <option value="offering">Skills Offered</option>
                        <option value="requesting">Skills Needed</option>
                      </select>
                    </div>
                    <a href="/discover" className="text-sm font-medium text-primary hover:text-indigo-700">View all</a>
                  </div>
                </div>
                
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {isLoadingSkills ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-3">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <Skeleton className="h-5 w-3/4 mb-1" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Skeleton className="h-4 w-16 rounded" />
                            <Skeleton className="h-4 w-20 rounded" />
                          </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-20 rounded" />
                        </div>
                      </div>
                    ))
                  ) : (
                    filteredSkills.map((skill: any) => (
                      <SkillCard
                        key={skill.id}
                        id={skill.id}
                        title={skill.title}
                        description={skill.description}
                        tags={skill.tags}
                        isOffering={skill.isOffering}
                        timeAvailability={skill.timeAvailability}
                        createdAt={skill.createdAt}
                        user={{
                          id: skill.user.id,
                          name: skill.user.name,
                          profileImage: skill.user.profileImage
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
              
              {/* Your Active Exchanges */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Your Active Exchanges</h2>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  {isLoadingExchanges ? (
                    <div className="divide-y divide-gray-200">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="ml-3">
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Skeleton className="h-4 w-16 rounded-full mr-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <Skeleton className="h-4 w-48 mb-1 sm:mb-0" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeExchanges && activeExchanges.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {activeExchanges.map((exchange: any) => {
                        // Determine if the user is the requester or provider
                        const isRequester = exchange.requesterId === user!.id;
                        const partner = isRequester ? exchange.provider : exchange.requester;
                        const yourSkill = isRequester ? exchange.requesterSkill?.title : exchange.providerSkill?.title;
                        const theirSkill = isRequester ? exchange.providerSkill?.title : exchange.requesterSkill?.title;
                        
                        return (
                          <ExchangeItem
                            key={exchange.id}
                            id={exchange.id}
                            title={isRequester ? exchange.providerSkill?.title : exchange.requesterSkill?.title}
                            partnerName={partner.name}
                            partnerImage={partner.profileImage}
                            partnerId={partner.id}
                            status={exchange.status}
                            startedAt={exchange.createdAt}
                            yourSkill={yourSkill || "Not specified"}
                            theirSkill={theirSkill || "Not specified"}
                            nextSession={exchange.nextSession}
                          />
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">
                        You don't have any active exchanges yet.
                      </p>
                      <p className="text-gray-500 mt-1">
                        Browse skills and reach out to start your first exchange!
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recommended Matches */}
              <div className="mt-8 mb-10">
                <h2 className="text-lg font-medium text-gray-900">Recommended Matches Based on Your Skills</h2>
                <div className="mt-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedMatches.map((match, index) => (
                    <MatchCard 
                      key={index}
                      user={match.user}
                      theirSkills={match.theirSkills}
                      yourNeeds={match.yourNeeds}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button for adding new skill */}
      <FloatingActionButton onClick={() => setIsSkillDialogOpen(true)} />

      {/* Skill Form Dialog */}
      <SkillFormDialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen} />
    </div>
  );
}
