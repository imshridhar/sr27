import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the doctor form schema
const doctorSchema = z.object({
  name: z.string().min(3, { message: "Doctor name is required" }),
  specialty: z.string().min(2, { message: "Specialty is required" }),
  available: z.boolean().default(true),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  hospitalId: number;
  doctor?: any; // For editing an existing doctor
  onSuccess: () => void;
  onCancel: () => void;
}

const DoctorForm = ({ hospitalId, doctor, onSuccess, onCancel }: DoctorFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<DoctorFormValues> = {
    name: doctor?.name || "",
    specialty: doctor?.specialty || "",
    available: doctor?.available !== undefined ? doctor.available : true,
  };
  
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues,
  });
  
  // Define specialties list
  const specialties = [
    "General Medicine",
    "Emergency Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Psychiatry",
    "Radiology"
  ];
  
  // Handle form submission
  const onSubmit = async (data: DoctorFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Add hospital ID to the doctor data
      const doctorData = {
        ...data,
        hospitalId,
      };
      
      if (doctor) {
        // Update existing doctor
        await apiRequest(`/api/doctors/${doctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doctorData),
        });
        
        toast({
          title: t("success"),
          description: t("doctorUpdated"),
        });
      } else {
        // Create new doctor
        await apiRequest("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(doctorData),
        });
        
        toast({
          title: t("success"),
          description: t("doctorAdded"),
        });
      }
      
      // Invalidate queries to refetch doctor data
      queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospitalId}/doctors`] });
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error saving doctor:", error);
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
        <CardTitle>{doctor ? t("editDoctor") : t("addDoctor")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("doctorName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("doctorNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialty")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectSpecialty")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("specialtyDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("doctorAvailable")}</FormLabel>
                    <FormDescription>
                      {t("doctorAvailableDescription")}
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
                {isSubmitting ? t("saving") : doctor ? t("updateDoctor") : t("addDoctor")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DoctorForm;