import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchRoomsSchema, insertBookingSchema, insertPaymentSchema, loginSchema } from "@shared/schema";
import session from "express-session";
import { z } from "zod";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { randomUUID } from "crypto";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      isAdmin: boolean;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session for authentication
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "hotel-booking-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Configure passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        // In a real app, password would be hashed and compared securely
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Authentication middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ user });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.json({ user: null });
    }
  });

  // Room routes
  app.get("/api/rooms", async (req, res, next) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/rooms/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const room = await storage.getRoom(id);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/rooms/search", async (req, res, next) => {
    try {
      const params = searchRoomsSchema.parse(req.body);
      const rooms = await storage.searchRooms(params);
      res.json(rooms);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Admin room routes
  app.post("/api/admin/rooms", requireAdmin, async (req, res, next) => {
    try {
      const room = await storage.createRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.put("/api/admin/rooms/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedRoom = await storage.updateRoom(id, req.body);
      
      if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(updatedRoom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.delete("/api/admin/rooms/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRoom(id);
      
      if (!success) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Availability routes
  app.get("/api/rooms/:id/availability", async (req, res, next) => {
    try {
      const roomId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const isAvailable = await storage.checkRoomAvailability(roomId, start, end);
      const roomDates = await storage.getRoomDates(roomId, start, end);
      
      res.json({ isAvailable, dates: roomDates });
    } catch (error) {
      next(error);
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res, next) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        referenceNumber: `BK${Date.now().toString().slice(-8)}${randomUUID().slice(0, 4)}`
      });
      
      // Check if room is available for the given dates
      const isAvailable = await storage.checkRoomAvailability(
        bookingData.roomId, 
        new Date(bookingData.checkInDate), 
        new Date(bookingData.checkOutDate)
      );
      
      if (!isAvailable) {
        return res.status(400).json({ message: "Room is not available for the selected dates" });
      }
      
      // Create booking
      const booking = await storage.createBooking(bookingData);
      
      // If user is authenticated, associate booking with user
      if (req.isAuthenticated() && req.user) {
        const userId = (req.user as any).id;
        await storage.updateBooking(booking.id, { userId });
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.get("/api/bookings/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // If the booking belongs to a user, only allow that user or an admin to view it
      if (booking.userId && req.isAuthenticated()) {
        const user = req.user as any;
        if (booking.userId !== user.id && !user.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      res.json(booking);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bookings/reference/:reference", async (req, res, next) => {
    try {
      const reference = req.params.reference;
      const booking = await storage.getBookingByReference(reference);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/my-bookings", requireAuth, async (req, res, next) => {
    try {
      const userId = (req.user as any).id;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bookings/:id/cancel", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow the booking user or an admin to cancel it
      if (req.isAuthenticated()) {
        const user = req.user as any;
        if (booking.userId !== user.id && !user.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updatedBooking = await storage.cancelBooking(id);
      res.json(updatedBooking);
    } catch (error) {
      next(error);
    }
  });

  // Admin booking routes
  app.get("/api/admin/bookings", requireAdmin, async (req, res, next) => {
    try {
      const bookings = Array.from((await storage.getRooms()).map(async (room) => {
        return await storage.getBookingsByRoom(room.id);
      })).flat();
      
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/bookings/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedBooking = await storage.updateBooking(id, req.body);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  // Payment routes
  app.post("/api/payments", async (req, res, next) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // In a real application, this would integrate with a payment gateway
      // For now, we'll simulate successful payment processing
      
      const payment = await storage.createPayment(paymentData);
      
      // Update the booking status to confirmed if payment is successful
      if (payment.status === "completed") {
        await storage.updateBooking(payment.bookingId, { status: "confirmed" });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      next(error);
    }
  });

  app.get("/api/payments/booking/:id", requireAuth, async (req, res, next) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Only allow the booking user or an admin to view payments
      if (req.isAuthenticated()) {
        const user = req.user as any;
        if (booking.userId !== user.id && !user.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const payments = await storage.getPaymentsByBooking(bookingId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
