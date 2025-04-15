import {
  users, rooms, bookings, payments, roomDates,
  type User, type Room, type Booking, type Payment, type RoomDate,
  type InsertUser, type InsertRoom, type InsertBooking, type InsertPayment, type InsertRoomDate,
  type SearchRoomsParams
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Room operations
  getRoom(id: number): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, roomData: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  searchRooms(params: SearchRoomsParams): Promise<Room[]>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByRoom(roomId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined>;
  cancelBooking(id: number): Promise<Booking | undefined>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined>;
  
  // Room date availability operations
  getRoomDates(roomId: number, startDate: Date, endDate: Date): Promise<RoomDate[]>;
  setRoomDateAvailability(roomDate: InsertRoomDate): Promise<RoomDate>;
  checkRoomAvailability(roomId: number, startDate: Date, endDate: Date): Promise<boolean>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private roomStore: Map<number, Room>;
  private bookingStore: Map<number, Booking>;
  private paymentStore: Map<number, Payment>;
  private roomDateStore: Map<string, RoomDate>; // key: `${roomId}_${date}`
  
  private userIdCounter: number;
  private roomIdCounter: number;
  private bookingIdCounter: number;
  private paymentIdCounter: number;
  
  constructor() {
    this.userStore = new Map();
    this.roomStore = new Map();
    this.bookingStore = new Map();
    this.paymentStore = new Map();
    this.roomDateStore = new Map();
    
    this.userIdCounter = 1;
    this.roomIdCounter = 1;
    this.bookingIdCounter = 1;
    this.paymentIdCounter = 1;
    
    // Add some initial sample rooms
    this.setupSampleData();
  }
  
  private setupSampleData() {
    // Create sample rooms
    const sampleRooms: InsertRoom[] = [
      {
        name: "Deluxe King Room",
        description: "Spacious room with king-sized bed, workspace, and city views. Includes free WiFi and breakfast.",
        type: "deluxe",
        price: 189,
        imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 2,
        amenities: ["wifi", "breakfast", "ac"],
        isAvailable: true,
        rating: 4.8
      },
      {
        name: "Executive Suite",
        description: "Luxurious suite with separate living area, premium amenities, and complimentary minibar.",
        type: "suite",
        price: 279,
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 4,
        amenities: ["wifi", "breakfast", "pool", "minibar"],
        isAvailable: true,
        rating: 4.9
      },
      {
        name: "Standard Double Room",
        description: "Comfortable room with two double beds, perfect for families or small groups.",
        type: "standard",
        price: 139,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 4,
        amenities: ["wifi", "ac", "tv"],
        isAvailable: true,
        rating: 4.6
      },
      {
        name: "Premium Ocean View",
        description: "Stunning ocean views with a private balcony, king-sized bed, and luxury bathroom.",
        type: "deluxe",
        price: 239,
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 2,
        amenities: ["wifi", "breakfast", "pool", "balcony", "ocean-view"],
        isAvailable: true,
        rating: 4.9
      },
      {
        name: "Family Suite",
        description: "Spacious suite with two bedrooms, perfect for families with children.",
        type: "suite",
        price: 349,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 6,
        amenities: ["wifi", "breakfast", "kitchen", "tv", "ac"],
        isAvailable: true,
        rating: 4.7
      }
    ];
    
    sampleRooms.forEach(room => {
      this.createRoom(room);
    });
    
    // Create a sample admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@luxstay.com",
      name: "Admin User",
      isAdmin: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.userStore.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.userStore.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.userStore.set(id, updatedUser);
    return updatedUser;
  }
  
  // Room operations
  async getRoom(id: number): Promise<Room | undefined> {
    return this.roomStore.get(id);
  }
  
  async getRooms(): Promise<Room[]> {
    return Array.from(this.roomStore.values());
  }
  
  async createRoom(room: InsertRoom): Promise<Room> {
    const id = this.roomIdCounter++;
    const newRoom: Room = { ...room, id };
    this.roomStore.set(id, newRoom);
    return newRoom;
  }
  
  async updateRoom(id: number, roomData: Partial<Room>): Promise<Room | undefined> {
    const room = this.roomStore.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...roomData };
    this.roomStore.set(id, updatedRoom);
    return updatedRoom;
  }
  
  async deleteRoom(id: number): Promise<boolean> {
    return this.roomStore.delete(id);
  }
  
  async searchRooms(params: SearchRoomsParams): Promise<Room[]> {
    let rooms = Array.from(this.roomStore.values());
    
    // Filter by availability in date range
    if (params.checkInDate && params.checkOutDate) {
      const checkIn = new Date(params.checkInDate);
      const checkOut = new Date(params.checkOutDate);
      
      const availableRoomIds = new Set<number>();
      for (const room of rooms) {
        if (await this.checkRoomAvailability(room.id, checkIn, checkOut)) {
          availableRoomIds.add(room.id);
        }
      }
      
      rooms = rooms.filter(room => availableRoomIds.has(room.id));
    }
    
    // Filter by room type
    if (params.roomType) {
      rooms = rooms.filter(room => room.type === params.roomType);
    }
    
    // Filter by number of guests
    if (params.guests) {
      rooms = rooms.filter(room => room.capacity >= params.guests);
    }
    
    // Filter by price range
    if (params.minPrice !== undefined) {
      rooms = rooms.filter(room => room.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      rooms = rooms.filter(room => room.price <= params.maxPrice!);
    }
    
    // Filter by amenities
    if (params.amenities && params.amenities.length > 0) {
      rooms = rooms.filter(room => {
        const roomAmenities = room.amenities as string[];
        return params.amenities!.every(amenity => roomAmenities.includes(amenity));
      });
    }
    
    return rooms;
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookingStore.get(id);
  }
  
  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    return Array.from(this.bookingStore.values()).find(
      (booking) => booking.referenceNumber === reference
    );
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookingStore.values()).filter(
      (booking) => booking.userId === userId
    );
  }
  
  async getBookingsByRoom(roomId: number): Promise<Booking[]> {
    return Array.from(this.bookingStore.values()).filter(
      (booking) => booking.roomId === roomId
    );
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const createdAt = new Date();
    const newBooking: Booking = { ...booking, id, createdAt };
    this.bookingStore.set(id, newBooking);
    
    // Mark room dates as unavailable
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
      await this.setRoomDateAvailability({
        roomId: booking.roomId,
        date: date,
        isAvailable: false,
        bookingId: id
      });
    }
    
    return newBooking;
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookingStore.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookingStore.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async cancelBooking(id: number): Promise<Booking | undefined> {
    const booking = this.bookingStore.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status: "cancelled" };
    this.bookingStore.set(id, updatedBooking);
    
    // Mark room dates as available again
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    
    for (let date = new Date(checkIn); date < checkOut; date.setDate(date.getDate() + 1)) {
      await this.setRoomDateAvailability({
        roomId: booking.roomId,
        date: date,
        isAvailable: true,
        bookingId: undefined
      });
    }
    
    return updatedBooking;
  }
  
  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentStore.get(id);
  }
  
  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return Array.from(this.paymentStore.values()).filter(
      (payment) => payment.bookingId === bookingId
    );
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const createdAt = new Date();
    const newPayment: Payment = { ...payment, id, createdAt };
    this.paymentStore.set(id, newPayment);
    return newPayment;
  }
  
  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.paymentStore.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.paymentStore.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Room date availability operations
  async getRoomDates(roomId: number, startDate: Date, endDate: Date): Promise<RoomDate[]> {
    const result: RoomDate[] = [];
    
    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const key = `${roomId}_${dateStr}`;
      let roomDate = this.roomDateStore.get(key);
      
      if (!roomDate) {
        // If no entry exists, the date is available by default
        roomDate = {
          roomId,
          date,
          isAvailable: true
        };
      }
      
      result.push(roomDate);
    }
    
    return result;
  }
  
  async setRoomDateAvailability(roomDate: InsertRoomDate): Promise<RoomDate> {
    const dateStr = new Date(roomDate.date).toISOString().split('T')[0];
    const key = `${roomDate.roomId}_${dateStr}`;
    this.roomDateStore.set(key, roomDate as RoomDate);
    return roomDate as RoomDate;
  }
  
  async checkRoomAvailability(roomId: number, startDate: Date, endDate: Date): Promise<boolean> {
    // Get room to check if it exists and is generally available
    const room = await this.getRoom(roomId);
    if (!room || !room.isAvailable) return false;
    
    // Check each date in the range
    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const key = `${roomId}_${dateStr}`;
      const roomDate = this.roomDateStore.get(key);
      
      // If we have a record for this date and it's not available, return false
      if (roomDate && !roomDate.isAvailable) {
        return false;
      }
    }
    
    // All dates are available
    return true;
  }
}

// Export storage instance
import { DatabaseStorage } from "./databaseStorage";

// To use the in-memory storage, comment out the line below and uncomment the next line
export const storage = new DatabaseStorage();
// export const storage = new MemStorage();
