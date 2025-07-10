import { db } from "../database/setup";

export interface Transaction {
  id: number;
  description: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  date: string;
  party_id?: number;
  client_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Related data
  party_title?: string;
  client_name?: string;
}

export interface CreateTransactionData {
  description: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  date: string;
  party_id?: number;
  client_id?: number;
  notes?: string;
}

export interface UpdateTransactionData {
  description?: string;
  type?: "income" | "expense";
  amount?: number;
  category?: string;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  date?: string;
  party_id?: number;
  client_id?: number;
  notes?: string;
}

export class TransactionRepository {
  /**
   * Get all transactions with optional filters
   */
  static getAll(filters?: {
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    clientId?: number;
    partyId?: number;
    includeRelated?: boolean;
  }): Transaction[] {
    let query = `
      SELECT 
        t.*,
        ${
          filters?.includeRelated
            ? "p.title as party_title, c.name as client_name"
            : "NULL as party_title, NULL as client_name"
        }
      FROM transactions t
      ${
        filters?.includeRelated
          ? `
        LEFT JOIN parties p ON t.party_id = p.id
        LEFT JOIN clients c ON t.client_id = c.id
      `
          : ""
      }
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.type && filters.type !== "all") {
      query += " AND t.type = ?";
      params.push(filters.type);
    }

    if (filters?.category && filters.category !== "all") {
      query += " AND t.category = ?";
      params.push(filters.category);
    }

    if (filters?.status && filters.status !== "all") {
      query += " AND t.status = ?";
      params.push(filters.status);
    }

    if (filters?.startDate) {
      query += " AND t.date >= ?";
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += " AND t.date <= ?";
      params.push(filters.endDate);
    }

    if (filters?.clientId) {
      query += " AND t.client_id = ?";
      params.push(filters.clientId);
    }

    if (filters?.partyId) {
      query += " AND t.party_id = ?";
      params.push(filters.partyId);
    }

    query += " ORDER BY t.date DESC, t.created_at DESC";

    return db.prepare(query).all(params) as Transaction[];
  }

  /**
   * Get transaction by ID
   */
  static getById(id: number, includeRelated = true): Transaction | null {
    const transactions = this.getAll({ includeRelated });
    return transactions.find((t) => t.id === id) || null;
  }

  /**
   * Create new transaction
   */
  static create(data: CreateTransactionData): Transaction {
    const query = `
      INSERT INTO transactions (
        description, type, amount, category, status, date, 
        party_id, client_id, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db
      .prepare(query)
      .run(
        data.description,
        data.type,
        data.amount,
        data.category,
        data.status || "pending",
        data.date,
        data.party_id || null,
        data.client_id || null,
        data.notes || null,
      );

    const transaction = this.getById(result.lastInsertRowid as number);
    if (!transaction) {
      throw new Error("Failed to create transaction");
    }

    return transaction;
  }

  /**
   * Update transaction
   */
  static update(id: number, data: UpdateTransactionData): Transaction | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.type !== undefined) {
      updates.push("type = ?");
      params.push(data.type);
    }
    if (data.amount !== undefined) {
      updates.push("amount = ?");
      params.push(data.amount);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      params.push(data.category);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }
    if (data.date !== undefined) {
      updates.push("date = ?");
      params.push(data.date);
    }
    if (data.party_id !== undefined) {
      updates.push("party_id = ?");
      params.push(data.party_id);
    }
    if (data.client_id !== undefined) {
      updates.push("client_id = ?");
      params.push(data.client_id);
    }
    if (data.notes !== undefined) {
      updates.push("notes = ?");
      params.push(data.notes);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    params.push(id);
    const query = `UPDATE transactions SET ${updates.join(", ")} WHERE id = ?`;

    const result = db.prepare(query).run(params);

    if (result.changes === 0) {
      return null;
    }

    return this.getById(id);
  }

  /**
   * Delete transaction
   */
  static delete(id: number): boolean {
    const query = "DELETE FROM transactions WHERE id = ?";
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  }

  /**
   * Get financial statistics
   */
  static getStats(period?: { startDate?: string; endDate?: string }): {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pendingIncome: number;
    pendingExpenses: number;
    categorySummary: { [key: string]: { income: number; expense: number } };
    monthlyTrend: { month: string; income: number; expense: number }[];
  } {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (period?.startDate) {
      whereClause += " AND date >= ?";
      params.push(period.startDate);
    }

    if (period?.endDate) {
      whereClause += " AND date <= ?";
      params.push(period.endDate);
    }

    // Total income and expenses
    const totalsQuery = `
      SELECT 
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END) as totalExpenses,
        SUM(CASE WHEN type = 'income' AND status = 'pending' THEN amount ELSE 0 END) as pendingIncome,
        SUM(CASE WHEN type = 'expense' AND status = 'pending' THEN amount ELSE 0 END) as pendingExpenses
      FROM transactions
      ${whereClause}
    `;

    // Category summary
    const categoryQuery = `
      SELECT 
        category,
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END) as expense
      FROM transactions
      ${whereClause}
      GROUP BY category
      ORDER BY (income + expense) DESC
    `;

    // Monthly trend (last 12 months)
    const trendQuery = `
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `;

    const totals = db.prepare(totalsQuery).get(params) as any;
    const categoryRows = db.prepare(categoryQuery).all(params) as any[];
    const trendRows = db.prepare(trendQuery).all() as any[];

    const categorySummary: {
      [key: string]: { income: number; expense: number };
    } = {};
    for (const row of categoryRows) {
      categorySummary[row.category] = {
        income: row.income,
        expense: row.expense,
      };
    }

    return {
      totalIncome: totals.totalIncome || 0,
      totalExpenses: totals.totalExpenses || 0,
      netProfit: (totals.totalIncome || 0) - (totals.totalExpenses || 0),
      pendingIncome: totals.pendingIncome || 0,
      pendingExpenses: totals.pendingExpenses || 0,
      categorySummary,
      monthlyTrend: trendRows,
    };
  }

  /**
   * Get overdue transactions
   */
  static getOverdue(): Transaction[] {
    const query = `
      SELECT t.*, p.title as party_title, c.name as client_name
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.status = 'pending' 
      AND t.date < date('now')
      ORDER BY t.date ASC
    `;

    return db.prepare(query).all() as Transaction[];
  }

  /**
   * Get unique categories
   */
  static getCategories(): string[] {
    const query =
      "SELECT DISTINCT category FROM transactions ORDER BY category ASC";
    const rows = db.prepare(query).all() as { category: string }[];
    return rows.map((row) => row.category);
  }
}
