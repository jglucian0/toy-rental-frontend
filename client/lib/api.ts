import {
  ApiResponse,
  Party,
  CreatePartyRequest,
  UpdatePartyRequest,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  Toy,
  CreateToyRequest,
  UpdateToyRequest,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  PartyStats,
  ClientStats,
  ToyStats,
  FinancialStats,
  DashboardStats,
} from "@shared/api";

class ApiClient {
  private baseUrl = "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ============================================
  // PARTY API METHODS
  // ============================================

  async getParties(filters?: {
    status?: string;
    type?: string;
    includeClient?: boolean;
  }): Promise<ApiResponse<Party[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.includeClient) params.append("includeClient", "true");

    const query = params.toString();
    return this.request<ApiResponse<Party[]>>(
      `/parties${query ? `?${query}` : ""}`,
    );
  }

  async getParty(id: number): Promise<ApiResponse<Party>> {
    return this.request<ApiResponse<Party>>(
      `/parties/${id}?includeClient=true`,
    );
  }

  async createParty(
    partyData: CreatePartyRequest,
  ): Promise<ApiResponse<Party>> {
    return this.request<ApiResponse<Party>>("/parties", {
      method: "POST",
      body: JSON.stringify(partyData),
    });
  }

  async updateParty(
    id: number,
    updates: UpdatePartyRequest,
  ): Promise<ApiResponse<Party>> {
    return this.request<ApiResponse<Party>>(`/parties/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteParty(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/parties/${id}`, {
      method: "DELETE",
    });
  }

  async getPartyStats(): Promise<ApiResponse<PartyStats>> {
    return this.request<ApiResponse<PartyStats>>("/parties/stats");
  }

  // ============================================
  // CLIENT API METHODS
  // ============================================

  async getClients(filters?: {
    status?: string;
    search?: string;
    includeStats?: boolean;
  }): Promise<ApiResponse<Client[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.includeStats) params.append("includeStats", "true");

    const query = params.toString();
    return this.request<ApiResponse<Client[]>>(
      `/clients${query ? `?${query}` : ""}`,
    );
  }

  async getClient(id: number): Promise<ApiResponse<Client>> {
    return this.request<ApiResponse<Client>>(
      `/clients/${id}?includeStats=true`,
    );
  }

  async createClient(
    clientData: CreateClientRequest,
  ): Promise<ApiResponse<Client>> {
    return this.request<ApiResponse<Client>>("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(
    id: number,
    updates: UpdateClientRequest,
  ): Promise<ApiResponse<Client>> {
    return this.request<ApiResponse<Client>>(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteClient(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/clients/${id}`, {
      method: "DELETE",
    });
  }

  async getClientStats(): Promise<ApiResponse<ClientStats>> {
    return this.request<ApiResponse<ClientStats>>("/clients/stats");
  }

  // ============================================
  // TOY API METHODS
  // ============================================

  async getToys(filters?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<Toy[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);

    const query = params.toString();
    return this.request<ApiResponse<Toy[]>>(`/toys${query ? `?${query}` : ""}`);
  }

  async getToy(id: number): Promise<ApiResponse<Toy>> {
    return this.request<ApiResponse<Toy>>(`/toys/${id}`);
  }

  async createToy(toyData: CreateToyRequest): Promise<ApiResponse<Toy>> {
    return this.request<ApiResponse<Toy>>("/toys", {
      method: "POST",
      body: JSON.stringify(toyData),
    });
  }

  async updateToy(
    id: number,
    updates: UpdateToyRequest,
  ): Promise<ApiResponse<Toy>> {
    return this.request<ApiResponse<Toy>>(`/toys/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteToy(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/toys/${id}`, {
      method: "DELETE",
    });
  }

  async getToyStats(): Promise<ApiResponse<ToyStats>> {
    return this.request<ApiResponse<ToyStats>>("/toys/stats");
  }

  async getToysNeedingMaintenance(days = 7): Promise<ApiResponse<Toy[]>> {
    return this.request<ApiResponse<Toy[]>>(`/toys/maintenance?days=${days}`);
  }

  async getAvailableToys(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<Toy[]>> {
    return this.request<ApiResponse<Toy[]>>(
      `/toys/available?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  async getAvailableToysForDate(date: string): Promise<ApiResponse<Toy[]>> {
    return this.request<ApiResponse<Toy[]>>(`/toys/available?date=${date}`);
  }

  // ============================================
  // TRANSACTION API METHODS
  // ============================================

  async getTransactions(filters?: {
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("includeRelated", "true");

    const query = params.toString();
    return this.request<ApiResponse<Transaction[]>>(
      `/transactions${query ? `?${query}` : ""}`,
    );
  }

  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return this.request<ApiResponse<Transaction>>(
      `/transactions/${id}?includeRelated=true`,
    );
  }

  async createTransaction(
    transactionData: CreateTransactionRequest,
  ): Promise<ApiResponse<Transaction>> {
    return this.request<ApiResponse<Transaction>>("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(
    id: number,
    updates: UpdateTransactionRequest,
  ): Promise<ApiResponse<Transaction>> {
    return this.request<ApiResponse<Transaction>>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/transactions/${id}`, {
      method: "DELETE",
    });
  }

  async getTransactionStats(period?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<FinancialStats>> {
    const params = new URLSearchParams();
    if (period?.startDate) params.append("startDate", period.startDate);
    if (period?.endDate) params.append("endDate", period.endDate);

    const query = params.toString();
    return this.request<ApiResponse<FinancialStats>>(
      `/transactions/stats${query ? `?${query}` : ""}`,
    );
  }

  async getOverdueTransactions(): Promise<ApiResponse<Transaction[]>> {
    return this.request<ApiResponse<Transaction[]>>("/transactions/overdue");
  }

  async getTransactionCategories(): Promise<ApiResponse<string[]>> {
    return this.request<ApiResponse<string[]>>("/transactions/categories");
  }

  // ============================================
  // DASHBOARD API METHODS
  // ============================================

  async getDashboardStats(): Promise<DashboardStats> {
    // Aggregate data from multiple endpoints
    const [partyStats, clientStats, toyStats, financialStats] =
      await Promise.all([
        this.getPartyStats(),
        this.getClientStats(),
        this.getToyStats(),
        this.getTransactionStats(),
      ]);

    return {
      totalParties: partyStats.data?.total || 0,
      totalRevenue: financialStats.data?.totalIncome || 0,
      totalClients: clientStats.data?.total || 0,
      availableToys: toyStats.data?.available || 0,
      pendingParties: partyStats.data?.pending || 0,
      confirmedParties: partyStats.data?.confirmed || 0,
      recentActivities: [], // Would implement activity log later
    };
  }
}

export const apiClient = new ApiClient();
