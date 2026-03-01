import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  hospital: any; // Using any for simplicity
}

const appointmentSchema = z.object({
  department: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().refine(value => !!value, {
    message: "Date is required",
  }),
  timeSlot: z.string().min(1, "Time slot is required"),
  reason: z.string().min(5, "Please provide a reason for your visit"),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const AppointmentModal = ({ isOpen, onClose, onLoginClick, hospital }: AppointmentModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      department: "",
      doctorId: "",
      date: "",
      timeSlot: "",
      reason: "",
    },
  });
  
  const onSubmit = async (data: AppointmentFormValues) => {
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToBook'),
        variant: "destructive",
      });
      onClose();
      onLoginClick();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Submit appointment
      await apiRequest("POST", "/api/appointments", {
        hospitalId: hospital.id,
        doctorId: parseInt(data.doctorId),
        date: new Date(data.date).toISOString(),
        timeSlot: data.timeSlot,
        department: data.department,
        reason: data.reason,
      });
      
      toast({
        title: t('appointmentBooked'),
        description: t('appointmentConfirmation'),
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t('bookingFailed'),
        description: typeof error === 'string' ? error : t('somethingWentWrong'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('bookAppointment')}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <span className="material-icons text-primary">local_hospital</span>
          </div>
          <div>
            <h3 className="font-medium">{hospital?.name}</h3>
            <p className="text-sm text-neutral-dark">{hospital?.address}</p>
          </div>
        </div>
        
        {!user ? (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-neutral-darkest mb-4">
            <div className="flex items-start">
              <span className="material-icons mr-2 text-yellow-500">info</span>
              <div>
                <p className="font-medium">{t('loginRequired')}</p>
                <p className="text-sm">{t('pleaseLoginToBook')}</p>
                <Button 
                  variant="default" 
                  size="sm"
                  className="mt-2" 
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                >
                  {t('loginNow')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectDepartment')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('chooseDepartment')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cardiology">{t('cardiology')}</SelectItem>
                        <SelectItem value="neurology">{t('neurology')}</SelectItem>
                        <SelectItem value="orthopedics">{t('orthopedics')}</SelectItem>
                        <SelectItem value="pediatrics">{t('pediatrics')}</SelectItem>
                        <SelectItem value="general">{t('generalMedicine')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectDoctor')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('chooseDoctor')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hospital?.doctors?.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        )) || (
                          <>
                            <SelectItem value="1">Dr. Rajesh Kumar - Cardiologist</SelectItem>
                            <SelectItem value="2">Dr. Ananya Singh - Neurologist</SelectItem>
                            <SelectItem value="3">Dr. Vikram Patel - Emergency Medicine</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('appointmentDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('preferredTime')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectTimeSlot')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">{t('morning')} (9:00 AM - 12:00 PM)</SelectItem>
                        <SelectItem value="afternoon">{t('afternoon')} (1:00 PM - 4:00 PM)</SelectItem>
                        <SelectItem value="evening">{t('evening')} (5:00 PM - 8:00 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('reasonForVisit')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-success hover:bg-success-dark" 
                disabled={isLoading || !user}
              >
                {isLoading ? t('processing') : t('confirmAppointment')}
              </Button>
            </form>
          </Form>
        )}
        
        <DialogFooter className="flex flex-col items-center">
          <p className="text-xs text-neutral-dark">
            {t('appointmentDisclaimer')}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
