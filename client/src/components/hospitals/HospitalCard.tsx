import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppointmentModal from "@/components/modals/AppointmentModal";

interface HospitalCardProps {
  hospital: {
    id: number;
    name: string;
    specialties: string;
    distance?: string;
    latitude: number;
    longitude: number;
    available: boolean;
    rating: number;
    totalRatings: number;
    imageUrl?: string;
    doctors?: any[]; // Using any for simplicity
  };
  onLoginClick: () => void;
}

const HospitalCard = ({ hospital, onLoginClick }: HospitalCardProps) => {
  const { t } = useLanguage();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Use hospital's imageUrl if available, otherwise use a fallback image
  const imageUrl = hospital.imageUrl || `https://images.unsplash.com/photo-${hospital.id === 1 ? '1519494026892-80bbd2d6fd0d' : hospital.id === 2 ? '1586773860418-d37222d8fce3' : '1538108149393-fbbd81895907'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60`;
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img 
              className="h-48 w-full object-cover md:w-48" 
              src={imageUrl} 
              alt={hospital.name} 
            />
          </div>
          <CardContent className="p-4 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-neutral-darkest">{hospital.name}</h3>
                <p className="text-neutral-dark mt-1">{hospital.specialties}</p>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-yellow-400 mr-1">star</span>
                <span className="font-medium">{hospital.rating}</span>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {hospital.distance && (
                <div className="flex items-center text-neutral-dark">
                  <span className="material-icons text-primary text-sm mr-1">location_on</span>
                  <span>{hospital.distance}</span>
                </div>
              )}
              {hospital.doctors && (
                <div className="flex items-center text-neutral-dark">
                  <span className="material-icons text-primary text-sm mr-1">people</span>
                  <span>{hospital.doctors.length} {t('doctors')}</span>
                </div>
              )}
              <div className="flex items-center">
                {hospital.available ? (
                  <span className="flex items-center text-green-600">
                    <span className="material-icons text-sm mr-1">check_circle</span>
                    {t('available')}
                  </span>
                ) : (
                  <span className="flex items-center text-neutral-medium">
                    <span className="material-icons text-sm mr-1">cancel</span>
                    {t('limitedAvailability')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/hospitals/${hospital.id}`}>
                <Button variant="default" size="sm" className="flex items-center">
                  <span className="material-icons text-sm mr-1">info</span>
                  {t('viewDetails')}
                </Button>
              </Link>
              
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 flex items-center"
                onClick={() => setShowAppointmentModal(true)}
              >
                <span className="material-icons text-sm mr-1">event</span>
                {t('bookAppointment')}
              </Button>
              
              <a 
                href={`https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 bg-neutral-dark text-white rounded-md hover:bg-neutral-darkest flex items-center no-underline text-sm"
              >
                <span className="material-icons text-sm mr-1">directions</span>
                {t('getDirections')}
              </a>
            </div>
          </CardContent>
        </div>
      </Card>
      
      <AppointmentModal 
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onLoginClick={onLoginClick}
        hospital={hospital}
      />
    </>
  );
};

export default HospitalCard;
