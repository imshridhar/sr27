import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Define the hospital form schema
const hospitalSchema = z.object({
  name: z.string().min(3, { message: "Hospital name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
  specialties: z.string().min(3, { message: "Specialties are required" }),
  imageUrl: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  available: z.boolean().default(true),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

interface HospitalFormProps {
  hospital?: any; // For editing an existing hospital
  onSuccess: () => void;
  onCancel: () => void;
}

const HospitalForm = ({ hospital, onSuccess, onCancel }: HospitalFormProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(hospital?.imageUrl || null);
  
  const defaultValues: Partial<HospitalFormValues> = {
    name: hospital?.name || "",
    address: hospital?.address || "",
    city: hospital?.city || "",
    state: hospital?.state || "",
    phone: hospital?.phone || "",
    specialties: hospital?.specialties || "",
    imageUrl: hospital?.imageUrl || "",
    latitude: hospital?.latitude || undefined,
    longitude: hospital?.longitude || undefined,
    available: hospital?.available !== undefined ? hospital.available : true,
  };
  
  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues,
  });
  
  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude);
          form.setValue("longitude", position.coords.longitude);
          toast({
            title: t("locationDetected"),
            description: t("locationCoordinatesUpdated"),
          });
        },
        (error) => {
          toast({
            title: t("locationError"),
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: t("locationNotSupported"),
        description: t("pleaseEnterManually"),
        variant: "destructive",
      });
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        form.setValue("imageUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Effect to get location if needed
  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);
  
  // Handle form submission
  const onSubmit = async (data: HospitalFormValues) => {
    if (!user) {
      toast({
        title: t("loginRequired"),
        description: t("pleaseLoginToRegisterHospital"),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Add owner ID to the hospital data
      const hospitalData = {
        ...data,
        ownerId: user.id,
      };
      
      if (hospital) {
        // Update existing hospital
        await apiRequest(`/api/hospitals/${hospital.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hospitalData),
        });
        
        toast({
          title: t("success"),
          description: t("hospitalUpdated"),
        });
      } else {
        // Create new hospital
        await apiRequest("/api/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hospitalData),
        });
        
        toast({
          title: t("success"),
          description: t("hospitalRegistered"),
        });
      }
      
      // Invalidate queries to refetch hospital data
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error saving hospital:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{hospital ? t("editHospital") : t("registerHospital")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hospitalName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("hospitalNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("addressPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("city")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("cityPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("state")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("statePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("phonePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("specialtiesPlaceholder")} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t("specialtiesDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Image</FormLabel>
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative w-full h-48 overflow-hidden rounded-md">
                        <img 
                          src={imagePreview} 
                          alt="Hospital preview" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="hospital-image"
                        />
                        <label
                          htmlFor="hospital-image"
                          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                        >
                          {imagePreview ? "Change Image" : "Upload Image"}
                        </label>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue("imageUrl", "");
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image of your hospital. This will be displayed to users.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="bg-muted p-4 rounded-md space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-current-location" 
                  checked={useCurrentLocation}
                  onCheckedChange={(checked) => setUseCurrentLocation(!!checked)}
                />
                <label htmlFor="use-current-location" className="text-sm font-medium cursor-pointer">
                  {t("useCurrentLocation")}
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("latitude")}</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("longitude")}</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("hospitalAvailable")}</FormLabel>
                    <FormDescription>
                      {t("hospitalAvailableDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : hospital ? t("updateHospital") : t("registerHospital")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HospitalForm;