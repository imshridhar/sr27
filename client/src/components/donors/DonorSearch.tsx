import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DonorCard from "@/components/donors/DonorCard";
import LocationDialog from "@/components/modals/LocationDialog";
import { useToast } from "@/hooks/use-toast";

interface DonorSearchProps {
  onLoginClick: () => void;
}

const DonorSearch = ({ onLoginClick }: DonorSearchProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [distance, setDistance] = useState("10");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  
  // Get nearby donors
  const { data: donors = [], isLoading, refetch } = useQuery({
    queryKey: [
      userLocation 
        ? `/api/donors?bloodGroup=${bloodGroup}&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=${distance}` 
        : '/api/donors'
    ],
  });
  
  useEffect(() => {
    if (locationPermission && userLocation) {
      refetch();
    }
  }, [locationPermission, userLocation, bloodGroup, distance, refetch]);
  
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
        description: t('showingNearbyDonors'),
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
      description: t('showingNearbyDonors'),
    });
  };
  
  const handleSearch = () => {
    refetch();
  };
  
  const filteredDonors = Array.isArray(donors)
    ? donors
        .filter((donor: any) => 
          (bloodGroup === "all" || !bloodGroup || donor.bloodGroup === bloodGroup) &&
          (!availableOnly || donor.available)
        )
    : [];
  
  // Add distance to each donor based on user location
  const donorsWithDistance = filteredDonors.map((donor: any) => {
    // In a real app, this would be calculated by the backend or with a geolocation library
    return {
      ...donor,
      distance: `${(Math.random() * 5 + 1).toFixed(1)} km`
    };
  });
  
  return (
    <div className="animate-fade-in">
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-4">{t('bloodDonorSearch')}</h2>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-icons text-neutral-medium">search</span>
                </span>
                <Input 
                  type="text" 
                  placeholder={t('searchDonorsPlaceholder')}
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
              <label className="mr-2 text-neutral-dark">{t('bloodGroup')}:</label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
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
      
      {!user && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200 text-neutral-darkest">
          <span className="material-icons mr-2 text-yellow-500">info</span>
          <AlertTitle>{t('loginRequired')}</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col">
            <span>{t('donorPrivacyInfo')}</span>
            <Button 
              variant="default" 
              className="mt-2 w-fit" 
              onClick={onLoginClick}
            >
              {t('loginNow')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Donor Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center p-4">
            <span className="material-icons animate-spin">refresh</span>
            <p>{t('loading')}</p>
          </div>
        ) : donorsWithDistance.length > 0 ? (
          donorsWithDistance.map((donor: any, index: number) => (
            <DonorCard key={donor.id || index} donor={donor} onLoginClick={onLoginClick} />
          ))
        ) : (
          <div className="text-center p-4 border rounded-lg">
            <p>{t('noDonorsFound')}</p>
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

export default DonorSearch;
