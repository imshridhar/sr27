import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onManualLocation?: (location: { address: string; latitude: number; longitude: number }) => void;
}

const LocationDialog = ({ isOpen, onClose, onConfirm, onManualLocation }: LocationDialogProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("auto");
  const [town, setTown] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleManualLocation = async () => {
    if (!town || !district || !state) {
      setError("Town/Area, District and State are required");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // For simplicity, we'll use hardcoded geocoded locations for specific cities
      let latitude = 0;
      let longitude = 0;
      
      // Check for Solapur
      if (district.toLowerCase().includes("solapur") || town.toLowerCase().includes("solapur")) {
        latitude = 17.6599;
        longitude = 75.9064;
      }
      // Check for Vijayapura/Bijapur
      else if (
        district.toLowerCase().includes("vijayapura") || 
        town.toLowerCase().includes("vijayapura") ||
        district.toLowerCase().includes("bijapur") || 
        town.toLowerCase().includes("bijapur")
      ) {
        latitude = 16.8302;
        longitude = 75.7142;
      }
      // Check for Bagalkot
      else if (district.toLowerCase().includes("bagalkot") || town.toLowerCase().includes("bagalkot")) {
        latitude = 16.8505;
        longitude = 75.7192;
      }
      // Default fallback location
      else {
        // Use geocoding API to get coordinates for entered location
        const address = `${town}, ${district}, ${state}${pincode ? ' ' + pincode : ''}`;
        
        // Call the geocoding API
        const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
        
        if (geocodeResponse.ok) {
          const locationData = await geocodeResponse.json();
          latitude = locationData.latitude;
          longitude = locationData.longitude;
        } else {
          throw new Error("Failed to geocode the address");
        }
      }
      
      // Create the full address
      const address = `${town}, ${district}, ${state}${pincode ? ' ' + pincode : ''}`;
      
      // Now we have the coordinates, call the onManualLocation callback
      if (onManualLocation) {
        onManualLocation({
          address,
          latitude,
          longitude
        });
      }
      
      // Close the dialog
      onClose();
    } catch (err) {
      console.error("Error getting manual location:", err);
      setError("Failed to get coordinates for entered location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('locationAccessNeeded')}</DialogTitle>
          <DialogDescription>
            {t('locationAccessDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="auto">Automatic Location</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto" className="space-y-4">
            <div className="text-center my-6">
              <span className="material-icons text-4xl text-primary">location_on</span>
              <p className="text-sm text-muted-foreground mt-2">
                Allow access to your device's location for accurate results
              </p>
            </div>
            
            <DialogFooter className="flex flex-row justify-center sm:justify-between gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button onClick={onConfirm}>
                {t('allowLocation')}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="town">Town/Area *</Label>
                <Input
                  id="town"
                  placeholder="e.g., Vijayapura, Bagalkot, Solapur"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="e.g., Bagalkot, Solapur"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g., Karnataka, Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode (Optional)</Label>
                <Input
                  id="pincode"
                  placeholder="e.g., 586101, 413001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 my-2">
                  {error}
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-row justify-center sm:justify-between gap-2">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button onClick={handleManualLocation} disabled={isLoading}>
                {isLoading ? 'Locating...' : 'Submit Location'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
