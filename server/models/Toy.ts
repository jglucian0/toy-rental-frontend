import { db } from "../database/setup";

export interface Toy {
  id: number;
  name: string;
  category: string;
  status: "available" | "rented" | "maintenance" | "damaged";
  condition: "excellent" | "good" | "fair" | "poor";
  daily_rate: number;
  value: number;
  total_quantity: number;
  available_quantity: number;
  size?: string;
  energy?: string;
  inflatable_type?: string;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateToyData {
  name: string;
  category: string;
  status?: "available" | "rented" | "maintenance" | "damaged";
  condition?: "excellent" | "good" | "fair" | "poor";
  daily_rate: number;
  value: number;
  total_quantity: number;
  available_quantity: number;
  size?: string;
  energy?: string;
  inflatable_type?: string;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
}

export interface UpdateToyData {
  name?: string;
  category?: string;
  status?: "available" | "rented" | "maintenance" | "damaged";
  condition?: "excellent" | "good" | "fair" | "poor";
  daily_rate?: number;
  value?: number;
  total_quantity?: number;
  available_quantity?: number;
  size?: string;
  energy?: string;
  inflatable_type?: string;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
}

export class ToyRepository {
  /**
   * Get all toys with optional filters
   */
  static getAll(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Toy[] {
    let query = "SELECT * FROM toys WHERE 1=1";
    const params: any[] = [];

    if (filters?.status && filters.status !== "all") {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters?.category && filters.category !== "all") {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters?.search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += " ORDER BY name ASC";

    return db.prepare(query).all(params) as Toy[];
  }

  /**
   * Get toy by ID
   */
  static getById(id: number): Toy | null {
    const query = "SELECT * FROM toys WHERE id = ?";
    return db.prepare(query).get(id) as Toy | null;
  }

  /**
   * Create new toy
   */
  static create(data: CreateToyData): Toy {
    const query = `
      INSERT INTO toys (
        name, category, status, condition, daily_rate, value, total_quantity, available_quantity,
        size, energy, inflatable_type, location, description, last_maintenance, next_maintenance, purchase_date, purchase_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db
      .prepare(query)
      .run(
        data.name,
        data.category,
        data.status || "available",
        data.condition || "excellent",
        data.daily_rate,
        data.value,
        data.total_quantity,
        data.available_quantity,
        data.size || null,
        data.energy || null,
        data.inflatable_type || null,
        data.location || null,
        data.description || null,
        data.last_maintenance || null,
        data.next_maintenance || null,
        data.purchase_date || null,
        data.purchase_price || null,
      );

    const toy = this.getById(result.lastInsertRowid as number);
    if (!toy) {
      throw new Error("Failed to create toy");
    }

    return toy;
  }

  /**
   * Update toy
   */
  static update(id: number, data: UpdateToyData): Toy | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      params.push(data.name);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      params.push(data.category);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.condition !== undefined) {
      updates.push("condition = ?");
      params.push(data.condition);
    }
    if (data.daily_rate !== undefined) {
      updates.push("daily_rate = ?");
      params.push(data.daily_rate);
    }
    if (data.value !== undefined) {
      updates.push("value = ?");
      params.push(data.value);
    }
    if (data.total_quantity !== undefined) {
      updates.push("total_quantity = ?");
      params.push(data.total_quantity);
    }
    if (data.available_quantity !== undefined) {
      updates.push("available_quantity = ?");
      params.push(data.available_quantity);
    }
    if (data.size !== undefined) {
      updates.push("size = ?");
      params.push(data.size);
    }
    if (data.energy !== undefined) {
      updates.push("energy = ?");
      params.push(data.energy);
    }
    if (data.inflatable_type !== undefined) {
      updates.push("inflatable_type = ?");
      params.push(data.inflatable_type);
    }
    if (data.location !== undefined) {
      updates.push("location = ?");
      params.push(data.location);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.last_maintenance !== undefined) {
      updates.push("last_maintenance = ?");
      params.push(data.last_maintenance);
    }
    if (data.next_maintenance !== undefined) {
      updates.push("next_maintenance = ?");
      params.push(data.next_maintenance);
    }
    if (data.purchase_date !== undefined) {
      updates.push("purchase_date = ?");
      params.push(data.purchase_date);
    }
    if (data.purchase_price !== undefined) {
      updates.push("purchase_price = ?");
      params.push(data.purchase_price);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    params.push(id);
    const query = `UPDATE toys SET ${updates.join(", ")} WHERE id = ?`;

    const result = db.prepare(query).run(params);

    if (result.changes === 0) {
      return null;
    }

    return this.getById(id);
  }

  /**
   * Delete toy
   */
  static delete(id: number): boolean {
    const query = "DELETE FROM toys WHERE id = ?";
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  /**
   * Get toy statistics
   */
  static getStats(): {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    damaged: number;
    categories: { [key: string]: number };
    totalValue: number;
    totalInventoryValue: number;
  } {
    const statusQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'damaged' THEN 1 ELSE 0 END) as damaged,
        SUM(COALESCE(purchase_price, 0)) as totalValue,
        SUM(COALESCE(value, 0)) as totalInventoryValue
      FROM toys
    `;

    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM toys
      GROUP BY category
      ORDER BY count DESC
    `;

    const stats = db.prepare(statusQuery).get() as any;
    const categoryRows = db.prepare(categoryQuery).all() as any[];

    const categories: { [key: string]: number } = {};
    for (const row of categoryRows) {
      categories[row.category] = row.count;
    }

    return {
      total: stats.total,
      available: stats.available,
      rented: stats.rented,
      maintenance: stats.maintenance,
      damaged: stats.damaged,
      categories,
      totalValue: stats.totalValue,
      totalInventoryValue: stats.totalInventoryValue,
    };
  }

  /**
   * Get toys that need maintenance soon
   */
  static getNeedingMaintenance(daysAhead = 7): Toy[] {
    const query = `
      SELECT * FROM toys 
      WHERE next_maintenance IS NOT NULL 
      AND date(next_maintenance) <= date('now', '+' || ? || ' days')
      ORDER BY next_maintenance ASC
    `;
    return db.prepare(query).all(daysAhead) as Toy[];
  }

  /**
   * Get available toys for a date range
   */
  static getAvailableForDateRange(startDate: string, endDate: string): Toy[] {
    // This is a simplified version - in a real app you'd check actual bookings
    const query = `
      SELECT * FROM toys 
      WHERE status = 'available'
      AND available_quantity > 0
      ORDER BY name ASC
    `;
    return db.prepare(query).all() as Toy[];
  }
}
