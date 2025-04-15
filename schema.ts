import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // standard, deluxe, suite, executive
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url").notNull(),
  capacity: integer("capacity").notNull(),
  amenities: json("amenities").$type<string[]>().notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  rating: doublePrecision("rating"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  totalAmount: doublePrecision("total_amount").notNull(),
  referenceNumber: text("reference_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomDates = pgTable("room_dates", {
  roomId: integer("room_id").references(() => rooms.id).notNull(),
  date: timestamp("date").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  price: doublePrecision("price"),
  bookingId: integer("booking_id").references(() => bookings.id),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.roomId, table.date] }),
  };
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  bookings: many(bookings),
  roomDates: many(roomDates),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  payments: many(payments),
  roomDates: many(roomDates),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const roomDatesRelations = relations(roomDates, ({ one }) => ({
  room: one(rooms, {
    fields: [roomDates.roomId],
    references: [rooms.id],
  }),
  booking: one(bookings, {
    fields: [roomDates.bookingId],
    references: [bookings.id],
  }),
}));

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

export const insertRoomDateSchema = createInsertSchema(roomDates);

// Types for the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertRoomDate = z.infer<typeof insertRoomDateSchema>;

// Types for the tables
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type RoomDate = typeof roomDates.$inferSelect;

// Additional schemas for API endpoints
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const searchRoomsSchema = z.object({
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  guests: z.number().int().min(1),
  roomType: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  amenities: z.array(z.string()).optional(),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type SearchRoomsParams = z.infer<typeof searchRoomsSchema>;
