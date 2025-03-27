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
    <header className="flex items-center justify-between px-6 py-3 border-b" 
            style={{ backgroundColor: 'var(--darker-grey)', borderColor: 'var(--medium-grey)' }}>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="mr-4 text-gray-300 hover:text-white"
        >
          <span className="material-icons">menu</span>
        </Button>
        <div>
          <h1 className="text-xl font-medium text-white">
            {project ? project.name : "Welcome to Site Walk Checklist"}
          </h1>
          <div className="text-sm text-gray-400">
            {project ? project.client : "Select or create a site walk to get started"}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-300 hover:text-white mr-4"
        >
          <span className="material-icons">notifications</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-300 hover:text-white mr-4"
        >
          <span className="material-icons">help_outline</span>
        </Button>
        <Link href="/projects/new">
          <Button 
            className="text-white px-4 py-2 rounded-md flex items-center mr-4"
            style={{ backgroundColor: 'var(--red-accent)' }}
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
                  <AvatarFallback style={{ backgroundColor: 'var(--red-accent)', color: 'white' }}>
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border rounded-lg shadow-sm" 
                                 style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }} 
                                 align="end">
              <div className="p-2">
                <p className="font-medium text-white">{user.fullName || user.username}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <DropdownMenuSeparator style={{ backgroundColor: 'var(--medium-grey)' }} />
              <DropdownMenuItem asChild className="focus:bg-zinc-700">
                <Link href="/settings" className="flex w-full cursor-pointer text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ backgroundColor: 'var(--medium-grey)' }} />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                style={{ color: 'var(--red-accent)' }}
                className="cursor-pointer focus:bg-zinc-700"
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
