import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { isAuthenticated, isLoading, login, register } = useSession();
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    bio: "",
    profileImage: ""
  });
  const [registerError, setRegisterError] = useState("");
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!loginForm.username.trim() || !loginForm.password) {
      setLoginError("Username and password are required");
      return;
    }
    
    try {
      setIsLoginSubmitting(true);
      await login(loginForm);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : String(error));
      console.error("Login error:", error);
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  // Handle register form submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    // Simple validation
    if (!registerForm.username.trim() || !registerForm.email.trim() || !registerForm.name.trim() || !registerForm.password) {
      setRegisterError("All fields except bio and profile image are required");
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    
    try {
      setIsRegisterSubmitting(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = registerForm;
      await register(userData);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : String(error));
      console.error("Registration error:", error);
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  // Update login form inputs
  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };
  
  // Update register form inputs
  const updateRegisterForm = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };

  // Redirect if user is already logged in
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white">
                <FontAwesomeIcon icon="people-arrows" />
              </div>
              <h1 className="ml-3 text-3xl font-bold text-gray-900">SkillX</h1>
            </div>
            <p className="mt-2 text-gray-600">Peer-to-Peer Skill Exchange Platform</p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your username and password to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {loginError && (
                      <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">{loginError}</div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Username
                      </label>
                      <Input 
                        type="text"
                        placeholder="Your username" 
                        value={loginForm.username}
                        onChange={(e) => updateLoginForm('username', e.target.value)}
                        disabled={isLoginSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Password
                      </label>
                      <Input 
                        type="password" 
                        placeholder="Your password" 
                        value={loginForm.password}
                        onChange={(e) => updateLoginForm('password', e.target.value)}
                        disabled={isLoginSubmitting}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoginSubmitting}
                    >
                      {isLoginSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : "Log in"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button 
                        className="text-primary hover:underline"
                        onClick={() => setActiveTab("register")}
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Fill in the details to join our skill exchange platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {registerError && (
                      <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">{registerError}</div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Username
                      </label>
                      <Input 
                        type="text"
                        placeholder="Choose a username" 
                        value={registerForm.username}
                        onChange={(e) => updateRegisterForm('username', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Email
                      </label>
                      <Input 
                        type="email" 
                        placeholder="Your email address" 
                        value={registerForm.email}
                        onChange={(e) => updateRegisterForm('email', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Full Name
                      </label>
                      <Input 
                        type="text"
                        placeholder="Your full name" 
                        value={registerForm.name}
                        onChange={(e) => updateRegisterForm('name', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Password
                      </label>
                      <Input 
                        type="password" 
                        placeholder="Create a password" 
                        value={registerForm.password}
                        onChange={(e) => updateRegisterForm('password', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Confirm Password
                      </label>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        value={registerForm.confirmPassword}
                        onChange={(e) => updateRegisterForm('confirmPassword', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Bio (Optional)
                      </label>
                      <Input 
                        type="text"
                        placeholder="A brief description about yourself" 
                        value={registerForm.bio}
                        onChange={(e) => updateRegisterForm('bio', e.target.value)}
                        disabled={isRegisterSubmitting}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isRegisterSubmitting}
                    >
                      {isRegisterSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : "Register"}
                    </Button>
                  </form>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <button 
                        className="text-primary hover:underline"
                        onClick={() => setActiveTab("login")}
                      >
                        Log in here
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-10">
        <div className="max-w-md text-white">
          <h2 className="text-3xl font-bold mb-6">Exchange Skills, Grow Together</h2>
          <p className="text-lg mb-8">
            SkillX is a platform where people can exchange skills with each other. 
            Teach what you know, learn what you don't. Build connections and grow your abilities.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon="check" className="text-green-300" />
              </div>
              <p className="ml-3">Share your expertise in any field from programming to photography</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon="check" className="text-green-300" />
              </div>
              <p className="ml-3">Find people with the skills you want to learn</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon="check" className="text-green-300" />
              </div>
              <p className="ml-3">Arrange sessions, track progress, and build your network</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon="check" className="text-green-300" />
              </div>
              <p className="ml-3">Earn ratings and build your reputation as a skilled mentor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}