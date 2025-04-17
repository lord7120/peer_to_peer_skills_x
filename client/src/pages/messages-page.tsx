import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const { userId } = useParams();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Fetch active conversation
  const { data: activeConversation, isLoading: isLoadingActiveConversation } = useQuery({
    queryKey: [`/api/messages/${userId}`],
    enabled: !!userId && !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("POST", `/api/messages/${messageId}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: (error) => {
      console.error("Error marking message as read:", error);
    }
  });

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userId) return;
    
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: parseInt(userId),
      content: newMessage,
    });
  };

  // Mark any unread messages as read when viewing a conversation
  useEffect(() => {
    if (activeConversation?.messages && userId) {
      activeConversation.messages.forEach((message: any) => {
        if (message.receiverId === user?.id && !message.read) {
          markAsReadMutation.mutate(message.id);
        }
      });
    }
  }, [activeConversation, userId, user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Select the first conversation if none is selected
  useEffect(() => {
    if (!userId && conversations && conversations.length > 0) {
      setLocation(`/messages/${conversations[0].user.id}`);
    }
  }, [userId, conversations, setLocation]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col md:flex-row">
            {/* Conversation List */}
            <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              </div>

              <ScrollArea className="flex-1">
                {isLoadingConversations ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations?.length > 0 ? (
                  <div>
                    {conversations.map((conversation: any) => {
                      const latestMessage = conversation.messages[0];
                      const hasUnread = conversation.messages.some(
                        (msg: any) => msg.receiverId === user?.id && !msg.read
                      );
                      const isActive = userId === conversation.user.id.toString();

                      return (
                        <div key={conversation.user.id}>
                          <button
                            className={`w-full p-4 text-left hover:bg-gray-50 ${
                              isActive ? "bg-indigo-50" : ""
                            }`}
                            onClick={() => setLocation(`/messages/${conversation.user.id}`)}
                          >
                            <div className="flex items-center">
                              <Avatar>
                                <AvatarImage src={conversation.user.profileImage} alt={conversation.user.name} />
                                <AvatarFallback>
                                  {conversation.user.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3 overflow-hidden">
                                <p className={`text-sm font-medium ${
                                  hasUnread ? "text-gray-900" : "text-gray-700"
                                }`}>
                                  {conversation.user.name}
                                  {hasUnread && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {latestMessage.content}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </button>
                          <Separator />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No conversations yet.</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 flex flex-col bg-gray-50 h-full">
              {userId ? (
                <>
                  {/* Conversation Header */}
                  {isLoadingActiveConversation ? (
                    <div className="p-4 bg-white border-b flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ) : activeConversation ? (
                    <div className="p-4 bg-white border-b flex items-center">
                      <Avatar>
                        <AvatarImage src={activeConversation.user?.profileImage} alt={activeConversation.user?.name} />
                        <AvatarFallback>
                          {activeConversation.user?.name
                            ? activeConversation.user.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                            : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{activeConversation.user?.name}</p>
                      </div>
                      <div className="ml-auto">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/profile/${activeConversation.user?.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {isLoadingActiveConversation ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex items-start ${i % 2 === 0 ? 'justify-end' : ''}`}>
                            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
                            <Skeleton className={`h-24 w-2/3 rounded-lg ${i % 2 === 0 ? 'bg-blue-100' : 'bg-white'}`} />
                          </div>
                        ))}
                      </div>
                    ) : activeConversation?.messages ? (
                      <div className="space-y-4">
                        {activeConversation.messages.map((message: any) => {
                          const isSentByUser = message.senderId === user?.id;
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`flex items-start ${isSentByUser ? 'justify-end' : ''}`}
                            >
                              {!isSentByUser && (
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage 
                                    src={activeConversation.user?.profileImage} 
                                    alt={activeConversation.user?.name} 
                                  />
                                  <AvatarFallback>
                                    {activeConversation.user?.name
                                      ? activeConversation.user.name
                                          .split(' ')
                                          .map(n => n[0])
                                          .join('')
                                      : '?'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div 
                                  className={`rounded-lg px-4 py-2 max-w-md ${
                                    isSentByUser 
                                      ? 'bg-primary text-white' 
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <p>{message.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No messages yet.</p>
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t mt-auto">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Send
                            <FontAwesomeIcon icon="arrow-right" className="ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                      <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                      <p className="text-gray-500 mb-4">
                        {conversations?.length > 0 
                          ? "Select a conversation to start chatting"
                          : "You don't have any messages yet"}
                      </p>
                      <Button onClick={() => setLocation("/discover")}>
                        Find Skills to Exchange
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
