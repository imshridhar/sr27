import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["user", "hospital", "donor"]),
  // Hospital-specific fields
  hospitalName: z.string().optional(),
  hospitalAddress: z.string().optional(),
  specialties: z.string().optional(),
  // Donor-specific fields
  bloodGroup: z.string().optional(),
  lastDonated: z.string().optional(),
  // User-specific fields
  medicalConditions: z.string().optional(),
  // Terms
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  data => {
    if (data.role === "hospital") {
      return !!data.hospitalName && !!data.hospitalAddress && !!data.specialties;
    }
    return true;
  },
  {
    message: "Hospital details are required",
    path: ["hospitalName"],
  }
).refine(
  data => {
    if (data.role === "donor") {
      return !!data.bloodGroup;
    }
    return true;
  },
  {
    message: "Blood group is required",
    path: ["bloodGroup"],
  }
);

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterModal = ({ isOpen, onClose, onLoginClick }: RegisterModalProps) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "user",
      hospitalName: "",
      hospitalAddress: "",
      specialties: "",
      bloodGroup: "",
      lastDonated: "",
      medicalConditions: "",
      termsAccepted: false,
    },
  });
  
  const selectedRole = form.watch("role");
  
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      // Prepare user object based on role
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        medicalConditions: data.medicalConditions || "",
      };
      
      // Register user
      await register(userData);
      
      toast({
        title: t('registrationSuccessful'),
        description: t('accountCreated'),
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t('registrationFailed'),
        description: typeof error === 'string' ? error : t('somethingWentWrong'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-hidden">
        <div className="grid grid-cols-1 h-full">
          {/* Header with color gradient */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 text-white">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                {t('register')}
              </h3>
              <p className="text-sm opacity-90">
                {t('createAccount')}
              </p>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">{t('registerAs')}</FormLabel>
                      <div className="pt-1">
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-3"
                        >
                          <div 
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all",
                              field.value === "user" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-primary/20 hover:bg-gray-50"
                            )}
                            onClick={() => field.onChange("user")}
                          >
                            <FormControl>
                              <RadioGroupItem value="user" id="user" className="sr-only" />
                            </FormControl>
                            <span className="material-icons mb-1">person</span>
                            <span className="text-sm font-medium">{t('user')}</span>
                          </div>
                          
                          <div 
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all",
                              field.value === "hospital" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-primary/20 hover:bg-gray-50"
                            )}
                            onClick={() => field.onChange("hospital")}
                          >
                            <FormControl>
                              <RadioGroupItem value="hospital" id="hospital" className="sr-only" />
                            </FormControl>
                            <span className="material-icons mb-1">local_hospital</span>
                            <span className="text-sm font-medium">{t('hospital')}</span>
                          </div>
                          
                          <div 
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all",
                              field.value === "donor" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 hover:border-primary/20 hover:bg-gray-50"
                            )}
                            onClick={() => field.onChange("donor")}
                          >
                            <FormControl>
                              <RadioGroupItem value="donor" id="donor" className="sr-only" />
                            </FormControl>
                            <span className="material-icons mb-1">favorite</span>
                            <span className="text-sm font-medium">{t('bloodDonor')}</span>
                          </div>
                        </RadioGroup>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">{t('firstName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                              person
                            </span>
                            <Input 
                              className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                              placeholder="John" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">{t('lastName')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                              person_outline
                            </span>
                            <Input 
                              className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                              placeholder="Doe" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">{t('email')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                            email
                          </span>
                          <Input 
                            className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                            placeholder="your@email.com" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                            phone
                          </span>
                          <Input 
                            className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                            placeholder="+1 (xxx) xxx-xxxx" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Role-specific fields */}
                {selectedRole === "user" && (
                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80 text-sm">{t('medicalConditions')} ({t('optional')})</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-muted/30 focus:bg-background transition-colors resize-none min-h-[80px]" 
                            placeholder="List any medical conditions that emergency responders should know about"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedRole === "hospital" && (
                  <>
                    <FormField
                      control={form.control}
                      name="hospitalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 text-sm">{t('hospitalName')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                                business
                              </span>
                              <Input 
                                className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                                placeholder="City General Hospital"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hospitalAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 text-sm">{t('address')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                                location_on
                              </span>
                              <Input 
                                className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                                placeholder="123 Healthcare Ave, City, State"
                                {...field} 
                              />
                            </div>
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
                          <FormLabel className="text-foreground/80 text-sm">{t('specialties')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                                medical_services
                              </span>
                              <Input 
                                className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                                placeholder="E.g., Cardiology, Neurology, Emergency Care"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {selectedRole === "donor" && (
                  <>
                    <FormField
                      control={form.control}
                      name="bloodGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 text-sm">{t('bloodGroup')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 focus:bg-background transition-colors">
                                <SelectValue placeholder={t('selectBloodGroup')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastDonated"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80 text-sm">{t('lastDonationDate')} ({t('optional')})</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                                calendar_today
                              </span>
                              <Input 
                                type="date" 
                                className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">{t('password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                            lock
                          </span>
                          <Input 
                            type="password" 
                            className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">{t('confirmPassword')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground material-icons text-sm">
                            lock_outline
                          </span>
                          <Input 
                            type="password" 
                            className="pl-10 bg-muted/30 focus:bg-background transition-colors" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground">
                          {t('iAgreeToThe')}{' '}
                          <a href="#" className="text-primary hover:underline">
                            {t('termsOfService')}
                          </a>
                          {' '}{t('and')}{' '}
                          <a href="#" className="text-primary hover:underline">
                            {t('privacyPolicy')}
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white",
                    isLoading && "opacity-80"
                  )} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                      <span>{t('registering')}</span>
                    </div>
                  ) : (
                    t('register')
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-center">
                {t('alreadyHaveAccount')}{' '}
                <Button 
                  variant="link" 
                  className="p-0 text-primary font-medium" 
                  onClick={onLoginClick}
                >
                  {t('login')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;