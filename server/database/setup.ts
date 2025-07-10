import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable foreign keys
db.exec("PRAGMA foreign_keys = ON");

/**
 * Initialize database schema
 */
export function initializeDatabase() {
  // Clients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      document TEXT,
      phone TEXT,
      phone2 TEXT,
      cep TEXT,
      street TEXT,
      number TEXT,
      neighborhood TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'Brasil',
      apartment TEXT,
      block TEXT,
      complement TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'vip')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Toys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS toys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'rented', 'maintenance', 'damaged')),
      condition TEXT DEFAULT 'excellent' CHECK(condition IN ('excellent', 'good', 'fair', 'poor')),
      daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
      value DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_quantity INTEGER NOT NULL DEFAULT 1,
      available_quantity INTEGER NOT NULL DEFAULT 1,
      size TEXT,
      energy TEXT,
      inflatable_type TEXT,
      location TEXT,
      description TEXT,
      last_maintenance DATE,
      next_maintenance DATE,
      purchase_date DATE,
      purchase_price DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Parties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      client_id INTEGER NOT NULL,
      date DATE NOT NULL,
      time TEXT NOT NULL,
      duration TEXT,
      location TEXT,
      type TEXT NOT NULL CHECK(type IN ('Infantil', 'Corporativo', 'Aniversário', 'Casamento', 'Formatura')),
      guests INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
      value DECIMAL(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Party toys (many-to-many relationship)
  db.exec(`
    CREATE TABLE IF NOT EXISTS party_toys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      party_id INTEGER NOT NULL,
      toy_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
      FOREIGN KEY (toy_id) REFERENCES toys(id) ON DELETE CASCADE,
      UNIQUE(party_id, toy_id)
    )
  `);

  // Financial transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount DECIMAL(10,2) NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue', 'cancelled')),
      date DATE NOT NULL,
      party_id INTEGER,
      client_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    )
  `);

  // Activities/logs table for tracking system events
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
    CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
    CREATE INDEX IF NOT EXISTS idx_parties_date ON parties(date);
    CREATE INDEX IF NOT EXISTS idx_parties_status ON parties(status);
    CREATE INDEX IF NOT EXISTS idx_parties_client_id ON parties(client_id);
    CREATE INDEX IF NOT EXISTS idx_toys_status ON toys(status);
    CREATE INDEX IF NOT EXISTS idx_toys_category ON toys(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
  `);

  // Create triggers for updated_at timestamps
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS clients_updated_at
    AFTER UPDATE ON clients
    BEGIN
      UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS toys_updated_at
    AFTER UPDATE ON toys
    BEGIN
      UPDATE toys SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS parties_updated_at
    AFTER UPDATE ON parties
    BEGIN
      UPDATE parties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS transactions_updated_at
    AFTER UPDATE ON transactions
    BEGIN
      UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log("Database schema initialized successfully");
}

/**
 * Seed database with sample data
 */
export function seedDatabase() {
  // Check if data already exists
  const clientCount = db
    .prepare("SELECT COUNT(*) as count FROM clients")
    .get() as { count: number };
  if (clientCount.count > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database with sample data...");

  // Insert sample clients
  const insertClient = db.prepare(`
    INSERT INTO clients (
      name, email, document, phone, phone2, cep, street, number,
      neighborhood, city, state, country, apartment, block, complement,
      status, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const clients = [
    [
      "Maria Silva",
      "maria.silva@email.com",
      "123.456.789-00",
      "(11) 99999-9999",
      "(11) 98888-8888",
      "01310-100",
      "Av. Paulista",
      "123",
      "Bela Vista",
      "São Paulo",
      "SP",
      "Brasil",
      "Apto 45",
      "Bloco A",
      "Próximo ao metrô",
      "active",
      "Cliente preferencial",
    ],
    [
      "João Santos",
      "joao.santos@email.com",
      "987.654.321-00",
      "(11) 88888-8888",
      null,
      "04038-001",
      "Rua Domingos de Morais",
      "456",
      "Vila Mariana",
      "São Paulo",
      "SP",
      "Brasil",
      null,
      null,
      "Casa térrea",
      "active",
      "Empresa ABC",
    ],
    [
      "Ana Costa",
      "ana.costa@email.com",
      "456.789.123-00",
      "(11) 77777-7777",
      "(11) 76666-6666",
      "05407-002",
      "Rua Augusta",
      "789",
      "Consolação",
      "São Paulo",
      "SP",
      "Brasil",
      "Sala 12",
      null,
      "Edifício comercial",
      "inactive",
      "Cliente inativo temporariamente",
    ],
    [
      "Pedro Oliveira",
      "pedro.oliveira@email.com",
      "321.654.987-00",
      "(11) 66666-6666",
      "(11) 65555-5555",
      "01449-001",
      "Rua Oscar Freire",
      "321",
      "Jardins",
      "São Paulo",
      "SP",
      "Brasil",
      "Cobertura",
      "Torre 1",
      "Vista para a cidade",
      "vip",
      "Cliente VIP desde 2022",
    ],
  ];

  for (const client of clients) {
    insertClient.run(...client);
  }

  // Insert sample toys
  const insertToy = db.prepare(`
    INSERT INTO toys (name, category, status, condition, daily_rate, value, total_quantity, available_quantity, size, energy, inflatable_type, location, description, last_maintenance, next_maintenance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const toys = [];

  for (const toy of toys) {
    insertToy.run(...toy);
  }

  // Insert sample parties
  const insertParty = db.prepare(`
    INSERT INTO parties (title, client_id, date, time, duration, location, type, guests, status, value, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const parties = [];

  for (const party of parties) {
    insertParty.run(...party);
  }

  // Insert sample transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (description, type, amount, category, status, date, party_id, client_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transactions = [
    [
      "Festa Infantil - Maria Silva",
      "income",
      1200.0,
      "Festa",
      "paid",
      "2024-01-15",
      1,
      1,
    ],
    [
      "Compra Brinquedos",
      "expense",
      450.0,
      "Equipamentos",
      "paid",
      "2024-01-14",
      null,
      null,
    ],
    [
      "Festa Corporativa - Empresa ABC",
      "income",
      2500.0,
      "Festa",
      "pending",
      "2024-01-13",
      2,
      2,
    ],
    [
      "Manutenção Pula-pula",
      "expense",
      180.0,
      "Manutenção",
      "paid",
      "2024-01-12",
      null,
      null,
    ],
    [
      "Aniversário Miguel",
      "income",
      1500.0,
      "Festa",
      "paid",
      "2024-01-11",
      3,
      3,
    ],
  ];

  for (const transaction of transactions) {
    insertTransaction.run(...transaction);
  }

  console.log("Database seeded successfully");
}

/**
 * Clear all toy records from database
 */
export function clearAllToys() {
  try {
    const deleteToys = db.prepare("DELETE FROM toys");
    const result = deleteToys.run();
    console.log(`Deleted ${result.changes} toy records from database`);
  } catch (error) {
    console.error("Error clearing toys:", error);
  }
}

/**
 * Close database connection
 */
export function closeDatabase() {
  db.close();
}
