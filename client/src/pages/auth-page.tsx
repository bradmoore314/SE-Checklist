import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, ShieldCheck } from "lucide-react";
import kastleLogo from "@/assets/kastle-logo.png";
import { Separator } from "@/components/ui/separator";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(3, "Full name is required").optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { 
    user, 
    isLoading, 
    loginMutation, 
    registerMutation, 
    bypassAuth, 
    microsoftAuthConfigured,
    microsoftAuthStatusLoading 
  } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
    },
  });
  
  const onLogin = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
  };
  
  const onRegister = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync(values);
  };

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex h-screen">
      {/* Form Column */}
      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <img src={kastleLogo} alt="Kastle Logo" className="w-48" />
          </div>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 border-b border-primary/20">
              <TabsTrigger value="login" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border border-primary/20">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="w-full space-y-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-white">Or continue with</span>
                      </div>
                    </div>
                    {microsoftAuthStatusLoading ? (
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full bg-gray-600 hover:bg-gray-600 text-white hover:text-white border-0"
                        disabled
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking Microsoft Authentication...
                      </Button>
                    ) : microsoftAuthConfigured ? (
                      <a href="/auth/azure">
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full bg-[#0078d4] hover:bg-[#0078d4]/90 text-white hover:text-white border-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="18" height="18" className="mr-2">
                            <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                            <path fill="#0078d4" d="M1 1h10v10H1z"/>
                            <path fill="#0078d4" d="M12 1h10v10H12z"/>
                            <path fill="#0078d4" d="M1 12h10v10H1z"/>
                            <path fill="#0078d4" d="M12 12h10v10H12z"/>
                          </svg>
                          Microsoft
                        </Button>
                      </a>
                    ) : (
                      <div className="rounded-md bg-yellow-50 p-3 text-sm border border-yellow-200">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-yellow-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-2 text-yellow-700">
                            <p>Microsoft login requires Azure configuration. Contact your administrator to enable this feature.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white text-center">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 text-white" 
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border border-primary/20">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Create an Account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="w-full space-y-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-white">Or sign up with</span>
                      </div>
                    </div>
                    {microsoftAuthStatusLoading ? (
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full bg-gray-600 hover:bg-gray-600 text-white hover:text-white border-0"
                        disabled
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking Microsoft Authentication...
                      </Button>
                    ) : microsoftAuthConfigured ? (
                      <a href="/auth/azure">
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full bg-[#0078d4] hover:bg-[#0078d4]/90 text-white hover:text-white border-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="18" height="18" className="mr-2">
                            <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                            <path fill="#0078d4" d="M1 1h10v10H1z"/>
                            <path fill="#0078d4" d="M12 1h10v10H12z"/>
                            <path fill="#0078d4" d="M1 12h10v10H1z"/>
                            <path fill="#0078d4" d="M12 12h10v10H12z"/>
                          </svg>
                          Microsoft
                        </Button>
                      </a>
                    ) : (
                      <div className="rounded-md bg-yellow-50 p-3 text-sm border border-yellow-200">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 text-yellow-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-2 text-yellow-700">
                            <p>Microsoft login requires Azure configuration. Contact your administrator to enable this feature.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white text-center">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0 text-white" 
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Hero Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-900 to-gray-950 border-l border-primary/20 flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <ShieldCheck className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Kastle Wizard
          </h1>
          <p className="text-lg text-white mb-8">
            The comprehensive security equipment management solution for professionals. Design, configure, and visualize your entire security infrastructure.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium text-primary">Advanced PDF Floorplan Annotation</h3>
                <p className="text-sm text-white">Place and configure security equipment with precision on floorplans</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium text-primary">AI-Powered Analysis & Configuration</h3>
                <p className="text-sm text-white">Leverage Azure OpenAI in Kastle's secure environment for intelligent security equipment configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium text-primary">Comprehensive Documentation</h3>
                <p className="text-sm text-white">Generate professional reports, door schedules, and SOW documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}