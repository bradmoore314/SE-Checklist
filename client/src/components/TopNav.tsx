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
import ProjectSwitcher from "@/components/ProjectSwitcher";
import kastleLogo from "@/assets/kastle-logo.png";

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
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm"
            style={{ borderColor: 'var(--medium-grey)' }}>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <span className="material-icons">menu</span>
        </Button>
        
        {/* Kastle Logo */}
        <img 
          src={kastleLogo} 
          alt="Kastle Logo" 
          className="h-10 mr-4" 
        />
        
        {/* Project Switcher */}
        <ProjectSwitcher />
      </div>
      
      <div className="flex items-center">
        <Link href="/documentation">
          <Button 
            variant="outline" 
            className="text-gray-700 hover:text-gray-900 mr-4 flex items-center"
          >
            <span className="material-icons mr-1">menu_book</span>
            Documentation
          </Button>
        </Link>
        <Link href="/feedback">
          <Button 
            variant="outline" 
            className="text-gray-700 hover:text-gray-900 mr-4 flex items-center"
          >
            <span className="material-icons mr-1">bug_report</span>
            Feedback
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          <span className="material-icons">notifications</span>
        </Button>

        <Link href="/projects">
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
            <DropdownMenuContent className="w-56 border rounded-lg shadow-sm bg-white" 
                                 style={{ borderColor: 'var(--medium-grey)' }} 
                                 align="end">
              <div className="p-2">
                <p className="font-medium text-gray-900">{user.fullName || user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <DropdownMenuSeparator style={{ backgroundColor: 'var(--medium-grey)' }} />
              <DropdownMenuItem asChild className="focus:bg-gray-100">
                <Link href="/settings" className="flex w-full cursor-pointer text-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ backgroundColor: 'var(--medium-grey)' }} />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                style={{ color: 'var(--red-accent)' }}
                className="cursor-pointer focus:bg-gray-100"
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
