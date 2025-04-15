import { db } from "./db";
import { rooms, users } from "@shared/schema";
import { log } from "./vite";

async function seed() {
  log("Starting database seed...", "seed");

  // Check if we have any rooms already
  const existingRooms = await db.select().from(rooms);
  
  if (existingRooms.length > 0) {
    log(`Database already has ${existingRooms.length} rooms, skipping seed.`, "seed");
    return;
  }

  try {
    // Create admin user
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: "admin123", // In production, this would be hashed
      email: "admin@luxstay.com",
      name: "Admin User",
      isAdmin: true,
      phone: null
    }).returning();
    
    log(`Created admin user with id ${admin.id}`, "seed");

    // Create sample rooms
    const sampleRooms = [
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
        description: "Comfortable room with two double beds, ideal for families or small groups.",
        type: "standard",
        price: 129,
        imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 3,
        amenities: ["wifi", "tv"],
        isAvailable: true,
        rating: 4.2
      },
      {
        name: "Ocean View Room",
        description: "Stunning room with panoramic ocean views, balcony, and premium bedding.",
        type: "deluxe",
        price: 239,
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 2,
        amenities: ["wifi", "breakfast", "ocean-view", "balcony"],
        isAvailable: true,
        rating: 4.7
      },
      {
        name: "Family Suite",
        description: "Spacious suite with two bedrooms, living area, and kitchenette, perfect for families.",
        type: "suite",
        price: 329,
        imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 6,
        amenities: ["wifi", "breakfast", "kitchen", "tv"],
        isAvailable: true,
        rating: 4.6
      },
      {
        name: "Business Room",
        description: "Practical room designed for business travelers with workspace and high-speed WiFi.",
        type: "standard",
        price: 159,
        imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        capacity: 1,
        amenities: ["wifi", "breakfast", "workspace"],
        isAvailable: true,
        rating: 4.4
      }
    ];

    const createdRooms = await db.insert(rooms).values(sampleRooms).returning();
    
    log(`Created ${createdRooms.length} rooms`, "seed");
    
    log("Database seed completed successfully", "seed");
  } catch (error) {
    log(`Error seeding database: ${error}`, "seed");
    throw error;
  }
}

export default seed;