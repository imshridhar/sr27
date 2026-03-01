import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, insertHospitalSchema, insertDoctorSchema, 
  insertBloodDonorSchema, insertAppointmentSchema, insertReviewSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import memorystore from "memorystore";

// Session management
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // JSON parsing middleware
  app.use(express.json());
  
  // Add session middleware
  const MemoryStore = memorystore(session);
  
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: "sr27-secret-key"
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Error handling middleware
  const handleErrors = (fn: Function) => async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  // Auth routes
  app.post("/api/auth/register", handleErrors(async (req: Request, res: Response) => {
    const userInput = insertUserSchema.parse(req.body);
    
    // Check if user with email already exists
    const existingUser = await storage.getUserByEmail(userInput.email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Create user
    const user = await storage.createUser(userInput);
    
    // Set session
    req.session.userId = user.id;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }));
  
  app.post("/api/auth/login", handleErrors(async (req: Request, res: Response) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });
    
    const { email, password } = schema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Set session
    req.session.userId = user.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", handleErrors(async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));
  
  // Hospital routes
  app.get("/api/hospitals", handleErrors(async (req: Request, res: Response) => {
    const { lat, lng, radius } = req.query;
    
    if (lat && lng && radius) {
      const hospitals = await storage.getNearbyHospitals(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );
      return res.json(hospitals);
    }
    
    const hospitals = await storage.getHospitals();
    res.json(hospitals);
  }));
  
  app.get("/api/hospitals/:id", handleErrors(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    const hospital = await storage.getHospital(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Get doctors for this hospital
    const doctors = await storage.getDoctorsByHospital(id);
    
    // Get reviews for this hospital
    const reviews = await storage.getReviewsByHospital(id);
    
    res.json({
      ...hospital,
      doctors,
      reviews
    });
  }));
  
  app.post("/api/hospitals", requireAuth, handleErrors(async (req: Request, res: Response) => {
    // Verify user is a hospital owner
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "hospital") {
      return res.status(403).json({ message: "Only hospital owners can register hospitals" });
    }
    
    const hospitalInput = insertHospitalSchema.parse({
      ...req.body,
      ownerId: req.session.userId
    });
    
    const hospital = await storage.createHospital(hospitalInput);
    res.status(201).json(hospital);
  }));
  
  app.put("/api/hospitals/:id", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Verify hospital exists
    const hospital = await storage.getHospital(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Verify user owns this hospital
    if (hospital.ownerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to edit this hospital" });
    }
    
    // Update hospital
    const updatedHospital = await storage.updateHospital(id, req.body);
    res.json(updatedHospital);
  }));
  
  // Doctor routes
  app.get("/api/hospitals/:hospitalId/doctors", handleErrors(async (req: Request, res: Response) => {
    const hospitalId = parseInt(req.params.hospitalId);
    
    // Verify hospital exists
    const hospital = await storage.getHospital(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    const doctors = await storage.getDoctorsByHospital(hospitalId);
    res.json(doctors);
  }));
  
  app.post("/api/doctors", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const doctorInput = insertDoctorSchema.parse(req.body);
    
    // Verify hospital exists
    const hospital = await storage.getHospital(doctorInput.hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Verify user owns this hospital
    if (hospital.ownerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to add doctors to this hospital" });
    }
    
    const doctor = await storage.createDoctor(doctorInput);
    res.status(201).json(doctor);
  }));
  
  app.put("/api/doctors/:id", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Get the doctor
    const doctor = await storage.getDoctor(id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    // Verify hospital exists
    const hospital = await storage.getHospital(doctor.hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    
    // Verify user owns this hospital
    if (hospital.ownerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to update doctors in this hospital" });
    }
    
    // Update doctor
    const updatedDoctor = await storage.updateDoctor(id, req.body);
    res.json(updatedDoctor);
  }));
  
  // Blood donor routes
  app.get("/api/donors", handleErrors(async (req: Request, res: Response) => {
    const { bloodGroup, lat, lng, radius } = req.query;
    
    if (lat && lng && radius) {
      const donors = await storage.getNearbyBloodDonors(
        bloodGroup as string,
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );
      
      // If not authenticated, don't return contact info
      if (!req.session.userId) {
        return res.json(donors.map(donor => {
          const user = storage.getUser(donor.userId);
          return {
            ...donor,
            contactInfo: null
          };
        }));
      }
      
      // Get user info for each donor
      const donorsWithUserInfo = await Promise.all(
        donors.map(async donor => {
          const user = await storage.getUser(donor.userId);
          return {
            ...donor,
            contactInfo: user ? {
              name: `${user.firstName} ${user.lastName}`,
              phone: user.phone,
              email: user.email
            } : null
          };
        })
      );
      
      return res.json(donorsWithUserInfo);
    }
    
    const donors = await storage.getBloodDonors();
    res.json(donors);
  }));
  
  app.post("/api/donors", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const donorInput = insertBloodDonorSchema.parse({
      ...req.body,
      userId: req.session.userId
    });
    
    const donor = await storage.createBloodDonor(donorInput);
    res.status(201).json(donor);
  }));
  
  app.put("/api/donors/:id", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Verify donor exists and belongs to user
    const donor = await storage.getBloodDonor(id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    
    if (donor.userId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to update this donor" });
    }
    
    // Update donor
    const updatedDonor = await storage.updateBloodDonor(id, req.body);
    res.json(updatedDonor);
  }));
  
  // Appointment routes
  app.get("/api/appointments", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const user = await storage.getUser(req.session.userId);
    
    if (user?.role === "hospital") {
      // If hospital owner, get appointments for all their hospitals
      const hospitals = await storage.getHospitalsByOwner(req.session.userId);
      const hospitalIds = hospitals.map(h => h.id);
      
      const appointmentsPromises = hospitalIds.map(hospitalId => 
        storage.getAppointmentsByHospital(hospitalId)
      );
      
      const appointmentsByHospital = await Promise.all(appointmentsPromises);
      const appointments = appointmentsByHospital.flat();
      
      return res.json(appointments);
    }
    
    // If regular user, get their appointments
    const appointments = await storage.getAppointmentsByUser(req.session.userId);
    res.json(appointments);
  }));
  
  app.post("/api/appointments", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const appointmentInput = insertAppointmentSchema.parse({
      ...req.body,
      userId: req.session.userId
    });
    
    const appointment = await storage.createAppointment(appointmentInput);
    res.status(201).json(appointment);
  }));
  
  app.put("/api/appointments/:id", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    // Verify appointment exists
    const appointment = await storage.getAppointment(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Check authorization
    const user = await storage.getUser(req.session.userId);
    
    if (user?.role === "hospital") {
      // Hospital owners can update appointments for their hospitals
      const hospitals = await storage.getHospitalsByOwner(req.session.userId);
      const isOwner = hospitals.some(h => h.id === appointment.hospitalId);
      
      if (!isOwner) {
        return res.status(403).json({ message: "You don't have permission to update this appointment" });
      }
    } else {
      // Regular users can only update their own appointments
      if (appointment.userId !== req.session.userId) {
        return res.status(403).json({ message: "You don't have permission to update this appointment" });
      }
    }
    
    // Update appointment
    const updatedAppointment = await storage.updateAppointment(id, req.body);
    res.json(updatedAppointment);
  }));
  
  // Review routes
  app.get("/api/hospitals/:hospitalId/reviews", handleErrors(async (req: Request, res: Response) => {
    const hospitalId = parseInt(req.params.hospitalId);
    
    const reviews = await storage.getReviewsByHospital(hospitalId);
    res.json(reviews);
  }));
  
  app.post("/api/reviews", requireAuth, handleErrors(async (req: Request, res: Response) => {
    const reviewInput = insertReviewSchema.parse({
      ...req.body,
      userId: req.session.userId
    });
    
    const review = await storage.createReview(reviewInput);
    res.status(201).json(review);
  }));
  
  // Geolocation API
  app.get("/api/geocode", handleErrors(async (req: Request, res: Response) => {
    const { address, lat, lng } = req.query;
    
    // Handle reverse geocoding (coordinates to address)
    if (lat && lng) {
      console.log(`Reverse geocoding request for lat: ${lat}, lng: ${lng}`);
      
      // Mock reverse geocoding response for the Bagalkot area
      // In a real app, you would call a geocoding service API
      let mockAddress = "Unknown Location, Karnataka, India";
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      // Check for Solapur region first (highest priority as requested)
      if (latitude >= 17.65 && latitude <= 17.68 && longitude >= 75.89 && longitude <= 75.92) {
        // Solapur specific locations
        if (Math.abs(latitude - 17.6599) < 0.01 && Math.abs(longitude - 75.9064) < 0.01) {
          mockAddress = "Railway Station Road, Solapur, Maharashtra 413001";
        } else if (Math.abs(latitude - 17.6683) < 0.01 && Math.abs(longitude - 75.9106) < 0.01) {
          mockAddress = "Hotgi Road, Solapur, Maharashtra 413001";
        } else if (Math.abs(latitude - 17.6721) < 0.01 && Math.abs(longitude - 75.9044) < 0.01) {
          mockAddress = "Sadar Bazar, Solapur, Maharashtra 413001";
        } else if (Math.abs(latitude - 17.6631) < 0.01 && Math.abs(longitude - 75.8956) < 0.01) {
          mockAddress = "Saat Rasta, Solapur, Maharashtra 413001";
        } else {
          // Generic Solapur location
          mockAddress = "Bhavani Peth, Solapur, Maharashtra 413001, India";
        }
      }
      // Check for Vijayapura region second (second priority)
      else if (latitude >= 16.79 && latitude <= 16.85 && longitude >= 75.68 && longitude <= 75.76) {
        // Vijayapura specific locations
        if (Math.abs(latitude - 16.8302) < 0.01 && Math.abs(longitude - 75.7142) < 0.01) {
          mockAddress = "Station Road, Vijayapura, Karnataka 586101";
        } else if (Math.abs(latitude - 16.8287) < 0.01 && Math.abs(longitude - 75.7251) < 0.01) {
          mockAddress = "Nehru Market, Vijayapura, Karnataka 586101";
        } else if (Math.abs(latitude - 16.8189) < 0.01 && Math.abs(longitude - 75.7172) < 0.01) {
          mockAddress = "MG Road, Vijayapura, Karnataka 586103";
        } else if (Math.abs(latitude - 16.8328) < 0.01 && Math.abs(longitude - 75.7067) < 0.01) {
          mockAddress = "APMC Road, Vijayapura, Karnataka 586101";
        } else {
          // Generic Vijayapura location
          mockAddress = "City Center, Vijayapura, Karnataka 586101, India";
        }
      }
      // Then check Bagalkot region (third priority)
      else if (latitude >= 16.83 && latitude <= 16.86 && longitude >= 75.70 && longitude <= 75.73) {
        // More specific locations in Bagalkot
        if (Math.abs(latitude - 16.8505) < 0.005 && Math.abs(longitude - 75.7192) < 0.005) {
          mockAddress = "Civil Hospital Road, Bagalkot, Karnataka 587101";
        } else if (Math.abs(latitude - 16.8458) < 0.005 && Math.abs(longitude - 75.7105) < 0.005) {
          mockAddress = "Navanagar, Bagalkot, Karnataka 587103";
        } else if (Math.abs(latitude - 16.8402) < 0.005 && Math.abs(longitude - 75.7252) < 0.005) {
          mockAddress = "Vidyagiri, Bagalkot, Karnataka 587102";
        } else if (Math.abs(latitude - 16.8522) < 0.005 && Math.abs(longitude - 75.7012) < 0.005) {
          mockAddress = "Station Road, Bagalkot, Karnataka 587101";
        } else if (Math.abs(latitude - 16.8245) < 0.005 && Math.abs(longitude - 75.7352) < 0.005) {
          mockAddress = "Vijayapur Road, Bagalkot, Karnataka 587101";
        } else {
          mockAddress = "Navanagar Main Road, Bagalkot, Karnataka 587103, India";
        }
      } else {
        // Fallback for any other location
        mockAddress = "Your Current Location, Maharashtra, India";
      }
      
      return res.json({
        address: mockAddress,
        latitude: latitude,
        longitude: longitude
      });
    }
    
    // Handle forward geocoding (address to coordinates)
    if (!address) {
      return res.status(400).json({ message: "Address or coordinates (lat/lng) are required" });
    }
    
    console.log(`Forward geocoding request for address: ${address}`);
    
    // Mock geocoding response for demo
    // In a real app, you would call a geocoding service API
    const addressStr = address as string;
    let latitude = 0;
    let longitude = 0;
    
    // Check for Solapur
    if (addressStr.toLowerCase().includes("solapur")) {
      latitude = 17.6599;
      longitude = 75.9064;
      
      // More specific locations in Solapur
      if (addressStr.toLowerCase().includes("railway") || addressStr.toLowerCase().includes("station")) {
        latitude = 17.6599;
        longitude = 75.9064;
      } else if (addressStr.toLowerCase().includes("hotgi")) {
        latitude = 17.6683;
        longitude = 75.9106;
      } else if (addressStr.toLowerCase().includes("sadar") || addressStr.toLowerCase().includes("bazar")) {
        latitude = 17.6721;
        longitude = 75.9044;
      } else if (addressStr.toLowerCase().includes("saat") || addressStr.toLowerCase().includes("rasta")) {
        latitude = 17.6631;
        longitude = 75.8956;
      } else if (addressStr.toLowerCase().includes("bhavani") || addressStr.toLowerCase().includes("peth")) {
        latitude = 17.6589;
        longitude = 75.9029;
      }
    }
    // Check for Vijayapura/Bijapur
    else if (addressStr.toLowerCase().includes("vijayapura") || addressStr.toLowerCase().includes("bijapur")) {
      latitude = 16.8302;
      longitude = 75.7142;
      
      // More specific locations in Vijayapura
      if (addressStr.toLowerCase().includes("station") || addressStr.toLowerCase().includes("railway")) {
        latitude = 16.8302;
        longitude = 75.7142;
      } else if (addressStr.toLowerCase().includes("nehru") || addressStr.toLowerCase().includes("market")) {
        latitude = 16.8287;
        longitude = 75.7251;
      } else if (addressStr.toLowerCase().includes("mg road") || addressStr.toLowerCase().includes("m g road")) {
        latitude = 16.8189;
        longitude = 75.7172;
      } else if (addressStr.toLowerCase().includes("apmc")) {
        latitude = 16.8328;
        longitude = 75.7067;
      } else if (addressStr.toLowerCase().includes("city center")) {
        latitude = 16.8265;
        longitude = 75.7196;
      }
    }
    // Check for Bagalkot
    else if (addressStr.toLowerCase().includes("bagalkot")) {
      latitude = 16.8505;
      longitude = 75.7192;
      
      // More specific locations in Bagalkot
      if (addressStr.toLowerCase().includes("civil") || addressStr.toLowerCase().includes("hospital")) {
        latitude = 16.8505;
        longitude = 75.7192;
      } else if (addressStr.toLowerCase().includes("navanagar")) {
        latitude = 16.8458;
        longitude = 75.7105;
      } else if (addressStr.toLowerCase().includes("vidyagiri")) {
        latitude = 16.8402;
        longitude = 75.7252;
      } else if (addressStr.toLowerCase().includes("station") || addressStr.toLowerCase().includes("railway")) {
        latitude = 16.8522;
        longitude = 75.7012;
      } else if (addressStr.toLowerCase().includes("vijayapur road")) {
        latitude = 16.8245;
        longitude = 75.7352;
      }
    }
    // Default to Bangalore for any other query
    else {
      latitude = 12.972442;
      longitude = 77.580643;
    }
    
    res.json({
      address: addressStr,
      latitude: latitude,
      longitude: longitude
    });
  }));
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
