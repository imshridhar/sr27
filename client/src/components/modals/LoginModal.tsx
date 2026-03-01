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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginModal = ({ isOpen, onClose, onRegisterClick }: LoginModalProps) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      
      toast({
        title: t('loginSuccessful'),
        description: t('welcomeBack'),
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t('loginFailed'),
        description: typeof error === 'string' ? error : t('invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="grid grid-cols-1 h-full">
          {/* Header with color gradient */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-6 text-white">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                {t('login')}
              </h3>
              <p className="text-sm opacity-90">
                {t('welcomeBack')}
              </p>
            </div>
          </div>
          
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                          {t('rememberMe')}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button variant="link" className="p-0 text-sm text-primary" asChild>
                    <a href="#" className="font-medium">{t('forgotPassword')}</a>
                  </Button>
                </div>
                
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
                      <span>{t('loggingIn')}</span>
                    </div>
                  ) : (
                    t('login')
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
                {t('dontHaveAccount')}{' '}
                <Button 
                  variant="link" 
                  className="p-0 text-primary font-medium" 
                  onClick={onRegisterClick}
                >
                  {t('register')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;