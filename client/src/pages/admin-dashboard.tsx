import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isDeleteSkillDialogOpen, setIsDeleteSkillDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Fetch skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ["/api/admin/skills"],
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      setIsDeleteUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const res = await apiRequest("DELETE", `/api/skills/${skillId}`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
      toast({
        title: "Skill deleted",
        description: "The skill has been deleted successfully.",
      });
      setIsDeleteSkillDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle deleting a user
  const handleDeleteUser = () => {
    if (!selectedUserId) return;
    deleteUserMutation.mutate(selectedUserId);
  };

  // Handle deleting a skill
  const handleDeleteSkill = () => {
    if (!selectedSkillId) return;
    deleteSkillMutation.mutate(selectedSkillId);
  };

  // Filter users based on search term
  const filteredUsers = users
    ? users.filter((user: any) => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Filter skills based on search term
  const filteredSkills = skills
    ? skills.filter((skill: any) => 
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>

              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>
                      Key statistics for your platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-indigo-100 text-primary">
                            <FontAwesomeIcon icon="user" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{users?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <FontAwesomeIcon icon="lightbulb" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Skills</p>
                            <p className="text-2xl font-semibold text-gray-900">{skills?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                            <FontAwesomeIcon icon="exchange-alt" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Active Exchanges</p>
                            <p className="text-2xl font-semibold text-gray-900">-</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <Input
                    placeholder="Search users or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Tabs defaultValue="users">
                  <TabsList className="mb-4">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="users">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                          Manage all users on the platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingUsers ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-64" />
                              </div>
                            </div>
                            <Skeleton className="h-[1px] w-full" />
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-64" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>User</TableHead>
                                  <TableHead>Username</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Joined</TableHead>
                                  <TableHead>Admin</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredUsers.length > 0 ? (
                                  filteredUsers.map((user: any) => (
                                    <TableRow key={user.id}>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <Avatar className="h-8 w-8 mr-2">
                                            <AvatarImage src={user.profileImage} alt={user.name} />
                                            <AvatarFallback>
                                              {user.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                          {user.name}
                                        </div>
                                      </TableCell>
                                      <TableCell>{user.username}</TableCell>
                                      <TableCell>{user.email}</TableCell>
                                      <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                                      <TableCell>
                                        {user.isAdmin ? (
                                          <Badge className="bg-primary text-white">Admin</Badge>
                                        ) : (
                                          <span className="text-gray-500">No</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation(`/profile/${user.id}`)}
                                          >
                                            View
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              setSelectedUserId(user.id);
                                              setIsDeleteUserDialogOpen(true);
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                      No users found
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="skills">
                    <Card>
                      <CardHeader>
                        <CardTitle>Skill Management</CardTitle>
                        <CardDescription>
                          Manage all skills on the platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSkills ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-48" />
                              </div>
                            </div>
                            <Skeleton className="h-[1px] w-full" />
                            <div className="flex items-center space-x-4">
                              <div className="space-y-2 w-full">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-4 w-48" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Title</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>User</TableHead>
                                  <TableHead>Created</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredSkills.length > 0 ? (
                                  filteredSkills.map((skill: any) => (
                                    <TableRow key={skill.id}>
                                      <TableCell>{skill.title}</TableCell>
                                      <TableCell>{skill.category}</TableCell>
                                      <TableCell>
                                        <Badge className={skill.isOffering ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                          {skill.isOffering ? "Offering" : "Requesting"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>User #{skill.userId}</TableCell>
                                      <TableCell>{format(new Date(skill.createdAt), "MMM d, yyyy")}</TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setLocation(`/skill/${skill.id}`)}
                                          >
                                            View
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              setSelectedSkillId(skill.id);
                                              setIsDeleteSkillDialogOpen(true);
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                      No skills found
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Skill Dialog */}
      <Dialog open={isDeleteSkillDialogOpen} onOpenChange={setIsDeleteSkillDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSkillDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSkill}
              disabled={deleteSkillMutation.isPending}
            >
              {deleteSkillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
