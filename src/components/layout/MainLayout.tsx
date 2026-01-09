import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { 
  FiGrid, 
  FiCalendar, 
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiSun,
  FiMoon
} from "react-icons/fi";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  // Theme management moved to separate hook or kept here
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const actualNavItems = [
    { icon: <FiGrid />, label: "Dashboard", path: "/dashboard" },
    { icon: <FiCalendar />, label: "Boards", path: "/board" },
    { icon: <FiSettings />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between">
         <div className="flex items-center gap-2 font-bold text-xl">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <FiGrid className="w-5 h-5" />
             </div>
             <span>ProjectHub</span>
         </div>
         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
           {mobileMenuOpen ? <FiX /> : <FiMenu />}
         </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out flex flex-col
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex
      `}>
        <div className="p-6 border-b border-border/40 hidden md:block shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <FiGrid className="w-5 h-5" />
            </div>
            ProjectHub
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 mt-14 md:mt-0 overflow-y-auto">
          {actualNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

          <div className="p-4 border-t border-border mt-auto shrink-0">
             <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium shrink-0">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-1">
                 <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md transition-colors"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                 >
                    {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
                 </button>
                 <button 
                    onClick={() => logout()} 
                    className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                    title="Logout"
                 >
                    <FiLogOut size={18} />
                 </button>
               </div>
            </div>
          </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 min-w-0 flex flex-col pt-16 md:pt-0 h-full overflow-y-auto relative">
        {/* We can put a top header here if we want global search/actions, 
            but Dashboard has its own header. Use children directly. */}
        {children}
      </div>
    </div>
  );
};
