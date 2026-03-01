import { 
  User, InsertUser, Hospital, InsertHospital, Doctor, InsertDoctor, 
  BloodDonor, InsertBloodDonor, Appointment, InsertAppointment, Review, InsertReview 
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Hospital operations
  getHospital(id: number): Promise<Hospital | undefined>;
  getHospitals(): Promise<Hospital[]>;
  getNearbyHospitals(lat: number, lng: number, radius: number): Promise<Hospital[]>;
  getHospitalsByOwner(ownerId: number): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: number, hospital: Partial<Hospital>): Promise<Hospital | undefined>;
  
  // Doctor operations
  getDoctorsByHospital(hospitalId: number): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<Doctor>): Promise<Doctor | undefined>;
  
  // Blood donor operations
  getBloodDonor(id: number): Promise<BloodDonor | undefined>;
  getBloodDonors(): Promise<BloodDonor[]>;
  getNearbyBloodDonors(bloodGroup: string, lat: number, lng: number, radius: number): Promise<BloodDonor[]>;
  createBloodDonor(donor: InsertBloodDonor): Promise<BloodDonor>;
  updateBloodDonor(id: number, donor: Partial<BloodDonor>): Promise<BloodDonor | undefined>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByHospital(hospitalId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Review operations
  getReviewsByHospital(hospitalId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

// Memory Storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hospitals: Map<number, Hospital>;
  private doctors: Map<number, Doctor>;
  private bloodDonors: Map<number, BloodDonor>;
  private appointments: Map<number, Appointment>;
  private reviews: Map<number, Review>;
  
  private userId: number;
  private hospitalId: number;
  private doctorId: number;
  private donorId: number;
  private appointmentId: number;
  private reviewId: number;
  
  constructor() {
    this.users = new Map();
    this.hospitals = new Map();
    this.doctors = new Map();
    this.bloodDonors = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    
    this.userId = 1;
    this.hospitalId = 1;
    this.doctorId = 1;
    this.donorId = 1;
    this.appointmentId = 1;
    this.reviewId = 1;
    
    // Add sample data for testing
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Hospital operations
  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }
  
  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }
  
  async getNearbyHospitals(lat: number, lng: number, radius: number): Promise<Hospital[]> {
    // Simple implementation - in a real app, we would use a spatial database
    return Array.from(this.hospitals.values())
      .map(hospital => {
        // Calculate distance for this hospital
        const distanceKm = this.calculateDistance(lat, lng, hospital.latitude, hospital.longitude);
        
        // Format the distance for display
        const distance = distanceKm < 1 
          ? `${Math.round(distanceKm * 1000)} m` 
          : `${distanceKm.toFixed(1)} km`;
        
        // Return hospital with distance information
        return {
          ...hospital,
          distance,
          distanceKm // Keep raw distance for sorting
        };
      })
      // Filter hospitals within the radius
      .filter(hospital => hospital.distanceKm <= radius)
      // Sort by closest first
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
  
  async getHospitalsByOwner(ownerId: number): Promise<Hospital[]> {
    return Array.from(this.hospitals.values()).filter(hospital => hospital.ownerId === ownerId);
  }
  
  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = this.hospitalId++;
    const hospital: Hospital = { ...insertHospital, id };
    this.hospitals.set(id, hospital);
    return hospital;
  }
  
  async updateHospital(id: number, hospitalUpdate: Partial<Hospital>): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (!hospital) return undefined;
    
    const updatedHospital = { ...hospital, ...hospitalUpdate };
    this.hospitals.set(id, updatedHospital);
    return updatedHospital;
  }
  
  // Doctor operations
  async getDoctorsByHospital(hospitalId: number): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(doctor => doctor.hospitalId === hospitalId);
  }
  
  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }
  
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.doctorId++;
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    return doctor;
  }
  
  async updateDoctor(id: number, doctorUpdate: Partial<Doctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const updatedDoctor = { ...doctor, ...doctorUpdate };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }
  
  // Blood donor operations
  async getBloodDonor(id: number): Promise<BloodDonor | undefined> {
    return this.bloodDonors.get(id);
  }
  
  async getBloodDonors(): Promise<BloodDonor[]> {
    return Array.from(this.bloodDonors.values());
  }
  
  async getNearbyBloodDonors(bloodGroup: string, lat: number, lng: number, radius: number): Promise<BloodDonor[]> {
    return Array.from(this.bloodDonors.values())
      .map(donor => {
        // Calculate distance for this donor
        const distanceKm = this.calculateDistance(lat, lng, donor.latitude, donor.longitude);
        
        // Format the distance for display
        const distance = distanceKm < 1 
          ? `${Math.round(distanceKm * 1000)} m` 
          : `${distanceKm.toFixed(1)} km`;
        
        // Return donor with distance information
        return {
          ...donor,
          distance,
          distanceKm // Keep raw distance for sorting
        };
      })
      // Filter donors within the radius and by blood group if specified
      .filter(donor => 
        (bloodGroup ? donor.bloodGroup === bloodGroup : true) && 
        donor.distanceKm <= radius
      )
      // Sort by closest first
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
  
  async createBloodDonor(insertDonor: InsertBloodDonor): Promise<BloodDonor> {
    const id = this.donorId++;
    const donor: BloodDonor = { ...insertDonor, id };
    this.bloodDonors.set(id, donor);
    return donor;
  }
  
  async updateBloodDonor(id: number, donorUpdate: Partial<BloodDonor>): Promise<BloodDonor | undefined> {
    const donor = this.bloodDonors.get(id);
    if (!donor) return undefined;
    
    const updatedDonor = { ...donor, ...donorUpdate };
    this.bloodDonors.set(id, updatedDonor);
    return updatedDonor;
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.userId === userId);
  }
  
  async getAppointmentsByHospital(hospitalId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.hospitalId === hospitalId);
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Review operations
  async getReviewsByHospital(hospitalId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.hospitalId === hospitalId);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);
    
    // Update hospital rating
    const hospital = this.hospitals.get(insertReview.hospitalId);
    if (hospital) {
      const reviews = await this.getReviewsByHospital(insertReview.hospitalId);
      const totalRatings = reviews.length;
      const rating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
      
      await this.updateHospital(insertReview.hospitalId, {
        rating,
        totalRatings
      });
    }
    
    return review;
  }
  
  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for calculating distance between two points on earth
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  // Sample data for testing
  private seedData() {
    // Add sample users
    const user1 = this.createUser({ 
      email: "user@example.com", 
      password: "password", 
      firstName: "John", 
      lastName: "Doe", 
      phone: "+91-9876543210", 
      role: "user",
      medicalConditions: ""
    });
    
    const user2 = this.createUser({ 
      email: "hospital@example.com", 
      password: "password", 
      firstName: "Admin", 
      lastName: "Hospital", 
      phone: "+91-9876543211", 
      role: "hospital",
      medicalConditions: ""
    });
    
    const user3 = this.createUser({ 
      email: "donor@example.com", 
      password: "password", 
      firstName: "Blood", 
      lastName: "Donor", 
      phone: "+91-9876543212", 
      role: "donor",
      medicalConditions: ""
    });
    
    // Add admin user
    const adminUser = this.createUser({ 
      email: "admin@health-emergency.com", 
      password: "admin123", 
      firstName: "System", 
      lastName: "Administrator", 
      phone: "+91-9876543299", 
      role: "admin",
      medicalConditions: ""
    });
    
    // Add sample hospitals in Bagalkot (near user's location)
    const hospital1 = this.createHospital({
      ownerId: 2,
      name: "Bagalkot District Hospital",
      address: "Civil Hospital Road",
      city: "Bagalkot",
      state: "Karnataka",
      specialties: "General Medicine, Emergency Care, Surgery",
      latitude: 16.8505,
      longitude: 75.7192,
      phone: "+91 8354 235 678",
      available: true,
      rating: 4.2,
      totalRatings: 78
    });
    
    const hospital2 = this.createHospital({
      ownerId: 2,
      name: "HSK Hospital and Research Centre",
      address: "Navanagar",
      city: "Bagalkot",
      state: "Karnataka",
      specialties: "Cardiology, Neurology, Orthopedics",
      latitude: 16.8458,
      longitude: 75.7105,
      phone: "+91 8354 221 345",
      available: true,
      rating: 4.5,
      totalRatings: 112
    });
    
    const hospital3 = this.createHospital({
      ownerId: 2,
      name: "SB Patil Memorial Hospital",
      address: "Vidyagiri",
      city: "Bagalkot",
      state: "Karnataka",
      specialties: "Family Medicine, Pediatrics, Gynecology",
      latitude: 16.8402,
      longitude: 75.7252,
      phone: "+91 8354 233 789",
      available: true,
      rating: 4.1,
      totalRatings: 65
    });
    
    // Add more hospitals in surrounding areas
    const hospital4 = this.createHospital({
      ownerId: 2,
      name: "Kerudi Hospital",
      address: "Station Road",
      city: "Bagalkot",
      state: "Karnataka",
      specialties: "General Medicine, Surgery, Orthopedics",
      latitude: 16.8522,
      longitude: 75.7012,
      phone: "+91 8354 245 123",
      available: true,
      rating: 3.9,
      totalRatings: 45
    });
    
    // Add Vijayapura hospitals
    const hospital5 = this.createHospital({
      ownerId: 2,
      name: "Vijayapura District Hospital",
      address: "Station Road",
      city: "Vijayapura",
      state: "Karnataka",
      specialties: "General Medicine, Emergency Care, Surgery",
      latitude: 16.8302,
      longitude: 75.7142,
      phone: "+91 8352 250 345",
      available: true,
      rating: 4.2,
      totalRatings: 38
    });
    
    const hospital6 = this.createHospital({
      ownerId: 2,
      name: "Al-Ameen Medical College Hospital",
      address: "Nehru Market",
      city: "Vijayapura",
      state: "Karnataka",
      specialties: "Cardiology, Internal Medicine, Neurology",
      latitude: 16.8287,
      longitude: 75.7251,
      phone: "+91 8352 272 100",
      available: true,
      rating: 4.5,
      totalRatings: 42
    });
    
    const hospital7 = this.createHospital({
      ownerId: 2,
      name: "BLDE University Health Centre",
      address: "MG Road",
      city: "Vijayapura",
      state: "Karnataka",
      specialties: "Multi-specialty, Orthopedics, Gynecology",
      latitude: 16.8189,
      longitude: 75.7172,
      phone: "+91 8352 262 770",
      available: true,
      rating: 4.7,
      totalRatings: 156
    });
    
    // Add Solapur hospitals
    const hospital8 = this.createHospital({
      ownerId: 2,
      name: "Solapur Civil Hospital",
      address: "Railway Station Road",
      city: "Solapur",
      state: "Maharashtra",
      specialties: "General Medicine, Emergency Care, Trauma Care",
      latitude: 17.6599,
      longitude: 75.9064,
      phone: "+91 217 273 1901",
      available: true,
      rating: 4.1,
      totalRatings: 87
    });
    
    const hospital9 = this.createHospital({
      ownerId: 2,
      name: "Ashwini Rural Medical College Hospital",
      address: "Hotgi Road",
      city: "Solapur",
      state: "Maharashtra",
      specialties: "Cardiology, Neurology, Orthopedics",
      latitude: 17.6683,
      longitude: 75.9106,
      phone: "+91 217 235 6777",
      available: true,
      rating: 4.8,
      totalRatings: 124
    });
    
    const hospital10 = this.createHospital({
      ownerId: 2,
      name: "Yashodhara Super Speciality Hospital",
      address: "Sadar Bazar",
      city: "Solapur",
      state: "Maharashtra",
      specialties: "Multi-specialty, Critical Care, Cardiac Care",
      latitude: 17.6721,
      longitude: 75.9044,
      phone: "+91 217 233 8080",
      available: true,
      rating: 4.6,
      totalRatings: 156
    });
    
    const hospital11 = this.createHospital({
      ownerId: 2,
      name: "Shri Chatrapati Shivaji Maharaj Hospital",
      address: "Saat Rasta",
      city: "Solapur",
      state: "Maharashtra",
      specialties: "Pediatrics, Obstetrics, General Surgery",
      latitude: 17.6631,
      longitude: 75.8956,
      phone: "+91 217 232 7070",
      available: true,
      rating: 4.3,
      totalRatings: 92
    });
    
    // Add doctors
    this.createDoctor({
      hospitalId: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 1,
      name: "Dr. Ananya Singh",
      specialty: "Neurology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 1,
      name: "Dr. Vikram Patel",
      specialty: "Emergency Medicine",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 2,
      name: "Dr. Priya Sharma",
      specialty: "Cardiology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 2,
      name: "Dr. Sunil Mehta",
      specialty: "Neurology",
      available: false
    });
    
    this.createDoctor({
      hospitalId: 3,
      name: "Dr. Deepak Verma",
      specialty: "Pediatrics",
      available: true
    });
    
    // Add doctors for Vijayapura hospitals
    this.createDoctor({
      hospitalId: 5,
      name: "Dr. Mohammed Faizal",
      specialty: "Emergency Medicine",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 5,
      name: "Dr. Nandini Kumar",
      specialty: "General Surgery",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 6,
      name: "Dr. Rahul Sharma",
      specialty: "Cardiology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 6,
      name: "Dr. Sana Mirza",
      specialty: "Neurology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 7,
      name: "Dr. Aisha Khan",
      specialty: "Gynecology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 7,
      name: "Dr. Vikas Reddy",
      specialty: "Orthopedics",
      available: true
    });
    
    // Add doctors for Solapur hospitals
    this.createDoctor({
      hospitalId: 8,
      name: "Dr. Suresh Patil",
      specialty: "Emergency Medicine",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 8,
      name: "Dr. Anjali Deshmukh",
      specialty: "General Surgery",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 9,
      name: "Dr. Prakash Jadhav",
      specialty: "Cardiology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 9,
      name: "Dr. Swati Kulkarni",
      specialty: "Neurology",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 10,
      name: "Dr. Ajay Kumbhar",
      specialty: "Critical Care",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 10,
      name: "Dr. Meera Gavit",
      specialty: "Cardiac Surgery",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 11,
      name: "Dr. Vishnu Gaikwad",
      specialty: "Pediatrics",
      available: true
    });
    
    this.createDoctor({
      hospitalId: 11,
      name: "Dr. Rupa Mane",
      specialty: "Obstetrics & Gynecology",
      available: true
    });
    
    // Add blood donors near Bagalkot
    this.createBloodDonor({
      userId: 3,
      bloodGroup: "O+",
      lastDonated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      available: true,
      latitude: 16.8455,
      longitude: 75.7180
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "A-",
      lastDonated: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), // 150 days ago
      available: true,
      latitude: 16.8499,
      longitude: 75.7110
    });
    
    // Add more blood donors with different blood groups in Bagalkot
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "B+",
      lastDonated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8510,
      longitude: 75.7160
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "AB+",
      lastDonated: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8430,
      longitude: 75.7140
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "O-",
      lastDonated: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8470,
      longitude: 75.7230
    });
    
    // Add blood donors in Vijayapura
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "A+",
      lastDonated: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8302,
      longitude: 75.7152
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "B-",
      lastDonated: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8287,
      longitude: 75.7231
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "O+",
      lastDonated: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 16.8210,
      longitude: 75.7172
    });
    
    // Add blood donors in Solapur
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "O-",
      lastDonated: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 17.6599,
      longitude: 75.9064
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "A+",
      lastDonated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 17.6683,
      longitude: 75.9106
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "B+",
      lastDonated: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 17.6721,
      longitude: 75.9044
    });
    
    this.createBloodDonor({
      userId: 1,
      bloodGroup: "AB-",
      lastDonated: new Date(Date.now() - 160 * 24 * 60 * 60 * 1000),
      available: true,
      latitude: 17.6631,
      longitude: 75.8956
    });
    
    // Create reviews
    this.createReview({
      userId: 1,
      hospitalId: 1,
      rating: 5,
      comment: "Excellent service and care!"
    });
    
    this.createReview({
      userId: 3,
      hospitalId: 2,
      rating: 4,
      comment: "Good doctors but long waiting times."
    });
  }
}

export const storage = new MemStorage();
