/**
 * Runs drizzle migration SQL files against DATABASE_URL on startup.
 * Reads drizzle/_journal.json to find which migrations to apply, then
 * executes each SQL file that hasn't been applied yet.
 */
import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const drizzleDir = join(__dirname, "..", "drizzle");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set — skipping migrations");
  process.exit(0);
}

const sql = postgres(url, { max: 1 });

try {
  // Ensure the drizzle migrations table exists
  await sql`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `;

  const journal = JSON.parse(
    readFileSync(join(drizzleDir, "meta", "_journal.json"), "utf8")
  );

  const applied = await sql`SELECT hash FROM "__drizzle_migrations"`;
  const appliedHashes = new Set(applied.map((r) => r.hash));

  for (const entry of journal.entries) {
    if (appliedHashes.has(entry.tag)) {
      console.log(`Migration already applied: ${entry.tag}`);
      continue;
    }
    const sqlFile = join(drizzleDir, `${entry.tag}.sql`);
    const migrationSql = readFileSync(sqlFile, "utf8");
    console.log(`Applying migration: ${entry.tag}`);
    await sql.unsafe(migrationSql);
    await sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at)
      VALUES (${entry.tag}, ${Date.now()})
    `;
    console.log(`Migration applied: ${entry.tag}`);
  }

  console.log("Migrations complete.");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
