import { db } from "../server/db";
import { sql } from "drizzle-orm";

// Run the migration
async function main() {
  console.log("Starting migration to add created_by column to projects table...");

  try {
    // Add the created_by column to the projects table
    await db.execute(sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS created_by INTEGER;
    `);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });