import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryCard, CategoryGrid } from "@/components/ui/category-card";
import { SkillCard } from "@/components/ui/skill-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { SkillFormDialog } from "@/components/ui/skill-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function DiscoverPage() {
  const [_, setLocation] = useLocation();
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [skillType, setSkillType] = useState<"all" | "offering" | "requesting">("all");

  // Get the category from URL if any
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  // Fetch skills
  const { data: skills, isLoading } = useQuery({
    queryKey: ["/api/skills", selectedCategory, skillType],
    queryFn: async () => {
      let url = "/api/skills";
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      
      if (skillType !== "all") {
        params.append("type", skillType);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch skills");
      }
      return res.json();
    },
  });

  // Filter skills based on search term
  const filteredSkills = skills
    ? skills.filter((skill: any) => 
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSkillType("all");
    setLocation("/discover");
  };

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
                      placeholder="Search skills, tags, or categories"
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Discover Skills</h1>
                <div className="flex flex-wrap gap-3">
                  <Select 
                    value={skillType} 
                    onValueChange={(value) => setSkillType(value as "all" | "offering" | "requesting")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="offering">Skills Offered</SelectItem>
                      <SelectItem value="requesting">Skills Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={clearFilters}
                    disabled={!selectedCategory && skillType === "all" && !searchTerm}
                  >
                    <FontAwesomeIcon icon="times" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Active filters */}
              {(selectedCategory || searchTerm || skillType !== "all") && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {selectedCategory && (
                      <Badge className="bg-primary text-white">
                        Category: {selectedCategory}
                        <button 
                          className="ml-2"
                          onClick={() => setSelectedCategory(null)}
                        >
                          &times;
                        </button>
                      </Badge>
                    )}
                    {skillType !== "all" && (
                      <Badge className="bg-primary text-white">
                        Type: {skillType === "offering" ? "Offering" : "Requesting"}
                        <button 
                          className="ml-2"
                          onClick={() => setSkillType("all")}
                        >
                          &times;
                        </button>
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge className="bg-primary text-white">
                        Search: {searchTerm}
                        <button 
                          className="ml-2"
                          onClick={() => setSearchTerm("")}
                        >
                          &times;
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {!selectedCategory && !searchTerm && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h2>
                  <CategoryGrid />
                </div>
              )}

              {/* Skills list */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedCategory 
                    ? `${selectedCategory} Skills` 
                    : searchTerm 
                      ? `Search Results for "${searchTerm}"` 
                      : "All Skills"}
                </h2>
                
                {isLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
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
                    ))}
                  </div>
                ) : filteredSkills && filteredSkills.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSkills.map((skill: any) => (
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
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FontAwesomeIcon icon="search" className="text-gray-400 text-xl" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm 
                          ? "Try adjusting your search terms or filters" 
                          : selectedCategory 
                            ? `No skills found in the ${selectedCategory} category`
                            : "No skills available yet"}
                      </p>
                      <Button onClick={() => setIsSkillDialogOpen(true)}>
                        Share Your Skill
                      </Button>
                    </CardContent>
                  </Card>
                )}
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
