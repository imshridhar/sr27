import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import MobileNavigation from "@/components/layout/MobileNavigation";
import HospitalDetails from "@/components/hospitals/HospitalDetails";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HospitalDetailsPage = () => {
  const [, params] = useRoute("/hospitals/:id");
  const hospitalId = params ? parseInt(params.id) : null;
  const { t } = useLanguage();
  
  // Modal states
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Fetch hospital details
  const { data: hospital, isLoading, error } = useQuery({
    queryKey: [`/api/hospitals/${hospitalId}`],
    enabled: hospitalId !== null,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <div className="text-center">
            <span className="material-icons animate-spin text-4xl text-primary mb-2">refresh</span>
            <p className="text-lg">{t('loadingHospitalDetails')}</p>
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }
  
  if (error || !hospital) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="text-center p-8 border rounded-lg bg-red-50 max-w-lg mx-auto">
            <span className="material-icons text-4xl text-red-500 mb-2">error</span>
            <h2 className="text-xl font-bold mb-2">{t('hospitalNotFound')}</h2>
            <p className="mb-4">{t('unableToLoadHospital')}</p>
            <Link href="/">
              <Button>{t('backToHome')}</Button>
            </Link>
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <HospitalDetails 
          hospital={hospital} 
          onBack={() => window.history.back()} 
          onLoginClick={() => setShowLogin(true)} 
        />
      </main>
      
      <MobileNavigation />
      
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
    </div>
  );
};

export default HospitalDetailsPage;
