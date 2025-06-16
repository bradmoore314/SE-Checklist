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
import { useAuth } from "@/hooks/useAuth";
import ProjectSwitcher from "@/components/ProjectSwitcher";
import kastleLogo from "@/assets/kastle-logo.png";

interface TopNavProps {
  project: Project | null;
  onToggleSidebar: () => void;
  user: any;
  sidebarCollapsed?: boolean;
  storageStatus?: React.ReactNode;
}

export default function TopNav({ project, onToggleSidebar, user, sidebarCollapsed = false, storageStatus }: TopNavProps) {
  const { signOut, user: currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to get user initials for avatar
  const getUserInitials = (user: any): string => {
    if (user?.user_metadata?.full_name) {
      const nameParts = user.user_metadata.full_name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.user_metadata.full_name[0]?.toUpperCase() || '?';
    }
    if (user?.email) {
      return user.email[0]?.toUpperCase() || '?';
    }
    return '?';
  };

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-white shadow-sm"
            style={{ borderColor: 'var(--medium-grey)' }}>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="mr-2 sm:mr-4 text-gray-600 hover:text-gray-900"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-icons">{sidebarCollapsed ? "menu_open" : "menu"}</span>
        </Button>
        
        {/* Kastle Logo - Hidden on smallest screens */}
        <img 
          src={kastleLogo} 
          alt="Kastle Logo" 
          className="hidden xs:block h-8 sm:h-10 mr-2 sm:mr-4" 
        />
        
        {/* Project Switcher */}
        <ProjectSwitcher />
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Storage Status */}
        {storageStatus && (
          <div className="hidden sm:block">
            {storageStatus}
          </div>
        )}
        
        {/* More menu for smaller screens */}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="material-icons">more_vert</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-1 border rounded-lg shadow-sm bg-white" align="end">
              <DropdownMenuItem asChild className="focus:bg-gray-100">
                <Link href="/documentation" className="flex w-full cursor-pointer text-gray-800">
                  <span className="material-icons mr-2 text-sm">menu_book</span>
                  <span>Documentation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-gray-100">
                <Link href="/feedback" className="flex w-full cursor-pointer text-gray-800">
                  <span className="material-icons mr-2 text-sm">bug_report</span>
                  <span>Feedback</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-gray-100">
                <Link href="/projects" className="flex w-full cursor-pointer text-gray-800">
                  <span className="material-icons mr-2 text-sm">add</span>
                  <span>New Site Walk</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Desktop navigation items - Hidden on mobile */}
        <div className="hidden md:flex md:items-center">
          <Link href="/documentation">
            <Button 
              variant="outline" 
              className="text-gray-700 hover:text-gray-900 mr-2 sm:mr-4 flex items-center text-xs sm:text-sm"
            >
              <span className="material-icons mr-1 text-sm sm:text-base">menu_book</span>
              <span className="hidden sm:inline">Documentation</span>
            </Button>
          </Link>
          <Link href="/feedback">
            <Button 
              variant="outline" 
              className="text-gray-700 hover:text-gray-900 mr-2 sm:mr-4 flex items-center text-xs sm:text-sm"
            >
              <span className="material-icons mr-1 text-sm sm:text-base">bug_report</span>
              <span className="hidden sm:inline">Feedback</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-gray-900 mr-2 sm:mr-4"
          >
            <span className="material-icons text-sm sm:text-base">notifications</span>
          </Button>

          <Link href="/projects">
            <Button 
              className="text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md flex items-center mr-2 sm:mr-4 text-xs sm:text-sm"
              style={{ backgroundColor: 'var(--red-accent)' }}
            >
              <span className="material-icons mr-1 text-sm sm:text-base">add</span>
              <span className="hidden xs:inline">New Site Walk</span>
            </Button>
          </Link>
        </div>
        
        {/* User menu - Always visible */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
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
                style={{ color: 'var(--red-accent)' }}
                className="cursor-pointer focus:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
