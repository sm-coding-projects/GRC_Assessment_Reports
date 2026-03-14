const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://grc:grc_password@localhost:5432/grc_db";
  const pool = new Pool({ connectionString });

  try {
    // Check if admin already exists
    const existing = await pool.query(
      `SELECT COUNT(*) FROM "User" WHERE role = 'ADMIN'`
    );

    if (parseInt(existing.rows[0].count, 10) > 0) {
      console.log("[seed] Admin user already exists, skipping.");
      return;
    }

    const email = process.env.ADMIN_EMAIL || "admin@local";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate a cuid-like ID
    const id = "seed_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    await pool.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ADMIN', NOW(), NOW())`,
      [id, email, "Administrator", passwordHash]
    );

    console.log("[seed] Created admin user: " + email);
    console.log("[seed] IMPORTANT: Change the default password after first login!");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("[seed] Error:", e);
  process.exit(1);
});
