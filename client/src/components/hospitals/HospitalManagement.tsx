import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import HospitalForm from "./HospitalForm";
import DoctorForm from "./DoctorForm";

interface HospitalManagementProps {
  hospitalId: number;
  onClose: () => void;
}

const HospitalManagement = ({ hospitalId, onClose }: HospitalManagementProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  
  // Fetch hospital data
  const { data: hospital, isLoading: isLoadingHospital } = useQuery({
    queryKey: [`/api/hospitals/${hospitalId}`],
  });
  
  // Fetch hospital doctors
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: [`/api/hospitals/${hospitalId}/doctors`],
  });
  
  // Handle doctor removal
  const handleRemoveDoctor = async (doctorId: number) => {
    if (!confirm(t("confirmRemoveDoctor"))) {
      return;
    }
    
    try {
      await apiRequest(`/api/doctors/${doctorId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      toast({
        title: t("success"),
        description: t("doctorRemoved"),
      });
      
      // Invalidate queries to refetch doctor data
      queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospitalId}/doctors`] });
    } catch (error) {
      console.error("Error removing doctor:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };
  
  // Handle hospital availability toggle
  const handleToggleAvailability = async () => {
    try {
      await apiRequest(`/api/hospitals/${hospitalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          available: !hospital.available,
        }),
      });
      
      toast({
        title: t("success"),
        description: hospital.available ? t("hospitalMarkedClosed") : t("hospitalMarkedOpen"),
      });
      
      // Invalidate queries to refetch hospital data
      queryClient.invalidateQueries({ queryKey: [`/api/hospitals/${hospitalId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/hospitals'] });
    } catch (error) {
      console.error("Error toggling hospital availability:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };
  
  if (isLoadingHospital) {
    return (
      <div className="p-8 text-center">
        <span className="material-icons animate-spin">refresh</span>
        <p>{t("loading")}</p>
      </div>
    );
  }
  
  if (!hospital) {
    return (
      <div className="p-8 text-center">
        <p>{t("hospitalNotFound")}</p>
        <Button className="mt-4" onClick={onClose}>
          {t("back")}
        </Button>
      </div>
    );
  }
  
  if (isEditing) {
    return (
      <HospitalForm
        hospital={hospital}
        onSuccess={() => {
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }
  
  if (isAddingDoctor || editingDoctor) {
    return (
      <DoctorForm
        hospitalId={hospitalId}
        doctor={editingDoctor}
        onSuccess={() => {
          setIsAddingDoctor(false);
          setEditingDoctor(null);
        }}
        onCancel={() => {
          setIsAddingDoctor(false);
          setEditingDoctor(null);
        }}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{hospital.name}</h2>
          <p className="text-muted-foreground">{hospital.address}, {hospital.city}, {hospital.state}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <span className="material-icons mr-1">arrow_back</span>
          {t("back")}
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">{t("hospitalDetails")}</TabsTrigger>
          <TabsTrigger value="doctors">{t("manageDoctors")}</TabsTrigger>
          <TabsTrigger value="facilities">{t("facilities")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{t("hospitalDetails")}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleToggleAvailability}>
                    {hospital.available ? t("markAsClosed") : t("markAsOpen")}
                  </Button>
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <span className="material-icons mr-1">edit</span>
                    {t("edit")}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("hospitalName")}</p>
                    <p className="font-medium">{hospital.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("status")}</p>
                    <Badge variant={hospital.available ? "default" : "secondary"}>
                      {hospital.available ? t("open") : t("closed")}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">{t("address")}</p>
                  <p>{hospital.address}</p>
                  <p>{hospital.city}, {hospital.state}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("phone")}</p>
                    <p>{hospital.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("coordinates")}</p>
                    <p>
                      {hospital.latitude ? hospital.latitude.toFixed(6) : "N/A"}, 
                      {hospital.longitude ? hospital.longitude.toFixed(6) : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">{t("specialties")}</p>
                  <p>{hospital.specialties}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{t("doctors")}</span>
                <Button size="sm" onClick={() => setIsAddingDoctor(true)}>
                  <span className="material-icons mr-1">add</span>
                  {t("addDoctor")}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDoctors ? (
                <div className="text-center py-4">
                  <span className="material-icons animate-spin">refresh</span>
                  <p>{t("loading")}</p>
                </div>
              ) : doctors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("specialty")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.map((doctor: any) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {doctor.name}
                          </div>
                        </TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>
                          <Badge variant={doctor.available ? "default" : "secondary"}>
                            {doctor.available ? t("available") : t("unavailable")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingDoctor(doctor)}
                            >
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveDoctor(doctor.id)}
                            >
                              <span className="material-icons text-sm text-destructive">delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">{t("noDoctorsRegistered")}</p>
                  <Button className="mt-2" onClick={() => setIsAddingDoctor(true)}>
                    <span className="material-icons mr-1">add</span>
                    {t("addDoctor")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("facilities")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{t("facilitiesDescription")}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Emergency Services', 'ICU', 'Operation Theater', 'X-Ray', 'CT Scan', 'MRI', 'Ambulance', 'Laboratory', 'Blood Bank', 'Pharmacy'].map((facility) => (
                    <div key={facility} className="flex items-start space-x-2">
                      <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                        <span className="material-icons text-primary text-sm">check</span>
                      </div>
                      <div>
                        <p className="font-medium">{facility}</p>
                        <p className="text-sm text-muted-foreground">{t("available24x7")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalManagement;