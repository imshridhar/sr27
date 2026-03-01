import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/layout/Navbar";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import HospitalForm from "@/components/hospitals/HospitalForm";
import HospitalManagement from "@/components/hospitals/HospitalManagement";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  
  // Fetch user-specific data
  const { data: appointments = [] } = useQuery<any[]>({
    queryKey: ['/api/appointments'],
    enabled: !!user,
  });
  
  // For hospital owners
  const { data: hospitals = [] } = useQuery<any[]>({
    queryKey: ['/api/hospitals'],
    enabled: !!user && user?.role === 'hospital',
  });
  
  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('loginRequired')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{t('pleaseLoginToAccessDashboard')}</p>
              <div className="flex gap-2">
                <Link href="/?login=true">
                  <Button>{t('login')}</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">{t('backToHome')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <MobileNavigation />
      </div>
    );
  }
  
  // Handlers for hospital management
  const handleAddHospital = () => {
    setIsAddingHospital(true);
    setSelectedHospital(null);
  };
  
  const handleEditHospital = (hospitalId: number) => {
    setSelectedHospital(hospitalId);
    setIsAddingHospital(false);
  };
  
  const handleManageDoctors = (hospitalId: number) => {
    setSelectedHospital(hospitalId);
    setIsAddingHospital(false);
  };
  
  const handleCloseHospitalForm = () => {
    setIsAddingHospital(false);
    setSelectedHospital(null);
    queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
  };
  
  // Render hospital form if adding/editing a hospital
  if (isAddingHospital) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <HospitalForm 
            onSuccess={handleCloseHospitalForm}
            onCancel={handleCloseHospitalForm}
          />
        </main>
        <MobileNavigation />
      </div>
    );
  }
  
  // Render hospital management if a hospital is selected
  if (selectedHospital !== null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 flex-grow">
          <HospitalManagement 
            hospitalId={selectedHospital}
            onClose={handleCloseHospitalForm}
          />
        </main>
        <MobileNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
          <Badge variant="outline" className="text-sm font-normal">
            {user.role === 'user' ? t('patient') : user.role === 'hospital' ? t('hospitalOwner') : t('bloodDonor')}
          </Badge>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
            <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
            {user.role === 'hospital' && (
              <TabsTrigger value="hospitals">{t('myHospitals')}</TabsTrigger>
            )}
            {user.role === 'donor' && (
              <TabsTrigger value="donorProfile">{t('donorProfile')}</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('personalInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('name')}</p>
                      <p>{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('email')}</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('phone')}</p>
                      <p>{user.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('accountType')}</p>
                      <p>{user.role === 'user' ? t('patient') : user.role === 'hospital' ? t('hospitalOwner') : t('bloodDonor')}</p>
                    </div>
                  </div>
                  
                  {user.medicalConditions && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">{t('medicalConditions')}</p>
                      <p>{user.medicalConditions}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full" onClick={logout}>
                    <span className="material-icons mr-2">logout</span>
                    {t('logout')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{t('upcomingAppointments')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('hospitalItem')}</TableHead>
                        <TableHead>{t('department')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('timeSlot')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment: any) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {hospitals.find((h: any) => h.id === appointment.hospitalId)?.name || 'Hospital'}
                          </TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>{appointment.timeSlot}</TableCell>
                          <TableCell>
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'completed' ? 'success' :
                              appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                            }>
                              {appointment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">{t('noAppointments')}</p>
                    <Link href="/">
                      <Button className="mt-2">{t('findHospital')}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {user.role === 'hospital' && (
            <TabsContent value="hospitals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{t('myHospitals')}</span>
                    <Button size="sm" onClick={handleAddHospital}>
                      <span className="material-icons mr-1">add</span>
                      {t('addHospital')}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hospitals.length > 0 ? (
                    <div className="space-y-4">
                      {hospitals.filter((h: any) => h.ownerId === user.id).map((hospital: any) => (
                        <Card key={hospital.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{hospital.name}</h3>
                                <p className="text-muted-foreground">{hospital.address}, {hospital.city}</p>
                                <p className="text-sm mt-1">{hospital.specialties}</p>
                              </div>
                              <Badge variant={hospital.available ? 'default' : 'secondary'}>
                                {hospital.available ? t('open') : t('closed')}
                              </Badge>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditHospital(hospital.id)}
                              >
                                <span className="material-icons text-sm mr-1">edit</span>
                                {t('edit')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleManageDoctors(hospital.id)}
                              >
                                <span className="material-icons text-sm mr-1">people</span>
                                {t('manageDoctors')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">{t('noHospitalsRegistered')}</p>
                      <Button className="mt-2" onClick={handleAddHospital}>
                        <span className="material-icons mr-1">add</span>
                        {t('registerHospital')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {user.role === 'donor' && (
            <TabsContent value="donorProfile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('donorInformation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center">
                        <span className="font-bold text-2xl">O+</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('bloodGroup')}</p>
                        <p className="font-medium">O+</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('lastDonation')}</p>
                        <p>3 months ago</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('donorStatus')}</p>
                        <Badge variant="success">{t('available')}</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        <span className="material-icons mr-2">edit</span>
                        {t('updateDonorProfile')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      
      <MobileNavigation />
    </div>
  );
};

export default Dashboard;
