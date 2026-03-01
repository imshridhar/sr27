import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with role-based authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // "user", "hospital", "donor", "admin"
  medicalConditions: text("medical_conditions"),
});

// Hospital model
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  specialties: text("specialties").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  phone: text("phone").notNull(),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  rating: doublePrecision("rating").default(0),
  totalRatings: integer("total_ratings").default(0),
});

// Doctor model
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  hospitalId: integer("hospital_id").notNull().references(() => hospitals.id),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  available: boolean("available").notNull().default(true),
});

// Blood Donor model
export const bloodDonors = pgTable("blood_donors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bloodGroup: text("blood_group").notNull(),
  lastDonated: timestamp("last_donated"),
  available: boolean("available").notNull().default(true),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
});

// Appointment model
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hospitalId: integer("hospital_id").notNull().references(() => hospitals.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  date: timestamp("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  department: text("department").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
});

// Hospital Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  hospitalId: integer("hospital_id").notNull().references(() => hospitals.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertHospitalSchema = createInsertSchema(hospitals).omit({ id: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true });
export const insertBloodDonorSchema = createInsertSchema(bloodDonors).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type BloodDonor = typeof bloodDonors.$inferSelect;
export type InsertBloodDonor = z.infer<typeof insertBloodDonorSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Custom types for client
export type HospitalWithDoctors = Hospital & {
  doctors: Doctor[];
};
