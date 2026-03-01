import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DonorCardProps {
  donor: {
    id: number;
    bloodGroup: string;
    lastDonated: string;
    available: boolean;
    distance?: string;
    contactInfo?: {
      name: string;
      phone: string;
      email: string;
    } | null;
  };
  onLoginClick: () => void;
}

const DonorCard = ({ donor, onLoginClick }: DonorCardProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleContactClick = () => {
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToViewContact'),
        variant: "default",
      });
      onLoginClick();
      return;
    }
    
    if (!donor.available) {
      toast({
        title: t('donorUnavailable'),
        description: t('donorNotAvailableNow'),
        variant: "destructive",
      });
      return;
    }
    
    // If we have contact info, show it
    if (donor.contactInfo) {
      toast({
        title: t('donorContact'),
        description: (
          <div>
            <p>{donor.contactInfo.name}</p>
            <p>{donor.contactInfo.phone}</p>
            <p>{donor.contactInfo.email}</p>
          </div>
        ),
      });
    } else {
      toast({
        title: t('contactDonorSuccess'),
        description: t('donorWillBeNotified'),
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-secondary text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
              <span className="font-bold text-lg">{donor.bloodGroup}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-darkest">
                {donor.contactInfo?.name || t('bloodDonor')}
              </h3>
              <p className="text-neutral-dark text-sm">
                {t('lastDonated')}: <span>{new Date(donor.lastDonated).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          {donor.distance && (
            <div className="flex items-center text-neutral-dark">
              <span className="material-icons text-primary text-sm mr-1">location_on</span>
              <span>{donor.distance}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="default"
            disabled={!donor.available}
            onClick={handleContactClick}
            className="flex items-center"
          >
            <span className="material-icons text-sm mr-1">call</span>
            {t('contactDonor')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorCard;
