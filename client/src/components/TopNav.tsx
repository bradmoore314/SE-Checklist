import { Project, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface TopNavProps {
  project: Project | null;
  onToggleSidebar: () => void;
  user: User | null;
}

export default function TopNav({ project, onToggleSidebar, user }: TopNavProps) {
  const { logoutMutation } = useAuth();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Function to get user initials for avatar
  const getUserInitials = (user: User): string => {
    if (user.fullName) {
      const nameParts = user.fullName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.fullName[0]?.toUpperCase() || user.username[0]?.toUpperCase() || '?';
    }
    return user.username[0]?.toUpperCase() || '?';
  };

  return (
    <header className="bg-card border-b border-border flex items-center justify-between px-6 py-3">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="mr-4 hover:text-primary"
        >
          <span className="material-icons">menu</span>
        </Button>
        <div>
          <h1 className="text-xl font-medium">
            {project ? project.name : "Welcome to Site Walk Checklist"}
          </h1>
          <div className="text-sm text-muted-foreground">
            {project ? project.client : "Select or create a site walk to get started"}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:text-primary mr-4"
        >
          <span className="material-icons">notifications</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:text-primary mr-4"
        >
          <span className="material-icons">help_outline</span>
        </Button>
        <Link href="/projects/new">
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-4 py-2 rounded-md flex items-center mr-4"
          >
            <span className="material-icons mr-1">add</span>
            New Site Walk
          </Button>
        </Link>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="p-2">
                <p className="font-medium">{user.fullName || user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
