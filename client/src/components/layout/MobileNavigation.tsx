import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MobileNavigation = () => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Custom event handlers for modal actions
  const handleEmergencyClick = () => {
    const event = new CustomEvent('openEmergencyModal');
    window.dispatchEvent(event);
  };
  
  const handleLoginClick = () => {
    const event = new CustomEvent('openLoginModal');
    window.dispatchEvent(event);
  };
  
  const handleRegisterClick = () => {
    const event = new CustomEvent('openRegisterModal');
    window.dispatchEvent(event);
  };
  
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };
  
  // Helper function to determine if a menu item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
              aria-label="Menu"
            >
              <span className="material-icons text-2xl">menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pt-6 px-0 h-[80vh]">
            <div className="flex flex-col h-full">
              <div className="px-6">
                <h2 className="text-xl font-bold mb-6 text-center">{t('menu')}</h2>
              </div>
              
              <div className="flex-1 overflow-auto px-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer ${
                      location === "/" || location.includes("/?tab=hospitals") 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      navigate('/?tab=hospitals'); 
                    }}
                  >
                    <span className="material-icons text-2xl mb-2">local_hospital</span>
                    <span className="text-sm font-medium">{t('findHospital')}</span>
                  </div>
                  
                  <div 
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer ${
                      location.includes("/?tab=donors") 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => { 
                      setIsMenuOpen(false); 
                      navigate('/?tab=donors'); 
                    }}
                  >
                    <span className="material-icons text-2xl mb-2">favorite</span>
                    <span className="text-sm font-medium">{t('findDonor')}</span>
                  </div>
                </div>
                
                {/* Main Navigation Links */}
                <nav className="space-y-1 mb-8">
                  <Link href="/">
                    <SheetClose asChild>
                      <button 
                        className={`flex items-center w-full px-4 py-3 rounded-lg ${
                          isActive("/") && !location.includes("?") ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="material-icons mr-3">home</span>
                        <span className="font-medium">{t('home')}</span>
                      </button>
                    </SheetClose>
                  </Link>
                  
                  <Link href="/" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/?tab=hospitals'); }}>
                    <SheetClose asChild>
                      <button 
                        className={`flex items-center w-full px-4 py-3 rounded-lg ${
                          location.includes("tab=hospitals") ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="material-icons mr-3">business</span>
                        <span className="font-medium">{t('hospitals')}</span>
                      </button>
                    </SheetClose>
                  </Link>
                  
                  <Link href="/" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigate('/?tab=donors'); }}>
                    <SheetClose asChild>
                      <button 
                        className={`flex items-center w-full px-4 py-3 rounded-lg ${
                          location.includes("tab=donors") ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="material-icons mr-3">bloodtype</span>
                        <span className="font-medium">{t('bloodDonors')}</span>
                      </button>
                    </SheetClose>
                  </Link>
                  
                  <Link href="/about">
                    <SheetClose asChild>
                      <button 
                        className={`flex items-center w-full px-4 py-3 rounded-lg ${
                          isActive("/about") ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="material-icons mr-3">info</span>
                        <span className="font-medium">{t('about')}</span>
                      </button>
                    </SheetClose>
                  </Link>
                  
                  {user && (
                    <Link href="/dashboard">
                      <SheetClose asChild>
                        <button 
                          className={`flex items-center w-full px-4 py-3 rounded-lg ${
                            isActive("/dashboard") ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                          }`}
                        >
                          <span className="material-icons mr-3">dashboard</span>
                          <span className="font-medium">{t('dashboard')}</span>
                        </button>
                      </SheetClose>
                    </Link>
                  )}
                </nav>
                
                {/* Emergency Button */}
                <div className="px-4 mb-4">
                  <Button 
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg shadow-md flex justify-center items-center animate-pulse"
                    onClick={handleEmergencyClick}
                  >
                    <span className="material-icons mr-2">warning</span>
                    <span className="font-bold">{t('emergency')}</span>
                  </Button>
                </div>
              </div>
              
              {/* Authentication */}
              <div className="border-t p-4">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={handleLoginClick}
                    >
                      {t('login')}
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={handleRegisterClick}
                    >
                      {t('register')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-primary/20 text-primary rounded-full p-2">
                        <span className="material-icons">person</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <span className="material-icons mr-2 text-sm">logout</span>
                      {t('logout')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Bottom Navigation Tabs - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 px-2 pb-safe">
        <div className="flex justify-around py-2">
          <Link href="/" onClick={(e) => location === "/" ? null : navigate("/")}>
            <button
              className={`flex flex-col items-center px-3 py-1 ${
                location === "/" && !location.includes("?") 
                  ? "text-primary" 
                  : "text-gray-600"
              }`}
            >
              <span className="material-icons text-lg">home</span>
              <span className="text-xs mt-0.5">{t('home')}</span>
            </button>
          </Link>
          
          <Link href="/" onClick={(e) => { e.preventDefault(); navigate('/?tab=hospitals'); }}>
            <button
              className={`flex flex-col items-center px-3 py-1 ${
                location.includes("tab=hospitals") 
                  ? "text-primary" 
                  : "text-gray-600"
              }`}
            >
              <span className="material-icons text-lg">local_hospital</span>
              <span className="text-xs mt-0.5">{t('hospitals')}</span>
            </button>
          </Link>
          
          <Link href="/" onClick={(e) => { e.preventDefault(); navigate('/?tab=donors'); }}>
            <button
              className={`flex flex-col items-center px-3 py-1 ${
                location.includes("tab=donors") 
                  ? "text-primary" 
                  : "text-gray-600"
              }`}
            >
              <span className="material-icons text-lg">favorite</span>
              <span className="text-xs mt-0.5">{t('donors')}</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center px-3 py-1 text-red-500"
            onClick={handleEmergencyClick}
          >
            <span className="material-icons text-lg animate-pulse">warning</span>
            <span className="text-xs mt-0.5">{t('emergency')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
