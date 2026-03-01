import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const { toast } = useToast();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for user's preference or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  // Custom event handlers for modal actions
  const handleEmergencyClick = () => {
    // Create and dispatch a custom event
    const event = new CustomEvent('openEmergencyModal');
    window.dispatchEvent(event);
  };
  
  const handleLoginClick = () => {
    // Create and dispatch a custom event
    const event = new CustomEvent('openLoginModal');
    window.dispatchEvent(event);
  };
  
  const handleRegisterClick = () => {
    // Create and dispatch a custom event
    const event = new CustomEvent('openRegisterModal');
    window.dispatchEvent(event);
  };
  
  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const toggleHighContrast = () => {
    if (isHighContrast) {
      document.body.classList.remove("high-contrast");
    } else {
      document.body.classList.add("high-contrast");
    }
    setIsHighContrast(!isHighContrast);
  };
  
  const handleLogout = async () => {
    await logout();
    toast({
      title: t('logoutSuccessful'),
      description: t('youHaveBeenLoggedOut'),
    });
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-primary text-white p-1.5 rounded-md shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-icons text-lg">local_hospital</span>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">SR27</span>
            </Link>
            
            {/* Main Navigation Links - Desktop */}
            <nav className="hidden md:flex gap-6">
              <Link href="/" className={`font-medium ${location === '/' && !location.includes('?') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>
                {t('home')}
              </Link>
              <Link href="/" onClick={(e) => { e.preventDefault(); navigate('/?tab=hospitals'); }} className={`font-medium ${location.includes('tab=hospitals') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>
                {t('hospitals')}
              </Link>
              <Link href="/" onClick={(e) => { e.preventDefault(); navigate('/?tab=donors'); }} className={`font-medium ${location.includes('tab=donors') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>
                {t('bloodDonors')}
              </Link>
              <Link href="/about" className={`font-medium ${location === '/about' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} transition-colors`}>
                {t('about')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 h-9">
                  <span className="material-icons text-sm mr-1">language</span>
                  <span className="text-sm">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Options - Grouped */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <span className="material-icons">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleDarkMode}>
                  <span className="material-icons mr-2 text-sm">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  {isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleHighContrast}>
                  <span className="material-icons mr-2 text-sm">contrast</span>
                  {isHighContrast ? t('disableHighContrast') : t('enableHighContrast')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Emergency Button - Hidden on mobile, shown on desktop */}
            <Button 
              variant="destructive"
              size="sm"
              className="hidden md:flex bg-red-600 hover:bg-red-700 px-3 py-1 shadow-sm items-center animate-pulse"
              onClick={handleEmergencyClick}
            >
              <span className="material-icons mr-1 text-sm">warning</span>
              <span className="font-bold text-sm">{t('emergency')}</span>
            </Button>

            {/* User Menu / Auth */}
            {!user ? (
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hidden md:flex"
                  onClick={handleLoginClick}
                >
                  {t('login')}
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  className="hidden md:flex"
                  onClick={handleRegisterClick}
                >
                  {t('register')}
                </Button>
                
                {/* Mobile-only auth button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9"
                  onClick={handleLoginClick}
                >
                  <span className="material-icons">account_circle</span>
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons text-primary text-sm">person</span>
                    </div>
                    <span className="hidden md:inline">{user.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="material-icons text-primary">person</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                      <span className="material-icons mr-2 text-sm">dashboard</span>
                      {t('dashboard')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <span className="material-icons mr-2 text-sm">settings</span>
                      {t('settings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-600">
                      <span className="material-icons mr-2 text-sm">logout</span>
                      {t('logout')}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
