import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    bio: "",
    profileImage: "",
  });

  // Get the current URL search params to determine active tab
  const searchParams = new URLSearchParams(window.location.search);
  const activeTab = searchParams.get("tab") || "profile";

  // Fetch user profile
  const userId = id ? parseInt(id) : currentUser?.id;
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: [`/api/user/${userId}`],
    queryFn: async () => {
      // For the current user, we already have the data
      if (userId === currentUser?.id) {
        return currentUser;
      }
      
      // Otherwise, fetch the user profile
      // Note: In a real app, you'd have an API endpoint for this
      // For now, we'll use the current user as a fallback
      return currentUser;
    },
    enabled: !!userId,
  });

  // Fetch user skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: [`/api/skills/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch user reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/reviews/user/${userId}`],
    enabled: !!userId,
  });

  // Fetch user average rating
  const { data: ratingData } = useQuery({
    queryKey: [`/api/reviews/user/${userId}/average`],
    enabled: !!userId,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/user/${userId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditProfileOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setEditFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        profileImage: profile.profileImage || "",
      });
    }
  }, [profile]);

  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setLocation(`/profile/${userId}?tab=${value}`, { replace: true });
  };

  // Function to save profile updates
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editFormData);
  };

  // Generate initials for avatar fallback
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
    : '?';

  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon="star" className="text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={["fas", "star-half-alt"]} className="text-yellow-400" />);
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={["far", "star"]} className="text-yellow-400" />);
    }

    return stars;
  };

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isLoadingProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ) : profile ? (
                <div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.profileImage} alt={profile.name} />
                        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {renderStars(ratingData?.averageRating || 0)}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {ratingData?.averageRating ? `${ratingData.averageRating}/5` : "No ratings yet"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button onClick={() => setIsEditProfileOpen(true)} className="flex items-center">
                        <FontAwesomeIcon icon="edit" className="mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                    <div className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">About</h2>
                      <p className="text-gray-700">
                        {profile.bio || "No bio provided yet."}
                      </p>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="skills">Skills</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                      <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                          <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-500 w-32">Username:</span>
                                <span className="font-medium text-gray-900">{profile.username}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-500 w-32">Email:</span>
                                <span className="font-medium text-gray-900">{profile.email}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-500 w-32">Member since:</span>
                                <span className="font-medium text-gray-900">
                                  {format(new Date(profile.createdAt), "MMMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="skills">
                      {isLoadingSkills ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                              <div className="p-4 border-b">
                                <Skeleton className="h-10 w-full" />
                              </div>
                              <div className="p-4">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <div className="flex gap-2 mt-3">
                                  <Skeleton className="h-6 w-16 rounded" />
                                  <Skeleton className="h-6 w-16 rounded" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {skills && skills.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {skills.map((skill: any) => (
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
                                    id: profile.id,
                                    name: profile.name,
                                    profileImage: profile.profileImage
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white shadow rounded-lg p-8 text-center">
                              <p className="text-gray-500 mb-4">No skills listed yet.</p>
                              {isOwnProfile && (
                                <Button onClick={() => setLocation("/")}>
                                  Add Your First Skill
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="reviews">
                      {isLoadingReviews ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white shadow rounded-lg p-6">
                              <div className="flex items-center mb-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="ml-3">
                                  <Skeleton className="h-4 w-32 mb-1" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="ml-auto">
                                  <Skeleton className="h-4 w-24" />
                                </div>
                              </div>
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {reviews && reviews.length > 0 ? (
                            <div className="space-y-4">
                              {reviews.map((review: any) => (
                                <div key={review.id} className="bg-white shadow rounded-lg p-6">
                                  <div className="flex items-center mb-4">
                                    <Avatar>
                                      <AvatarImage src={review.reviewer?.profileImage} alt={review.reviewer?.name} />
                                      <AvatarFallback>
                                        {review.reviewer?.name
                                          .split(' ')
                                          .map((n: string) => n[0])
                                          .join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-3">
                                      <p className="font-medium text-gray-900">{review.reviewer?.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {format(new Date(review.createdAt), "MMMM d, yyyy")}
                                      </p>
                                    </div>
                                    <div className="ml-auto flex">
                                      {[...Array(5)].map((_, i) => (
                                        <FontAwesomeIcon
                                          key={i}
                                          icon="star"
                                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-700">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-white shadow rounded-lg p-8 text-center">
                              <p className="text-gray-500">No reviews yet.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <p className="text-gray-500">User not found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Profile Image URL</label>
              <Input
                value={editFormData.profileImage}
                onChange={(e) => setEditFormData({ ...editFormData, profileImage: e.target.value })}
                placeholder="URL to your profile image"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <Textarea
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                placeholder="Tell others about yourself"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
