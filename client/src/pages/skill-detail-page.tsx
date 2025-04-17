import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function SkillDetailPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false);

  // Fetch skill details
  const { data: skill, isLoading: isLoadingSkill } = useQuery({
    queryKey: [`/api/skills/${id}`],
    enabled: !!id,
  });

  // Fetch user skills (for exchange)
  const { data: userSkills, isLoading: isLoadingUserSkills } = useQuery({
    queryKey: [`/api/skills/user/${user?.id}`],
    enabled: !!user?.id && isExchangeDialogOpen,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setIsContactDialogOpen(false);
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create exchange mutation
  const createExchangeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/exchanges", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Exchange requested",
        description: "Your exchange request has been sent.",
      });
      setIsExchangeDialogOpen(false);
      setLocation("/exchanges");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle sending a message
  const handleSendMessage = () => {
    if (!user || !skill) return;
    
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: skill.user.id,
      content: message,
    });
  };

  // Handle requesting an exchange
  const handleRequestExchange = (userSkillId: number) => {
    if (!user || !skill) return;
    
    createExchangeMutation.mutate({
      requesterId: user.id,
      providerId: skill.user.id,
      requesterSkillId: userSkillId,
      providerSkillId: skill.id,
      status: "pending",
    });
  };

  // Check if this is the current user's skill
  const isOwnSkill = user?.id === skill?.user?.id;
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isLoadingSkill ? (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-6 w-20 rounded" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ) : skill ? (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center mb-4 sm:mb-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={skill.user?.profileImage} alt={skill.user?.name} />
                            <AvatarFallback>
                              {skill.user?.name
                                ? skill.user.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{skill.user?.name}</p>
                            <p className="text-xs text-gray-500">
                              Posted {formatDistanceToNow(new Date(skill.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          skill.isOffering ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <span className="mr-1">●</span> {skill.isOffering ? 'Offering' : 'Looking for'}
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold text-gray-900 mb-4">{skill.title}</h1>

                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-700">{skill.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {skill.tags.map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className={`bg-${skill.isOffering ? 'indigo' : 'blue'}-100 text-${skill.isOffering ? 'indigo' : 'blue'}-800 hover:bg-${skill.isOffering ? 'indigo' : 'blue'}-200`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-6">
                        <FontAwesomeIcon icon="clock" className="mr-1.5 text-gray-400" />
                        <span>Time Availability: {skill.timeAvailability}</span>
                      </div>

                      {skill.media && (
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attached Media:</p>
                          <a 
                            href={skill.media} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}

                      {!isOwnSkill && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={() => setIsContactDialogOpen(true)}
                            className="flex items-center"
                          >
                            <FontAwesomeIcon icon="comments" className="mr-2" />
                            Contact {skill.user?.name}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsExchangeDialogOpen(true)}
                            className="flex items-center"
                          >
                            <FontAwesomeIcon icon="exchange-alt" className="mr-2" />
                            Propose Exchange
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Profile Card */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">About the Provider</h2>
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={skill.user?.profileImage} alt={skill.user?.name} />
                          <AvatarFallback>
                            {skill.user?.name
                              ? skill.user.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <p className="text-lg font-medium text-gray-900">{skill.user?.name}</p>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary"
                            onClick={() => setLocation(`/profile/${skill.user?.id}`)}
                          >
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <p className="text-gray-500">Skill not found.</p>
                  <Button onClick={() => setLocation("/")} className="mt-4">
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Message</DialogTitle>
            <DialogDescription>
              Send a message to {skill?.user?.name} about their {skill?.isOffering ? 'offered' : 'requested'} skill.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exchange Dialog */}
      <Dialog open={isExchangeDialogOpen} onOpenChange={setIsExchangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Propose a Skill Exchange</DialogTitle>
            <DialogDescription>
              Select one of your skills to exchange with {skill?.user?.name}'s {skill?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingUserSkills ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-20 w-full rounded-md" />
              </div>
            ) : userSkills && userSkills.length > 0 ? (
              <div className="space-y-2">
                {userSkills.map((userSkill: any) => (
                  <div
                    key={userSkill.id}
                    className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRequestExchange(userSkill.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{userSkill.title}</p>
                        <p className="text-sm text-gray-500 truncate">{userSkill.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userSkill.isOffering ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {userSkill.isOffering ? 'Offering' : 'Looking for'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">You don't have any skills to exchange.</p>
                <Button onClick={() => {
                  setIsExchangeDialogOpen(false);
                  setLocation("/");
                }}>
                  Add Your First Skill
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExchangeDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
