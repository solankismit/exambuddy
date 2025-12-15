#!/usr/bin/env tsx

/**
 * Script to create an admin user
 * Usage: npx tsx scripts/create-admin.ts <email> <password> [name]
 * Example: npx tsx scripts/create-admin.ts admin@example.com password123 "Admin User"
 */

// Load environment variables from .env.local or .env
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try to load .env.local first, then fallback to .env
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log("Loaded environment variables from .env.local");
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("Loaded environment variables from .env");
} else {
  console.warn(
    "Warning: No .env.local or .env file found. Using system environment variables."
  );
}

import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing required environment variables");
  console.error(
    "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: npx tsx scripts/create-admin.ts <email> <password> [name]"
    );
    console.error(
      'Example: npx tsx scripts/create-admin.ts admin@example.com password123 "Admin User"'
    );
    process.exit(1);
  }

  const [email, password, name] = args;

  if (!email || !password) {
    console.error("Error: Email and password are required");
    process.exit(1);
  }

  try {
    console.log(`Creating admin user: ${email}...`);

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to ADMIN...`);

      // Update existing user to ADMIN
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });

      console.log("✅ User role updated to ADMIN successfully!");
      console.log(`User ID: ${updatedUser.id}`);
      console.log(`Email: ${updatedUser.email}`);
      console.log(`Role: ${updatedUser.role}`);
      console.log(`Name: ${updatedUser.name || "N/A"}`);

      await prisma.$disconnect();
      return;
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user in Supabase using admin API
    const { data: supabaseUser, error: supabaseError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: name || null,
        },
      });

    if (supabaseError || !supabaseUser.user) {
      console.error(
        "Error creating user in Supabase:",
        supabaseError?.message || "Unknown error"
      );
      process.exit(1);
    }

    console.log("✅ User created in Supabase");

    // Create user in Prisma database with ADMIN role
    const user = await prisma.user.create({
      data: {
        id: supabaseUser.user.id,
        email: supabaseUser.user.email!,
        name: name || null,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Name: ${user.name || "N/A"}`);
    console.log("\nYou can now login with these credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
