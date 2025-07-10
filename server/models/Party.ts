import { db } from "../database/setup";
import { Client } from "./Client";

export interface Party {
  id: number;
  title: string;
  client_id: number;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  type: "Infantil" | "Corporativo" | "Aniversário" | "Casamento" | "Formatura";
  guests: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  value: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Related data
  client?: Client;
  toys?: string[];
}

export interface CreatePartyData {
  title: string;
  client_id: number;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  type: "Infantil" | "Corporativo" | "Aniversário" | "Casamento" | "Formatura";
  guests?: number;
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  value: number;
  notes?: string;
  toys?: string[];
}

export interface UpdatePartyData {
  title?: string;
  client_id?: number;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  type?: "Infantil" | "Corporativo" | "Aniversário" | "Casamento" | "Formatura";
  guests?: number;
  status?: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  value?: number;
  notes?: string;
  toys?: string[];
}

export class PartyRepository {
  /**
   * Get all parties with optional filters
   */
  static getAll(filters?: {
    status?: string;
    type?: string;
    clientId?: number;
    startDate?: string;
    endDate?: string;
    includeClient?: boolean;
  }): Party[] {
    let query = `
      SELECT 
        p.*,
        ${
          filters?.includeClient
            ? "c.name as client_name, c.email as client_email, c.phone as client_phone"
            : "NULL as client_name, NULL as client_email, NULL as client_phone"
        }
      FROM parties p
      ${filters?.includeClient ? "LEFT JOIN clients c ON p.client_id = c.id" : ""}
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.status && filters.status !== "all") {
      query += " AND p.status = ?";
      params.push(filters.status);
    }

    if (filters?.type && filters.type !== "all") {
      query += " AND p.type = ?";
      params.push(filters.type);
    }

    if (filters?.clientId) {
      query += " AND p.client_id = ?";
      params.push(filters.clientId);
    }

    if (filters?.startDate) {
      query += " AND p.date >= ?";
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += " AND p.date <= ?";
      params.push(filters.endDate);
    }

    query += " ORDER BY p.date DESC, p.time DESC";

    const parties = db.prepare(query).all(params) as any[];

    return parties.map((party) => {
      // For now, toys will be handled as simple strings
      // Later we can implement proper many-to-many relationship
      const toys: string[] = [];

      const result: Party = {
        id: party.id,
        title: party.title,
        client_id: party.client_id,
        date: party.date,
        time: party.time,
        duration: party.duration,
        location: party.location,
        type: party.type,
        guests: party.guests,
        status: party.status,
        value: party.value,
        notes: party.notes,
        created_at: party.created_at,
        updated_at: party.updated_at,
        toys,
      };

      if (filters?.includeClient && party.client_name) {
        result.client = {
          id: party.client_id,
          name: party.client_name,
          email: party.client_email,
          phone: party.client_phone,
        } as Client;
      }

      return result;
    });
  }

  /**
   * Get party by ID
   */
  static getById(id: number, includeClient = true): Party | null {
    const parties = this.getAll({ includeClient });
    return parties.find((p) => p.id === id) || null;
  }

  /**
   * Create new party
   */
  static create(data: CreatePartyData): Party {
    const query = `
      INSERT INTO parties (
        title, client_id, date, time, duration, location, 
        type, guests, status, value, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db
      .prepare(query)
      .run(
        data.title,
        data.client_id,
        data.date,
        data.time,
        data.duration || null,
        data.location || null,
        data.type,
        data.guests || 0,
        data.status || "pending",
        data.value,
        data.notes || null,
      );

    const partyId = result.lastInsertRowid as number;
    const party = this.getById(partyId);
    if (!party) {
      throw new Error("Failed to create party");
    }

    return party;
  }

  /**
   * Update party
   */
  static update(id: number, data: UpdatePartyData): Party | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.client_id !== undefined) {
      updates.push("client_id = ?");
      params.push(data.client_id);
    }
    if (data.date !== undefined) {
      updates.push("date = ?");
      params.push(data.date);
    }
    if (data.time !== undefined) {
      updates.push("time = ?");
      params.push(data.time);
    }
    if (data.duration !== undefined) {
      updates.push("duration = ?");
      params.push(data.duration);
    }
    if (data.location !== undefined) {
      updates.push("location = ?");
      params.push(data.location);
    }
    if (data.type !== undefined) {
      updates.push("type = ?");
      params.push(data.type);
    }
    if (data.guests !== undefined) {
      updates.push("guests = ?");
      params.push(data.guests);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.value !== undefined) {
      updates.push("value = ?");
      params.push(data.value);
    }
    if (data.notes !== undefined) {
      updates.push("notes = ?");
      params.push(data.notes);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    params.push(id);
    const query = `UPDATE parties SET ${updates.join(", ")} WHERE id = ?`;

    const result = db.prepare(query).run(params);

    if (result.changes === 0) {
      return null;
    }

    return this.getById(id);
  }

  /**
   * Delete party
   */
  static delete(id: number): boolean {
    const query = "DELETE FROM parties WHERE id = ?";
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  /**
   * Get party statistics
   */
  static getStats(): {
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageValue: number;
    upcomingWeek: number;
  } {
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status != 'cancelled' THEN value ELSE 0 END) as totalRevenue,
        AVG(CASE WHEN status != 'cancelled' THEN value ELSE NULL END) as averageValue
      FROM parties
    `;

    const upcomingQuery = `
      SELECT COUNT(*) as count
      FROM parties
      WHERE date BETWEEN date('now') AND date('now', '+7 days')
      AND status NOT IN ('cancelled', 'completed')
    `;

    const stats = db.prepare(statusQuery).get() as any;
    const upcoming = db.prepare(upcomingQuery).get() as any;

    return {
      total: stats.total,
      pending: stats.pending,
      confirmed: stats.confirmed,
      inProgress: stats.inProgress,
      completed: stats.completed,
      cancelled: stats.cancelled,
      totalRevenue: stats.totalRevenue || 0,
      averageValue: stats.averageValue || 0,
      upcomingWeek: upcoming.count,
    };
  }

  /**
   * Get parties for calendar view
   */
  static getForCalendar(year: number, month: number): any[] {
    const query = `
      SELECT 
        p.*,
        c.name as client_name
      FROM parties p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE strftime('%Y', p.date) = ? 
      AND strftime('%m', p.date) = ?
      AND p.status != 'cancelled'
      ORDER BY p.date ASC, p.time ASC
    `;

    return db
      .prepare(query)
      .all(year.toString(), month.toString().padStart(2, "0")) as any[];
  }
}
