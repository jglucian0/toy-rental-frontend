import { db } from "../database/setup";

export interface Client {
  id: number;
  name: string;
  email: string;
  document?: string; // CPF/CNPJ
  phone?: string;
  phone2?: string;
  // Address fields
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  apartment?: string;
  block?: string;
  complement?: string;
  // System fields
  status: "active" | "inactive" | "vip";
  notes?: string;
  created_at: string;
  updated_at: string;

  // Computed fields
  totalParties?: number;
  totalSpent?: number;
  lastParty?: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  document?: string;
  phone?: string;
  phone2?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  apartment?: string;
  block?: string;
  complement?: string;
  status?: "active" | "inactive" | "vip";
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
  phone2?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  apartment?: string;
  block?: string;
  complement?: string;
  status?: "active" | "inactive" | "vip";
  notes?: string;
}

export class ClientRepository {
  /**
   * Get all clients with optional filters
   */
  static getAll(filters?: {
    status?: string;
    search?: string;
    includeStats?: boolean;
  }): Client[] {
    let query = `
      SELECT 
        c.*,
        ${
          filters?.includeStats
            ? `
          COALESCE(party_stats.total_parties, 0) as totalParties,
          COALESCE(party_stats.total_spent, 0) as totalSpent,
          party_stats.last_party as lastParty
        `
            : "NULL as totalParties, NULL as totalSpent, NULL as lastParty"
        }
      FROM clients c
      ${
        filters?.includeStats
          ? `
        LEFT JOIN (
          SELECT 
            client_id,
            COUNT(*) as total_parties,
            SUM(value) as total_spent,
            MAX(date) as last_party
          FROM parties 
          WHERE status != 'cancelled'
          GROUP BY client_id
        ) party_stats ON c.id = party_stats.client_id
      `
          : ""
      }
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.status && filters.status !== "all") {
      query += " AND c.status = ?";
      params.push(filters.status);
    }

    if (filters?.search) {
      query += " AND (c.name LIKE ? OR c.email LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY c.name ASC";

    return db.prepare(query).all(params) as Client[];
  }

  /**
   * Get client by ID
   */
  static getById(id: number, includeStats = false): Client | null {
    const clients = this.getAll({ includeStats });
    return clients.find((c) => c.id === id) || null;
  }

  /**
   * Get client by email
   */
  static getByEmail(email: string): Client | null {
    const query = "SELECT * FROM clients WHERE email = ?";
    return db.prepare(query).get(email) as Client | null;
  }

  /**
   * Create new client
   */
  static create(data: CreateClientData): Client {
    const query = `
      INSERT INTO clients (
        name, email, document, phone, phone2, cep, street, number,
        neighborhood, city, state, country, apartment, block, complement,
        status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db
      .prepare(query)
      .run(
        data.name,
        data.email,
        data.document || null,
        data.phone || null,
        data.phone2 || null,
        data.cep || null,
        data.street || null,
        data.number || null,
        data.neighborhood || null,
        data.city || null,
        data.state || null,
        data.country || "Brasil",
        data.apartment || null,
        data.block || null,
        data.complement || null,
        data.status || "active",
        data.notes || null,
      );

    const client = this.getById(result.lastInsertRowid as number);
    if (!client) {
      throw new Error("Failed to create client");
    }

    return client;
  }

  /**
   * Update client
   */
  static update(id: number, data: UpdateClientData): Client | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      params.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      params.push(data.email);
    }
    if (data.document !== undefined) {
      updates.push("document = ?");
      params.push(data.document);
    }
    if (data.phone !== undefined) {
      updates.push("phone = ?");
      params.push(data.phone);
    }
    if (data.phone2 !== undefined) {
      updates.push("phone2 = ?");
      params.push(data.phone2);
    }
    if (data.cep !== undefined) {
      updates.push("cep = ?");
      params.push(data.cep);
    }
    if (data.street !== undefined) {
      updates.push("street = ?");
      params.push(data.street);
    }
    if (data.number !== undefined) {
      updates.push("number = ?");
      params.push(data.number);
    }
    if (data.neighborhood !== undefined) {
      updates.push("neighborhood = ?");
      params.push(data.neighborhood);
    }
    if (data.city !== undefined) {
      updates.push("city = ?");
      params.push(data.city);
    }
    if (data.state !== undefined) {
      updates.push("state = ?");
      params.push(data.state);
    }
    if (data.country !== undefined) {
      updates.push("country = ?");
      params.push(data.country);
    }
    if (data.apartment !== undefined) {
      updates.push("apartment = ?");
      params.push(data.apartment);
    }
    if (data.block !== undefined) {
      updates.push("block = ?");
      params.push(data.block);
    }
    if (data.complement !== undefined) {
      updates.push("complement = ?");
      params.push(data.complement);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.notes !== undefined) {
      updates.push("notes = ?");
      params.push(data.notes);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    params.push(id);
    const query = `UPDATE clients SET ${updates.join(", ")} WHERE id = ?`;

    const result = db.prepare(query).run(params);

    if (result.changes === 0) {
      return null;
    }

    return this.getById(id);
  }

  /**
   * Delete client
   */
  static delete(id: number): boolean {
    const query = "DELETE FROM clients WHERE id = ?";
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  /**
   * Get client statistics
   */
  static getStats(): {
    total: number;
    active: number;
    inactive: number;
    vip: number;
    averageSpent: number;
  } {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'vip' THEN 1 ELSE 0 END) as vip
      FROM clients
    `;

    const averageQuery = `
      SELECT AVG(total_spent) as average
      FROM (
        SELECT SUM(value) as total_spent
        FROM parties p
        JOIN clients c ON p.client_id = c.id
        WHERE p.status != 'cancelled'
        GROUP BY c.id
      ) client_totals
    `;

    const stats = db.prepare(statsQuery).get() as any;
    const average = db.prepare(averageQuery).get() as any;

    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      vip: stats.vip,
      averageSpent: average.average || 0,
    };
  }
}
