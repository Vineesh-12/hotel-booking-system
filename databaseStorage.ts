import { eq, and, between, gte, lte, like, or, desc, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users, rooms, bookings, payments, roomDates,
  type User, type Room, type Booking, type Payment, type RoomDate,
  type InsertUser, type InsertRoom, type InsertBooking, type InsertPayment, type InsertRoomDate,
  type SearchRoomsParams
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Room operations
  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms);
  }

  async createRoom(roomData: InsertRoom): Promise<Room> {
    const [room] = await db.insert(rooms).values(roomData).returning();
    return room;
  }

  async updateRoom(id: number, roomData: Partial<Room>): Promise<Room | undefined> {
    const [updatedRoom] = await db
      .update(rooms)
      .set(roomData)
      .where(eq(rooms.id, id))
      .returning();
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return result.rowCount > 0;
  }

  async searchRooms(params: SearchRoomsParams): Promise<Room[]> {
    // Convert string dates to Date objects
    const checkInDate = new Date(params.checkInDate);
    const checkOutDate = new Date(params.checkOutDate);

    // First, find rooms that are available for the specified date range
    const availableRoomIds = new Set<number>();

    // Get all room dates for the specified range
    const roomDateRecords = await db
      .select()
      .from(roomDates)
      .where(
        and(
          gte(roomDates.date, checkInDate),
          lte(roomDates.date, checkOutDate),
          eq(roomDates.isAvailable, false)
        )
      );

    // Create a set of room IDs that are not available
    const unavailableRoomIds = new Set(roomDateRecords.map(rd => rd.roomId));

    // Get all rooms that match the filter criteria
    let baseQuery = db.select().from(rooms);
    
    // Build conditions array
    const conditions = [
      eq(rooms.isAvailable, true),
      gte(rooms.capacity, params.guests)
    ];
    
    // Add additional filters
    if (params.roomType) {
      conditions.push(eq(rooms.type, params.roomType));
    }

    if (params.minPrice !== undefined) {
      conditions.push(gte(rooms.price, params.minPrice));
    }

    if (params.maxPrice !== undefined) {
      conditions.push(lte(rooms.price, params.maxPrice));
    }
    
    // Apply all conditions at once
    const availableRooms = await baseQuery.where(and(...conditions));

    // Filter out rooms that are not available for the date range
    return availableRooms.filter(room => !unavailableRoomIds.has(room.id));
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.referenceNumber, reference));
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByRoom(roomId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.roomId, roomId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    // Create the booking record
    const [booking] = await db.insert(bookings).values(bookingData).returning();

    // Mark the room dates as unavailable
    const checkInDate = new Date(bookingData.checkInDate);
    const checkOutDate = new Date(bookingData.checkOutDate);
    
    // Helper to get all dates between check-in and check-out
    const getDatesInRange = (start: Date, end: Date) => {
      const dates = [];
      const currentDate = new Date(start);
      while (currentDate < end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    };

    // Mark room dates as unavailable
    const dates = getDatesInRange(checkInDate, checkOutDate);
    for (const date of dates) {
      await this.setRoomDateAvailability({
        roomId: bookingData.roomId,
        date,
        isAvailable: false,
        bookingId: booking.id,
        price: null
      });
    }

    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async cancelBooking(id: number): Promise<Booking | undefined> {
    // Update booking status to cancelled
    const [cancelledBooking] = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id))
      .returning();

    if (!cancelledBooking) return undefined;

    // Make room dates available again
    await db
      .update(roomDates)
      .set({ isAvailable: true, bookingId: null })
      .where(eq(roomDates.bookingId, id));

    return cancelledBooking;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Room date availability operations
  async getRoomDates(roomId: number, startDate: Date, endDate: Date): Promise<RoomDate[]> {
    return await db
      .select()
      .from(roomDates)
      .where(
        and(
          eq(roomDates.roomId, roomId),
          gte(roomDates.date, startDate),
          lte(roomDates.date, endDate)
        )
      )
      .orderBy(asc(roomDates.date));
  }

  async setRoomDateAvailability(roomDateData: InsertRoomDate): Promise<RoomDate> {
    // Check if the room date already exists
    const existingRoomDates = await db
      .select()
      .from(roomDates)
      .where(
        and(
          eq(roomDates.roomId, roomDateData.roomId),
          eq(roomDates.date, roomDateData.date)
        )
      );

    // If the room date exists, update it
    if (existingRoomDates.length > 0) {
      const [updatedRoomDate] = await db
        .update(roomDates)
        .set(roomDateData)
        .where(
          and(
            eq(roomDates.roomId, roomDateData.roomId),
            eq(roomDates.date, roomDateData.date)
          )
        )
        .returning();
      return updatedRoomDate;
    }

    // If the room date doesn't exist, create a new one
    const [newRoomDate] = await db
      .insert(roomDates)
      .values(roomDateData)
      .returning();

    return newRoomDate;
  }

  async checkRoomAvailability(roomId: number, startDate: Date, endDate: Date): Promise<boolean> {
    const unavailableDates = await db
      .select()
      .from(roomDates)
      .where(
        and(
          eq(roomDates.roomId, roomId),
          eq(roomDates.isAvailable, false),
          gte(roomDates.date, startDate),
          lte(roomDates.date, endDate)
        )
      );

    return unavailableDates.length === 0;
  }
}