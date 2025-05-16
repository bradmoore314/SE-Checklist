import { Link, useLocation } from "wouter";
import { useOpportunity } from "@/contexts/OpportunityContext";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();
  const { currentOpportunity } = useOpportunity();

  // Function to determine if a link is active
  const isActive = (path: string) => {
    // Special case for Opportunities - should be active for both "/" and "/projects"
    if (path === "/projects") {
      return location === "/" || location === "/projects";
    }
    // Dashboard should only be active when explicitly on /dashboard
    if (path === "/") {
      return false; // Never highlight Dashboard when on root path
    }
    return location === path;
  };

  return (
    <div className={`${collapsed ? "w-16" : "w-64"} transition-width shadow-md flex flex-col h-full sidebar bg-white border-r`}>
      {/* App Logo */}
      <div className="p-4 border-b flex items-center" style={{ borderColor: 'var(--medium-grey)' }}>
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
          <img 
            src="/src/assets/castle-logo.png" 
            alt="Castle Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        {!collapsed && <span className="ml-2 text-xl font-semibold text-gray-900">Checklist Wizard</span>}
      </div>
      
      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b flex items-center" style={{ borderColor: 'var(--medium-grey)' }}>
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <img 
              src="/src/assets/checklist-wizard-logo.png" 
              alt="Checklist Wizard Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">Sales Engineer</div>
            <div className="text-sm text-gray-600">Checklist Wizard</div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 text-xs uppercase text-gray-400 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "OPPORTUNITIES"}
        </div>
        
        <div>
          <Link href="/projects">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/projects") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/projects") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/projects") ? "text-white" : "text-gray-600"}`}>folder</span>
              {!collapsed && <span className={isActive("/projects") ? "text-white" : "text-gray-800 font-medium"}>Opportunities</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/") ? "text-white" : "text-gray-600"}`}>dashboard</span>
              {!collapsed && <span className={isActive("/") ? "text-white" : "text-gray-800 font-medium"}>Dashboard</span>}
            </div>
          </Link>
        </div>
        
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 mt-4 text-xs uppercase text-gray-400 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "EQUIPMENT"}
        </div>
        
        <div>
          <Link href="/card-access">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/card-access") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/card-access") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/card-access") ? "text-white" : "text-gray-600"}`}>meeting_room</span>
              {!collapsed && <span className={isActive("/card-access") ? "text-white" : "text-gray-800 font-medium"}>Card Access</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/cameras">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/cameras") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/cameras") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/cameras") ? "text-white" : "text-gray-600"}`}>videocam</span>
              {!collapsed && <span className={isActive("/cameras") ? "text-white" : "text-gray-800 font-medium"}>Cameras</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/elevators">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/elevators") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/elevators") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/elevators") ? "text-white" : "text-gray-600"}`}>elevator</span>
              {!collapsed && <span className={isActive("/elevators") ? "text-white" : "text-gray-800 font-medium"}>Elevators & Turnstiles</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/intercoms">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/intercoms") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/intercoms") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/intercoms") ? "text-white" : "text-gray-600"}`}>call</span>
              {!collapsed && <span className={isActive("/intercoms") ? "text-white" : "text-gray-800 font-medium"}>Intercoms</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/kastle-video-guarding">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/kastle-video-guarding") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/kastle-video-guarding") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/kastle-video-guarding") ? "text-white" : "text-gray-600"}`}>video_camera_front</span>
              {!collapsed && <span className={isActive("/kastle-video-guarding") ? "text-white" : "text-gray-800 font-medium"}>Kastle Video Guarding</span>}
            </div>
          </Link>
        </div>
        
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 mt-4 text-xs uppercase text-gray-400 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "FLOORPLANS"}
        </div>
        
        <div>
          {currentOpportunity ? (
            // If we have a current opportunity, use its ID
            <Link href={`/projects/${currentOpportunity.id}/enhanced-floorplans`}>
              <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
                location.includes("/floorplans") 
                  ? "border-r-4 nav-item active" 
                  : "nav-item hover:bg-gray-100"
              } cursor-pointer`}
                 style={location.includes("/floorplans") ? { 
                   backgroundColor: 'var(--red-accent)', 
                   borderColor: 'var(--red-accent)' 
                 } : {}}>
                <span className={`material-icons ${collapsed ? "" : "mr-3"} ${location.includes("/floorplans") ? "text-white" : "text-gray-600"}`}>map</span>
                {!collapsed && <span className={location.includes("/floorplans") ? "text-white" : "text-gray-800 font-medium"}>Floorplans</span>}
              </div>
            </Link>
          ) : (
            // If no current opportunity, link to projects page first
            <Link href="/projects">
              <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 nav-item hover:bg-gray-100 cursor-pointer`}>
                <span className={`material-icons ${collapsed ? "" : "mr-3"} text-gray-600`}>map</span>
                {!collapsed && <span className="text-gray-800 font-medium">Floorplans</span>}
              </div>
            </Link>
          )}
        </div>

        <div className={`${collapsed ? "px-2" : "px-4"} py-2 mt-4 text-xs uppercase text-gray-400 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "REPORTS"}
        </div>
        
        {/* Door Schedules and Camera Schedules removed - export functionality moved to equipment tabs */}
        
        <div>
          <Link href="/misc">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/misc") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/misc") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/misc") ? "text-white" : "text-gray-600"}`}>inventory_2</span>
              {!collapsed && <span className={isActive("/misc") ? "text-white" : "text-gray-800 font-medium"}>Miscellaneous</span>}
            </div>
          </Link>
        </div>
        
        <div>
          <Link href="/project-summary">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${
              isActive("/project-summary") 
                ? "border-r-4 nav-item active" 
                : "nav-item hover:bg-gray-100"
            } cursor-pointer`}
               style={isActive("/project-summary") ? { 
                 backgroundColor: 'var(--red-accent)', 
                 borderColor: 'var(--red-accent)' 
               } : {}}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/project-summary") ? "text-white" : "text-gray-600"}`}>summarize</span>
              {!collapsed && <span className={isActive("/project-summary") ? "text-white" : "text-gray-800 font-medium"}>Summary</span>}
            </div>
          </Link>
        </div>
      </nav>
      
      {/* Settings Links */}
      <div className="border-t p-4" style={{ borderColor: 'var(--medium-grey)' }}>
        <div className="space-y-2">
          <Link href="/settings">
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} cursor-pointer hover:bg-gray-100 rounded px-2 py-1`}>
              <span className={`material-icons ${collapsed ? "" : "mr-3"} text-gray-600`}>settings</span>
              {!collapsed && <span className="text-gray-800 font-medium">Settings</span>}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}