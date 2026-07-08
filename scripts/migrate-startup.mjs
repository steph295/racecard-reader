/**
 * Runs all *.sql migration files in /drizzle on startup (idempotent).
 * Tracks applied migrations in a __drizzle_migrations table.
 */
import postgres from "postgres";
import { readFileSync, readdirSync } from "fs";
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
  await sql`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL UNIQUE,
      created_at BIGINT
    )
  `;

  const applied = await sql`SELECT hash FROM "__drizzle_migrations"`;
  const appliedSet = new Set(applied.map((r) => r.hash));

  const sqlFiles = readdirSync(drizzleDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of sqlFiles) {
    if (appliedSet.has(file)) {
      console.log(`Already applied: ${file}`);
      continue;
    }
    const migrationSql = readFileSync(join(drizzleDir, file), "utf8");
    console.log(`Applying: ${file}`);
    await sql.unsafe(migrationSql);
    await sql`
      INSERT INTO "__drizzle_migrations" (hash, created_at)
      VALUES (${file}, ${Date.now()})
    `;
    console.log(`Done: ${file}`);
  }

  console.log("All migrations complete.");
} catch (err) {
  console.error("Migration error:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
