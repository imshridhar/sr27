import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getUserLocation } from "@/utils/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import HospitalCard from "@/components/hospitals/HospitalCard";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LocationDialog from "@/components/modals/LocationDialog";

interface HospitalSearchProps {
  onLoginClick: () => void;
}

const HospitalSearch = ({ onLoginClick }: HospitalSearchProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [distance, setDistance] = useState("10");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  
  // Get nearby hospitals
  const { data: hospitals = [], isLoading, refetch } = useQuery({
    queryKey: [userLocation ? `/api/hospitals?lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${distance}` : '/api/hospitals'],
  });
  
  useEffect(() => {
    if (locationPermission && userLocation) {
      console.log("Fetching with user location:", userLocation, "radius:", distance);
      refetch();
      
      // Get display address for the location
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            setDisplayAddress(data.display_name);
          }
        })
        .catch(error => {
          console.error("Error getting address:", error);
        });
    }
  }, [locationPermission, userLocation, distance, refetch]);
  
  const handleNearMeClick = () => {
    // Show location dialog instead of immediately requesting location
    setShowLocationDialog(true);
  };
  
  const confirmAutomaticLocation = async () => {
    try {
      const location = await getUserLocation();
      console.log("User location obtained:", location);
      setUserLocation(location);
      setLocationPermission(true);
      setShowLocationDialog(false);
      
      // Try to get more detailed address from geocoding API
      try {
        const geocodeResponse = await fetch(`/api/geocode?lat=${location.latitude}&lng=${location.longitude}`);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData && geocodeData.address) {
            setDisplayAddress(geocodeData.address);
          }
        }
      } catch (geocodeError) {
        console.error("Error getting address from coordinates:", geocodeError);
      }
      
      // Show success toast
      toast({
        title: t('locationUpdated'),
        description: t('showingNearbyHospitals'),
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast({
        title: t('locationError'),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };
  
  const handleManualLocation = (location: { address: string; latitude: number; longitude: number }) => {
    console.log("Manual location selected:", location);
    setUserLocation({
      latitude: location.latitude,
      longitude: location.longitude
    });
    setDisplayAddress(location.address);
    setLocationPermission(true);
    
    // Show success toast
    toast({
      title: t('locationUpdated'),
      description: t('showingNearbyHospitals'),
    });
  };
  
  const handleSearch = () => {
    refetch();
  };
  
  const filteredHospitals = Array.isArray(hospitals) 
    ? hospitals
        .filter((hospital: any) => 
          (!searchTerm || hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           hospital.specialties.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (specialty === "all" || !specialty || hospital.specialties.toLowerCase().includes(specialty.toLowerCase())) &&
          (!availableOnly || hospital.available)
        )
    : [];
  
  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">{t('hospitalSearch')}</h2>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-icons text-neutral-medium">search</span>
                </span>
                <Input 
                  type="text" 
                  placeholder={t('searchHospitalsPlaceholder')}
                  className="w-full pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex items-center">
                <span className="material-icons mr-1">search</span>
                {t('search')}
              </Button>
              <Button variant="secondary" onClick={handleNearMeClick} className="flex items-center">
                <span className="material-icons mr-1">my_location</span>
                {t('nearMe')}
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center">
              <label className="mr-2 text-neutral-dark">{t('specialty')}:</label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="emergency">{t('emergencyCare')}</SelectItem>
                  <SelectItem value="cardiology">{t('cardiology')}</SelectItem>
                  <SelectItem value="neurology">{t('neurology')}</SelectItem>
                  <SelectItem value="pediatrics">{t('pediatrics')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <label className="mr-2 text-neutral-dark">{t('distance')}:</label>
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center text-neutral-dark">
                <Checkbox 
                  checked={availableOnly}
                  onCheckedChange={(checked) => setAvailableOnly(checked as boolean)}
                  className="mr-2 h-5 w-5"
                />
                {t('availableNow')}
              </label>
            </div>
          </div>
          
          {/* Display user location if available */}
          {userLocation && displayAddress && (
            <div className="mt-4 p-3 bg-muted rounded-md flex items-start space-x-2">
              <span className="material-icons text-primary">location_on</span>
              <div>
                <div className="font-medium">{t('yourCurrentLocation')}:</div>
                <div className="text-sm text-muted-foreground break-words">
                  {displayAddress}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hospital Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-4">
            <span className="material-icons animate-spin">refresh</span>
            <p>{t('loading')}</p>
          </div>
        ) : filteredHospitals.length > 0 ? (
          filteredHospitals.map((hospital: any) => (
            <HospitalCard 
              key={hospital.id} 
              hospital={hospital} 
              onLoginClick={onLoginClick}
            />
          ))
        ) : (
          <div className="text-center p-4 border rounded-lg">
            <p>{t('noHospitalsFound')}</p>
          </div>
        )}
      </div>
      
      {/* Location Dialog */}
      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onConfirm={confirmAutomaticLocation}
        onManualLocation={handleManualLocation}
      />
    </div>
  );
};

export default HospitalSearch;
