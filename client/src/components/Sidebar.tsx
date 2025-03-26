import { Link, useLocation } from "wouter";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();

  // Function to determine if a link is active
  const isActive = (path: string) => location === path;

  return (
    <div className={`${collapsed ? "w-16" : "w-64"} transition-width bg-white shadow-md flex flex-col h-full`}>
      {/* App Logo */}
      <div className="p-4 border-b border-neutral-200 flex items-center">
        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V6z" clipRule="evenodd"></path>
        </svg>
        {!collapsed && <span className="ml-2 text-xl font-semibold">SE Checklist</span>}
      </div>
      
      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-neutral-200 flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">JD</div>
          <div className="ml-3">
            <div className="font-medium">John Doe</div>
            <div className="text-sm text-neutral-500">Security Engineer</div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 text-xs uppercase text-neutral-500 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "Site Walks"}
        </div>
        
        <Link href="/">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/") ? "text-primary" : "text-neutral-500"}`}>dashboard</span>
            {!collapsed && "Dashboard"}
          </a>
        </Link>
        
        <Link href="/projects">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/projects") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/projects") ? "text-primary" : "text-neutral-500"}`}>folder</span>
            {!collapsed && "My Site Walks"}
          </a>
        </Link>
        
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 mt-4 text-xs uppercase text-neutral-500 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "Equipment"}
        </div>
        
        <Link href="/card-access">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/card-access") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/card-access") ? "text-primary" : "text-neutral-500"}`}>meeting_room</span>
            {!collapsed && "Card Access"}
          </a>
        </Link>
        
        <Link href="/cameras">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/cameras") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/cameras") ? "text-primary" : "text-neutral-500"}`}>videocam</span>
            {!collapsed && "Cameras"}
          </a>
        </Link>
        
        <Link href="/elevators">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/elevators") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/elevators") ? "text-primary" : "text-neutral-500"}`}>elevator</span>
            {!collapsed && "Elevators & Turnstiles"}
          </a>
        </Link>
        
        <Link href="/intercoms">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/intercoms") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/intercoms") ? "text-primary" : "text-neutral-500"}`}>call</span>
            {!collapsed && "Intercoms"}
          </a>
        </Link>
        
        <div className={`${collapsed ? "px-2" : "px-4"} py-2 mt-4 text-xs uppercase text-neutral-500 font-semibold ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "" : "Reports"}
        </div>
        
        <Link href="/door-schedules">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/door-schedules") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/door-schedules") ? "text-primary" : "text-neutral-500"}`}>assessment</span>
            {!collapsed && "Door Schedules"}
          </a>
        </Link>
        
        <Link href="/camera-schedules">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/camera-schedules") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/camera-schedules") ? "text-primary" : "text-neutral-500"}`}>bar_chart</span>
            {!collapsed && "Camera Schedules"}
          </a>
        </Link>
        
        <Link href="/project-summary">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} px-4 py-3 ${isActive("/project-summary") ? "text-primary-dark bg-blue-50 border-r-4 border-primary" : "text-neutral-700 hover:bg-neutral-50"}`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"} ${isActive("/project-summary") ? "text-primary" : "text-neutral-500"}`}>summarize</span>
            {!collapsed && "Site Walk Summary"}
          </a>
        </Link>
      </nav>
      
      {/* Settings Link */}
      <div className="border-t border-neutral-200 p-4">
        <Link href="/settings">
          <a className={`flex items-center ${collapsed ? "justify-center" : ""} text-neutral-700 hover:text-primary`}>
            <span className={`material-icons ${collapsed ? "" : "mr-3"}`}>settings</span>
            {!collapsed && "Settings"}
          </a>
        </Link>
      </div>
    </div>
  );
}
