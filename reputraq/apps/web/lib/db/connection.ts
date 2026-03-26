import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';

function resolveDatabaseUrl(): string | null {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.NEON_DATABASE_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return value;
  }

  return null;
}

const connectionString = resolveDatabaseUrl();

// Connection pool configuration - optimized for Render PostgreSQL
const connectionConfig = {
  prepare: false,
  max: 5, // Reduced for better stability
  idle_timeout: 30, // Keep connections alive longer
  connect_timeout: 90, // Increased timeout for sleeping databases (Render free tier can take 30-60s to wake)
  max_lifetime: 60 * 30, // Keep connections alive for 30 minutes
  onnotice: () => { }, // Disable notices to reduce noise
  transform: {
    undefined: null, // Transform undefined to null
  },
  // Enhanced SSL configuration for Render
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certificates
    checkServerIdentity: () => undefined, // Skip hostname verification
  },
  // DNS resolution settings
  host_type: 'tcp', // Force TCP connection
  application_name: 'reputraq-app', // Identify the connection
};

// Global connection manager
class DatabaseManager {
  private static instance: DatabaseManager;
  private client: postgres.Sql | null = null;
  private dbInstance: ReturnType<typeof drizzle> | null = null;
  private isConnecting = false;

  private constructor() { }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async getDatabase() {
    if (!this.client || !this.dbInstance) {
      if (this.isConnecting) {
        // Wait for existing connection attempt
        return this.waitForConnection();
      }
      await this.createConnection();
    }
    return this.dbInstance!;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.dbInstance) return false;
      await this.dbInstance.execute(sql`SELECT 1 as health_check`);
      return true;
    } catch (error: any) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async createConnection(retryCount = 0): Promise<void> {
    if (this.isConnecting) return;

    this.isConnecting = true;
    const maxRetries = 2;
    const retryDelay = 2000;

    try {
      if (!connectionString) {
        throw new Error('Database URL is not set (DATABASE_URL/POSTGRES_URL)');
      }

      console.log(`📡 Connecting to database (attempt ${retryCount + 1}/${maxRetries + 1})...`);

      // Detailed extraction for better debugging
      const url = new URL(connectionString);
      const user = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const host = url.hostname;
      const port = parseInt(url.port || '5432');
      const database = url.pathname.substring(1) || 'postgres';

      console.log(`🔗 Target: ${host}:${port}, User: ${user}`);

      this.client = postgres({
        host,
        port,
        user,
        password,
        database,
        ssl: 'require',
        timeout: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Vital for poolers
      });

      this.dbInstance = drizzle(this.client, { schema });

      // Fast probe
      await this.client`SELECT 1`;
      console.log('✅ Database connection established successfully');
    } catch (err: any) {
      console.error(`❌ Connection failed (attempt ${retryCount + 1}):`, err.message);

      if (this.client) {
        await this.client.end().catch(() => { });
      }
      this.client = null;
      this.dbInstance = null;

      if (retryCount < maxRetries && !err.message.includes('password') && !err.message.includes('Tenant')) {
        this.isConnecting = false;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.createConnection(retryCount + 1);
      }

      this.isConnecting = false;
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  private async waitForConnection() {
    let attempts = 0;
    while (this.isConnecting && attempts < 50) { // Wait up to 5 seconds
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    return this.dbInstance!;
  }

  async closeDatabase() {
    if (this.client) {
      console.log('Closing database connection...');
      try {
        await this.client.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
      this.client = null;
      this.dbInstance = null;
    }
  }
}

// Create singleton instance
const dbManager = DatabaseManager.getInstance();

// Export functions
export async function getDatabase() {
  return await dbManager.getDatabase();
}

export async function closeDatabase() {
  return await dbManager.closeDatabase();
}

export async function isDatabaseHealthy() {
  return await dbManager.isHealthy();
}

export function hasDatabaseUrl(): boolean {
  return !!connectionString;
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
  });
}

// Export the database instance (async)
export const db = getDatabase();

// Keep-alive mechanism for Render free tier databases
let keepAliveInterval: NodeJS.Timeout | null = null;

export function startKeepAlive() {
  if (keepAliveInterval) return; // Already running

  console.log('Starting database keep-alive mechanism...');
  keepAliveInterval = setInterval(async () => {
    try {
      const db = await getDatabase();
      await db.execute(sql`SELECT 1 as keep_alive`);
      console.log('Database keep-alive ping successful');
    } catch (error) {
      console.log('Database keep-alive ping failed:', error.message);
    }
  }, 300000); // Every 5 minutes
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('Database keep-alive mechanism stopped');
  }
}

// Start keep-alive automatically in production and development
// This prevents Render free tier databases from sleeping
// You can disable it by setting ENABLE_DB_KEEPALIVE=false
const shouldStartKeepAlive = process.env.ENABLE_DB_KEEPALIVE !== 'false' &&
  (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development');

if (shouldStartKeepAlive) {
  // Start keep-alive after a short delay to ensure connection is established
  setTimeout(() => {
    startKeepAlive();
  }, 5000); // Start after 5 seconds
}
