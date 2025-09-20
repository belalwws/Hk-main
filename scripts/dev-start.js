// Start development server with local SQLite database

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set environment variables for development
process.env.DATABASE_URL = "file:./dev.db";
process.env.JWT_SECRET = "dev-jwt-secret-key-not-for-production-use-only";
process.env.NODE_ENV = "development";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "dev-nextauth-secret-for-local-development";

console.log("🚀 Starting development server with local SQLite database...");
console.log("📊 Environment variables set:");
console.log("   DATABASE_URL:", process.env.DATABASE_URL);
console.log("   NODE_ENV:", process.env.NODE_ENV);
console.log("");

// Check if dev.db exists
const dbPath = path.join(process.cwd(), "dev.db");
if (!fs.existsSync(dbPath)) {
  console.log("📝 Creating new SQLite database...");
} else {
  console.log("✅ Using existing SQLite database");
}

// Start Next.js development server
const nextDev = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

nextDev.on("close", (code) => {
  console.log(`Development server exited with code ${code}`);
});

nextDev.on("error", (error) => {
  console.error("Error starting development server:", error);
});
