import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentModal from "@/components/modals/AppointmentModal";

interface HospitalDetailsProps {
  hospital: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    specialties: string;
    latitude: number;
    longitude: number;
    available: boolean;
    rating: number;
    totalRatings: number;
    imageUrl?: string;
    doctors?: any[]; // Using any for simplicity
  };
  onBack: () => void;
  onLoginClick: () => void;
}

const HospitalDetails = ({ hospital, onBack, onLoginClick }: HospitalDetailsProps) => {
  const { t } = useLanguage();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Use hospital's imageUrl if available, otherwise use a fallback image
  const imageUrl = hospital.imageUrl || `https://images.unsplash.com/photo-${hospital.id === 1 ? '1519494026892-80bbd2d6fd0d' : hospital.id === 2 ? '1586773860418-d37222d8fce3' : '1538108149393-fbbd81895907'}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60`;
  
  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-4 flex items-center text-primary hover:underline">
        <span className="material-icons mr-1">arrow_back</span>
        {t('backToSearch')}
      </Button>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          <img src={imageUrl} alt={hospital.name} className="w-full h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-2xl font-bold">{hospital.name}</h1>
              <p className="text-white/90">{hospital.specialties}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center">
              <span className="material-icons text-primary mr-1">location_on</span>
              <span>{hospital.address}, {hospital.city}, {hospital.state}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-primary mr-1">phone</span>
              <span>{hospital.phone}</span>
            </div>
            <div className="flex items-center">
              <span className="material-icons text-yellow-400 mr-1">star</span>
              <span>{hospital.rating} ({hospital.totalRatings} {t('reviews')})</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('facilities')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <span>24/7 {t('emergencyService')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <span>ICU {t('availability')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <span>{t('advancedImaging')} (CT, MRI)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <span>{t('bloodBank')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="material-icons text-green-600 mr-2">check_circle</span>
                    <span>{t('pharmacy')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('availableDoctors')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {hospital.doctors && hospital.doctors.length > 0 ? (
                    hospital.doctors.map((doctor: any) => (
                      <li key={doctor.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{doctor.name}</span>
                          <p className="text-sm text-neutral-dark">{doctor.specialty}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setShowAppointmentModal(true)}
                        >
                          {t('book')}
                        </Button>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex justify-between">
                        <div>
                          <span className="font-medium">Dr. Rajesh Kumar</span>
                          <p className="text-sm text-neutral-dark">{t('cardiology')}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setShowAppointmentModal(true)}
                        >
                          {t('book')}
                        </Button>
                      </li>
                      <li className="flex justify-between">
                        <div>
                          <span className="font-medium">Dr. Ananya Singh</span>
                          <p className="text-sm text-neutral-dark">{t('neurology')}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setShowAppointmentModal(true)}
                        >
                          {t('book')}
                        </Button>
                      </li>
                      <li className="flex justify-between">
                        <div>
                          <span className="font-medium">Dr. Vikram Patel</span>
                          <p className="text-sm text-neutral-dark">{t('emergencyMedicine')}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => setShowAppointmentModal(true)}
                        >
                          {t('book')}
                        </Button>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">{t('location')}</h2>
            <div className="bg-neutral-lightest rounded-lg h-64 flex items-center justify-center">
              <iframe
                title="Hospital Location"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.5rem' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${hospital.longitude - 0.01},${hospital.latitude - 0.01},${hospital.longitude + 0.01},${hospital.latitude + 0.01}&marker=${hospital.latitude},${hospital.longitude}`}
              />
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <Button 
              className="bg-green-600 hover:bg-green-700 flex items-center"
              onClick={() => setShowAppointmentModal(true)}
            >
              <span className="material-icons mr-1">event</span>
              {t('bookAppointment')}
            </Button>
            
            <a 
              href={`https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 no-underline"
            >
              <span className="material-icons mr-1">directions</span>
              {t('getDirections')}
            </a>
            
            <Button variant="secondary" className="flex items-center">
              <span className="material-icons mr-1">share</span>
              {t('share')}
            </Button>
          </div>
        </div>
      </div>
      
      <AppointmentModal 
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onLoginClick={onLoginClick}
        hospital={hospital}
      />
    </div>
  );
};

export default HospitalDetails;
