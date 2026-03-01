import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserLocation } from "@/utils/geolocation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import HospitalSearch from "@/components/hospitals/HospitalSearch";
import DonorSearch from "@/components/donors/DonorSearch";
import HospitalDetails from "@/components/hospitals/HospitalDetails";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import EmergencyDialog from "@/components/modals/EmergencyDialog";
import LocationDialog from "@/components/modals/LocationDialog";

const Home = () => {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'hospitals' | 'donors'>('hospitals');
  const [activePanel, setActivePanel] = useState<'search' | 'hospitalDetails'>('search');
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  
  // Modal states
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Get user location
  const [userLocation, setUserLocation] = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  
  // Action handlers
  const handleEmergency = useCallback(() => {
    console.log("Emergency button clicked");
    setShowLocationPrompt(true);
  }, []);
  
  // Event handlers for Navbar button clicks
  useEffect(() => {
    const handleOpenEmergency = () => handleEmergency();
    const handleOpenLogin = () => setShowLogin(true);
    const handleOpenRegister = () => setShowRegister(true);
    
    window.addEventListener('openEmergencyModal', handleOpenEmergency);
    window.addEventListener('openLoginModal', handleOpenLogin);
    window.addEventListener('openRegisterModal', handleOpenRegister);
    
    return () => {
      window.removeEventListener('openEmergencyModal', handleOpenEmergency);
      window.removeEventListener('openLoginModal', handleOpenLogin);
      window.removeEventListener('openRegisterModal', handleOpenRegister);
    };
  }, [handleEmergency]);
  
  // Parse URL parameters
  useEffect(() => {
    if (!location || !location.includes('?')) return;
    
    const params = new URLSearchParams(location.split('?')[1]);
    if (params.has('tab') && params.get('tab') === 'donors') {
      setCurrentTab('donors');
    } else {
      setCurrentTab('hospitals');
    }
    
    if (params.has('emergency') && params.get('emergency') === 'true') {
      handleEmergency();
    }
    
    if (params.has('login') && params.get('login') === 'true') {
      setShowLogin(true);
    }
    
    if (params.has('register') && params.get('register') === 'true') {
      setShowRegister(true);
    }
  }, [location, handleEmergency]);
  
  // Get nearby hospitals
  const { data: nearbyHospitals = [] } = useQuery<any[]>({
    queryKey: [userLocation ? `/api/hospitals?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10` : '/api/hospitals'],
    enabled: !!userLocation,
  });
  
  // Log hospital data for debugging
  useEffect(() => {
    if (userLocation && nearbyHospitals.length > 0) {
      console.log("Fetching with user location:", userLocation, "radius:", "10");
      console.log("Nearby hospitals:", nearbyHospitals);
    }
  }, [userLocation, nearbyHospitals]);
  
  const confirmLocation = async () => {
    try {
      console.log("Confirming location for emergency");
      const location = await getUserLocation();
      console.log("User location obtained:", location);
      
      // First set location with default address
      setUserLocation({
        address: "Current Location",
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      // Try to get more detailed address from geocoding API
      try {
        const geocodeResult = await fetch(`/api/geocode?lat=${location.latitude}&lng=${location.longitude}`).then(res => res.json());
        console.log("Geocoding result:", geocodeResult);
        
        if (geocodeResult && geocodeResult.address) {
          setUserLocation({
            address: geocodeResult.address,
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      } catch (geocodeError) {
        console.error("Error getting address from coordinates:", geocodeError);
        // Continue with just the coordinates if geocoding fails
      }
      
      setShowLocationPrompt(false);
      setShowEmergencyDialog(true);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Hero Section */}
        <div className="mb-8 md:mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                  {t('heroTitle')}
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-6 md:pr-12 text-muted-foreground">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => handleEmergency()}
                >
                  <span className="material-icons mr-2">warning</span>
                  {t('emergencyAssistance')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={() => setShowLogin(true)}
                >
                  {t('getStarted')}
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-xl shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">local_hospital</span>
                    <span className="text-sm font-medium text-center">{t('quickAccess')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">favorite</span>
                    <span className="text-sm font-medium text-center">{t('bloodDonation')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">location_on</span>
                    <span className="text-sm font-medium text-center">{t('nearbyServices')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">translate</span>
                    <span className="text-sm font-medium text-center">{t('multiLanguageSupport')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">calendar_today</span>
                    <span className="text-sm font-medium text-center">{t('appointments')}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <span className="material-icons text-primary text-3xl mb-2">manage_accounts</span>
                    <span className="text-sm font-medium text-center">{t('userProfile')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Emergency Button - Larger for better visibility */}
        <div className="hidden md:block mb-8">
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-background">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold text-red-600 mb-2">{t('emergencyTitle')}</h3>
                  <p className="text-muted-foreground max-w-xl">{t('emergencyDescription')}</p>
                </div>
                <Button 
                  size="lg"
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 min-w-[200px] animate-pulse"
                  onClick={handleEmergency}
                >
                  <span className="material-icons mr-2">warning</span>
                  {t('emergency')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs
          defaultValue="hospitals"
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value as 'hospitals' | 'donors')}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto md:mx-0 grid-cols-2">
            <TabsTrigger value="hospitals" className="flex items-center">
              <span className="material-icons mr-2">local_hospital</span>
              {t('findHospital')}
            </TabsTrigger>
            <TabsTrigger value="donors" className="flex items-center">
              <span className="material-icons mr-2">favorite</span>
              {t('findDonor')}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {activePanel === 'search' ? (
              <>
                <TabsContent value="hospitals" className="mt-0">
                  <HospitalSearch onLoginClick={() => setShowLogin(true)} />
                </TabsContent>
                
                <TabsContent value="donors" className="mt-0">
                  <DonorSearch onLoginClick={() => setShowLogin(true)} />
                </TabsContent>
              </>
            ) : (
              <HospitalDetails 
                hospital={selectedHospital} 
                onBack={() => setActivePanel('search')} 
                onLoginClick={() => setShowLogin(true)} 
              />
            )}
          </div>
        </Tabs>
      </div>
      
      {/* Modals */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegister(true);
        }} 
      />
      
      <RegisterModal 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)} 
        onLoginClick={() => {
          setShowRegister(false);
          setShowLogin(true);
        }} 
      />
      
      <LocationDialog 
        isOpen={showLocationPrompt} 
        onClose={() => setShowLocationPrompt(false)} 
        onConfirm={confirmLocation}
        onManualLocation={(location) => {
          console.log("Manual location selected:", location);
          setUserLocation(location);
          setShowLocationPrompt(false);
          setShowEmergencyDialog(true);
        }}
      />
      
      <EmergencyDialog 
        isOpen={showEmergencyDialog} 
        onClose={() => setShowEmergencyDialog(false)} 
        userLocation={userLocation} 
        nearbyHospitals={nearbyHospitals} 
      />
    </div>
  );
};

export default Home;
