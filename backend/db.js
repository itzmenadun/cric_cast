require('dotenv').config()

const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

function normalizePostgresUrl(raw) {
  if (!raw) return raw
  try {
    const u = new URL(raw)
    // Force proper percent-encoding for special chars (e.g., commas) in password.
    // URL serialization will encode as needed.
    u.password = u.password
    return u.toString()
  } catch {
    return raw
  }
}

const connectionString = normalizePostgresUrl(process.env.DATABASE_URL);
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
