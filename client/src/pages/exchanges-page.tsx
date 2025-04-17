import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { ExchangeItem } from "@/components/ui/exchange-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function ExchangesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [activeExchangeId, setActiveExchangeId] = useState<number | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Get the exchange ID from URL if any
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setActiveExchangeId(parseInt(id));
    }
  }, []);

  // Fetch all exchanges
  const { data: exchanges, isLoading: isLoadingExchanges } = useQuery({
    queryKey: ["/api/exchanges"],
    enabled: !!user,
  });

  // Fetch active exchange
  const { data: activeExchange, isLoading: isLoadingActiveExchange } = useQuery({
    queryKey: [`/api/exchanges/${activeExchangeId}`],
    enabled: !!activeExchangeId,
  });

  // Update exchange status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/exchanges/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
      queryClient.invalidateQueries({ queryKey: [`/api/exchanges/${activeExchangeId}`] });
      toast({
        title: "Status updated",
        description: "The exchange status has been updated successfully.",
      });
      setIsStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update next session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, nextSession }: { id: number; nextSession: string }) => {
      const res = await apiRequest("PUT", `/api/exchanges/${id}/next-session`, { nextSession });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
      queryClient.invalidateQueries({ queryKey: [`/api/exchanges/${activeExchangeId}`] });
      toast({
        title: "Session scheduled",
        description: "Your next session has been scheduled successfully.",
      });
      setIsSessionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/user/${activeExchange?.provider?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/user/${activeExchange?.requester?.id}`] });
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });
      setIsReviewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle updating exchange status
  const handleUpdateStatus = () => {
    if (!activeExchangeId || !selectedStatus) return;
    updateStatusMutation.mutate({ id: activeExchangeId, status: selectedStatus });
  };

  // Handle scheduling next session
  const handleScheduleSession = () => {
    if (!activeExchangeId || !selectedDate) return;
    
    const dateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    dateTime.setHours(hours, minutes);
    
    updateSessionMutation.mutate({ id: activeExchangeId, nextSession: dateTime.toISOString() });
  };

  // Handle submitting a review
  const handleSubmitReview = () => {
    if (!activeExchangeId || !activeExchange) return;
    
    // Determine who is being reviewed
    const isUserRequester = activeExchange.requesterId === user?.id;
    const reviewerId = user?.id;
    const receiverId = isUserRequester ? activeExchange.providerId : activeExchange.requesterId;
    
    createReviewMutation.mutate({
      exchangeId: activeExchangeId,
      reviewerId,
      receiverId,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  // Filter exchanges by status
  const getPendingExchanges = () => exchanges?.filter((exchange: any) => exchange.status === "pending") || [];
  const getActiveExchanges = () => exchanges?.filter((exchange: any) => ["accepted", "in_progress"].includes(exchange.status)) || [];
  const getCompletedExchanges = () => exchanges?.filter((exchange: any) => exchange.status === "completed") || [];

  // Determine if current user can leave a review
  const canLeaveReview = () => {
    if (!activeExchange || activeExchange.status !== "completed") return false;
    
    // Check if user has already left a review
    // This would need to be implemented in a real app with a proper API
    return true;
  };

  // Get partner based on if user is requester or provider
  const getPartnerFromExchange = (exchange: any) => {
    const isRequester = exchange.requesterId === user?.id;
    return isRequester ? exchange.provider : exchange.requester;
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Skill Exchanges</h1>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side - Exchange List */}
                <div className="w-full lg:w-1/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Exchanges</CardTitle>
                      <CardDescription>
                        Manage your skill exchange sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="active">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="pending">
                            Pending
                            {getPendingExchanges().length > 0 && (
                              <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-1.5 rounded-full">
                                {getPendingExchanges().length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="active">
                            Active
                            {getActiveExchanges().length > 0 && (
                              <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 rounded-full">
                                {getActiveExchanges().length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pending" className="mt-4">
                          {isLoadingExchanges ? (
                            <div className="space-y-4">
                              {[...Array(2)].map((_, i) => (
                                <div key={i} className="border rounded-md p-4">
                                  <div className="flex items-center mb-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="ml-2">
                                      <Skeleton className="h-4 w-24 mb-1" />
                                      <Skeleton className="h-3 w-16" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-4 w-full mb-1" />
                                  <Skeleton className="h-4 w-2/3" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {getPendingExchanges().length > 0 ? (
                                <ul className="space-y-3">
                                  {getPendingExchanges().map((exchange: any) => {
                                    const partner = getPartnerFromExchange(exchange);
                                    const isRequester = exchange.requesterId === user?.id;
                                    const yourSkill = isRequester ? exchange.requesterSkill?.title : exchange.providerSkill?.title;
                                    const theirSkill = isRequester ? exchange.providerSkill?.title : exchange.requesterSkill?.title;
                                    const exchangeTitle = isRequester 
                                      ? `Request for ${exchange.providerSkill?.title}`
                                      : `Request for ${exchange.requesterSkill?.title}`;
                                    
                                    return (
                                      <li key={exchange.id}>
                                        <button
                                          className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 ${
                                            activeExchangeId === exchange.id ? "bg-indigo-50 border-primary" : ""
                                          }`}
                                          onClick={() => setActiveExchangeId(exchange.id)}
                                        >
                                          <div className="flex items-center mb-1">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={partner?.profileImage} alt={partner?.name} />
                                              <AvatarFallback>
                                                {partner?.name
                                                  ? partner.name
                                                      .split(' ')
                                                      .map(n => n[0])
                                                      .join('')
                                                  : '?'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-2">
                                              <p className="text-sm font-medium">{exchangeTitle}</p>
                                              <p className="text-xs text-gray-500">with {partner?.name}</p>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            {isRequester ? "You requested" : "They requested"} this exchange {
                                              format(new Date(exchange.createdAt), "MMM d, yyyy")
                                            }
                                          </p>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-gray-500 text-center py-4">No pending exchanges</p>
                              )}
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="active" className="mt-4">
                          {isLoadingExchanges ? (
                            <div className="space-y-4">
                              {[...Array(2)].map((_, i) => (
                                <div key={i} className="border rounded-md p-4">
                                  <div className="flex items-center mb-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="ml-2">
                                      <Skeleton className="h-4 w-24 mb-1" />
                                      <Skeleton className="h-3 w-16" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-4 w-full mb-1" />
                                  <Skeleton className="h-4 w-2/3" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {getActiveExchanges().length > 0 ? (
                                <ul className="space-y-3">
                                  {getActiveExchanges().map((exchange: any) => {
                                    const partner = getPartnerFromExchange(exchange);
                                    const isRequester = exchange.requesterId === user?.id;
                                    const yourSkill = isRequester ? exchange.requesterSkill?.title : exchange.providerSkill?.title;
                                    const theirSkill = isRequester ? exchange.providerSkill?.title : exchange.requesterSkill?.title;
                                    
                                    return (
                                      <li key={exchange.id}>
                                        <button
                                          className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 ${
                                            activeExchangeId === exchange.id ? "bg-indigo-50 border-primary" : ""
                                          }`}
                                          onClick={() => setActiveExchangeId(exchange.id)}
                                        >
                                          <div className="flex items-center mb-1">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={partner?.profileImage} alt={partner?.name} />
                                              <AvatarFallback>
                                                {partner?.name
                                                  ? partner.name
                                                      .split(' ')
                                                      .map(n => n[0])
                                                      .join('')
                                                  : '?'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-2">
                                              <p className="text-sm font-medium">{theirSkill}</p>
                                              <p className="text-xs text-gray-500">with {partner?.name}</p>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            {exchange.nextSession 
                                              ? `Next session: ${format(new Date(exchange.nextSession), "MMM d, h:mm a")}` 
                                              : "No session scheduled"}
                                          </p>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-gray-500 text-center py-4">No active exchanges</p>
                              )}
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="completed" className="mt-4">
                          {isLoadingExchanges ? (
                            <div className="space-y-4">
                              {[...Array(2)].map((_, i) => (
                                <div key={i} className="border rounded-md p-4">
                                  <div className="flex items-center mb-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="ml-2">
                                      <Skeleton className="h-4 w-24 mb-1" />
                                      <Skeleton className="h-3 w-16" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-4 w-full mb-1" />
                                  <Skeleton className="h-4 w-2/3" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {getCompletedExchanges().length > 0 ? (
                                <ul className="space-y-3">
                                  {getCompletedExchanges().map((exchange: any) => {
                                    const partner = getPartnerFromExchange(exchange);
                                    const isRequester = exchange.requesterId === user?.id;
                                    const yourSkill = isRequester ? exchange.requesterSkill?.title : exchange.providerSkill?.title;
                                    const theirSkill = isRequester ? exchange.providerSkill?.title : exchange.requesterSkill?.title;
                                    
                                    return (
                                      <li key={exchange.id}>
                                        <button
                                          className={`w-full text-left p-3 border rounded-md hover:bg-gray-50 ${
                                            activeExchangeId === exchange.id ? "bg-indigo-50 border-primary" : ""
                                          }`}
                                          onClick={() => setActiveExchangeId(exchange.id)}
                                        >
                                          <div className="flex items-center mb-1">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage src={partner?.profileImage} alt={partner?.name} />
                                              <AvatarFallback>
                                                {partner?.name
                                                  ? partner.name
                                                      .split(' ')
                                                      .map(n => n[0])
                                                      .join('')
                                                  : '?'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-2">
                                              <p className="text-sm font-medium">{theirSkill}</p>
                                              <p className="text-xs text-gray-500">with {partner?.name}</p>
                                            </div>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Completed on {format(new Date(exchange.updatedAt || exchange.createdAt), "MMM d, yyyy")}
                                          </p>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-gray-500 text-center py-4">No completed exchanges</p>
                              )}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => setLocation("/discover")}
                        className="w-full"
                        variant="outline"
                      >
                        Find More Skills to Exchange
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Right side - Exchange Details */}
                <div className="w-full lg:w-2/3">
                  {isLoadingActiveExchange && activeExchangeId ? (
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-2 mt-4">
                          <Skeleton className="h-10 w-32 rounded" />
                          <Skeleton className="h-10 w-32 rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ) : activeExchange ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Exchange Details</CardTitle>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activeExchange.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            activeExchange.status === "accepted" ? "bg-green-100 text-green-800" :
                            activeExchange.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                            activeExchange.status === "completed" ? "bg-green-100 text-green-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {activeExchange.status.charAt(0).toUpperCase() + activeExchange.status.slice(1).replace("_", " ")}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Created on {format(new Date(activeExchange.createdAt), "MMMM d, yyyy")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Partner Info */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Exchange Partner</h3>
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={
                                  activeExchange.requesterId === user?.id 
                                    ? activeExchange.provider?.profileImage 
                                    : activeExchange.requester?.profileImage
                                } 
                                alt={
                                  activeExchange.requesterId === user?.id 
                                    ? activeExchange.provider?.name 
                                    : activeExchange.requester?.name
                                } 
                              />
                              <AvatarFallback>
                                {(activeExchange.requesterId === user?.id 
                                  ? activeExchange.provider?.name 
                                  : activeExchange.requester?.name)
                                    ?.split(' ')
                                    .map(n => n[0])
                                    .join('') || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">
                                {activeExchange.requesterId === user?.id 
                                  ? activeExchange.provider?.name 
                                  : activeExchange.requester?.name}
                              </p>
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-primary"
                                onClick={() => setLocation(
                                  `/profile/${activeExchange.requesterId === user?.id 
                                    ? activeExchange.providerId 
                                    : activeExchange.requesterId}`
                                )}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Skills Being Exchanged */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Skills Being Exchanged</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded-md p-4">
                              <p className="font-medium text-gray-900 mb-1">You're {activeExchange.requesterId === user?.id ? "offering" : "receiving"}</p>
                              <p className="text-gray-700">
                                {activeExchange.requesterId === user?.id 
                                  ? activeExchange.requesterSkill?.title 
                                  : activeExchange.providerSkill?.title}
                              </p>
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-primary mt-2"
                                onClick={() => setLocation(
                                  `/skill/${activeExchange.requesterId === user?.id 
                                    ? activeExchange.requesterSkillId 
                                    : activeExchange.providerSkillId}`
                                )}
                              >
                                View Skill Details
                              </Button>
                            </div>
                            <div className="border rounded-md p-4">
                              <p className="font-medium text-gray-900 mb-1">You're {activeExchange.requesterId === user?.id ? "receiving" : "offering"}</p>
                              <p className="text-gray-700">
                                {activeExchange.requesterId === user?.id 
                                  ? activeExchange.providerSkill?.title 
                                  : activeExchange.requesterSkill?.title}
                              </p>
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-primary mt-2"
                                onClick={() => setLocation(
                                  `/skill/${activeExchange.requesterId === user?.id 
                                    ? activeExchange.providerSkillId 
                                    : activeExchange.requesterSkillId}`
                                )}
                              >
                                View Skill Details
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Next Session */}
                        {(activeExchange.status === "accepted" || activeExchange.status === "in_progress") && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Next Session</h3>
                            {activeExchange.nextSession ? (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon="calendar" className="text-gray-400 mr-2" />
                                <p className="text-gray-700">
                                  {format(new Date(activeExchange.nextSession), "MMMM d, yyyy 'at' h:mm a")}
                                </p>
                                <Button 
                                  variant="link" 
                                  className="ml-2 p-0 h-auto text-primary"
                                  onClick={() => {
                                    const nextSession = new Date(activeExchange.nextSession);
                                    setSelectedDate(nextSession);
                                    setSelectedTime(
                                      `${nextSession.getHours().toString().padStart(2, '0')}:${
                                        nextSession.getMinutes().toString().padStart(2, '0')
                                      }`
                                    );
                                    setIsSessionDialogOpen(true);
                                  }}
                                >
                                  Reschedule
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedDate(new Date());
                                  setSelectedTime("12:00");
                                  setIsSessionDialogOpen(true);
                                }}
                              >
                                Schedule a Session
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          {activeExchange.status === "pending" && activeExchange.providerId === user?.id && (
                            <>
                              <Button
                                onClick={() => {
                                  setSelectedStatus("accepted");
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                Accept Request
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedStatus("rejected");
                                  setIsStatusDialogOpen(true);
                                }}
                              >
                                Decline Request
                              </Button>
                            </>
                          )}

                          {activeExchange.status === "accepted" && (
                            <Button
                              onClick={() => {
                                setSelectedStatus("in_progress");
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              Mark as In Progress
                            </Button>
                          )}

                          {activeExchange.status === "in_progress" && (
                            <Button
                              onClick={() => {
                                setSelectedStatus("completed");
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              Mark as Completed
                            </Button>
                          )}

                          {activeExchange.status === "completed" && canLeaveReview() && (
                            <Button
                              onClick={() => {
                                setReviewRating(5);
                                setReviewComment("");
                                setIsReviewDialogOpen(true);
                              }}
                            >
                              Leave a Review
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            onClick={() => setLocation(`/messages/${
                              activeExchange.requesterId === user?.id 
                                ? activeExchange.providerId 
                                : activeExchange.requesterId
                            }`)}
                          >
                            Message Partner
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Exchange</h3>
                        <p className="text-gray-500 mb-4">
                          Select an exchange from the list to view its details
                        </p>
                        {exchanges && exchanges.length === 0 && (
                          <Button
                            onClick={() => setLocation("/discover")}
                          >
                            Find Skills to Exchange
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Session Scheduling Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Session</DialogTitle>
            <DialogDescription>
              Pick a date and time for your next skill exchange session
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <FontAwesomeIcon icon="calendar" className="mr-2" />
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSessionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSession}
              disabled={!selectedDate || updateSessionMutation.isPending}
            >
              {updateSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : "Schedule Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStatus === "accepted" ? "Accept Exchange Request" :
               selectedStatus === "in_progress" ? "Mark as In Progress" :
               selectedStatus === "completed" ? "Mark as Completed" :
               "Decline Exchange Request"}
            </DialogTitle>
            <DialogDescription>
              {selectedStatus === "accepted" ? "Accept this exchange request to start collaborating" :
               selectedStatus === "in_progress" ? "Mark this exchange as in progress" :
               selectedStatus === "completed" ? "Mark this exchange as completed" :
               "Decline this exchange request"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              {selectedStatus === "accepted" ? "Are you sure you want to accept this exchange request?" :
               selectedStatus === "in_progress" ? "This will mark the exchange as in progress. Proceed?" :
               selectedStatus === "completed" ? "This will mark the exchange as completed. You'll be able to leave a review afterwards." :
               "Are you sure you want to decline this exchange request?"}
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
              variant={selectedStatus === "rejected" ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : selectedStatus === "accepted" ? "Accept" :
                 selectedStatus === "in_progress" ? "Mark as In Progress" :
                 selectedStatus === "completed" ? "Mark as Completed" :
                 "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with this skill exchange
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className="text-2xl focus:outline-none"
                    onClick={() => setReviewRating(rating)}
                  >
                    <FontAwesomeIcon 
                      icon="star" 
                      className={rating <= reviewRating ? "text-yellow-400" : "text-gray-300"} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
