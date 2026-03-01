import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { calculateDistance, formatDistance } from "@/utils/geolocation";

interface EmergencyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: {
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  nearbyHospitals: any[]; // Using any for simplicity
}

const EmergencyDialog = ({ isOpen, onClose, userLocation, nearbyHospitals }: EmergencyDialogProps) => {
  const { t } = useLanguage();
  
  const formattedHospitals = useMemo(() => {
    if (!userLocation || !nearbyHospitals || nearbyHospitals.length === 0) {
      return [];
    }
    
    // Calculate distances from user location to each hospital
    return nearbyHospitals
      .map(hospital => {
        // Calculate actual distance in km
        const distanceInKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.latitude,
          hospital.longitude
        );
        
        // Format distance to human-readable string
        const distance = formatDistance(distanceInKm);
        
        // Estimate ETA based on distance (approximate 1 km = 3 min by car)
        const etaMinutes = Math.max(5, Math.round(distanceInKm * 3));
        const eta = `${etaMinutes} min`;
        
        return {
          ...hospital,
          distance,
          eta,
          distanceInKm  // Keep the raw distance for sorting
        };
      })
      // Sort by closest first
      .sort((a, b) => a.distanceInKm - b.distanceInKm)
      // Take only the 3 closest hospitals
      .slice(0, 3);
  }, [nearbyHospitals, userLocation]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-secondary">
            <span className="material-icons mr-2">warning</span>
            {t('emergencyAssistance')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="material-icons text-5xl text-secondary">priority_high</span>
            </div>
            <p className="text-center font-medium text-lg mb-2">{t('medicalEmergencyDetected')}</p>
            <p className="text-center text-neutral-dark">{t('locatingNearestEmergency')}</p>
          </div>
          
          {userLocation && (
            <Card>
              <CardContent className="p-4">
                <div className="font-medium mb-2">{t('yourCurrentLocation')}:</div>
                <div className="flex items-center text-neutral-dark">
                  <span className="material-icons mr-2 text-primary">location_on</span>
                  <span>{userLocation.address}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-3">
            <p className="font-medium">{t('emergencyContacts')}:</p>
            <a 
              href="tel:108" 
              className="bg-secondary flex items-center p-3 rounded-lg text-white no-underline block"
            >
              <span className="material-icons mr-2">call</span>
              <div>
                <div className="font-medium">{t('ambulance')}</div>
                <div className="text-sm">108</div>
              </div>
            </a>
            
            <a 
              href="tel:102" 
              className="bg-secondary flex items-center p-3 rounded-lg text-white no-underline block"
            >
              <span className="material-icons mr-2">call</span>
              <div>
                <div className="font-medium">{t('emergencyHelpline')}</div>
                <div className="text-sm">102</div>
              </div>
            </a>
          </div>
          
          <div className="border-t border-neutral-light pt-4">
            <p className="text-sm text-neutral-dark mb-3">{t('nearestHospitalsWithEmergency')}:</p>
            <div className="space-y-3">
              {formattedHospitals.map((hospital, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="font-medium">{hospital.name}</div>
                    <div className="text-sm text-neutral-dark">
                      {hospital.distance} - {hospital.eta} {t('away')}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a 
                        href={`tel:${hospital.phone}`} 
                        className="text-sm px-2 py-1 bg-primary text-white rounded flex items-center no-underline"
                      >
                        <span className="material-icons text-sm mr-1">call</span>
                        {t('call')}
                      </a>
                      <a 
                        href={`https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm px-2 py-1 bg-neutral-dark text-white rounded flex items-center no-underline"
                      >
                        <span className="material-icons text-sm mr-1">directions</span>
                        {t('directions')}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyDialog;
