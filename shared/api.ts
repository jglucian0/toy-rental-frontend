/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Common API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

/**
 * API Error response
 */
export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

// ============================================
// PARTY TYPES
// ============================================

/**
 * Party status types
 */
export type PartyStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Party type categories
 */
export type PartyType =
  | "Infantil"
  | "Corporativo"
  | "Aniversário"
  | "Casamento"
  | "Formatura";

/**
 * Party interface
 */
export interface Party {
  id: number;
  title: string;
  client_id: number;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  type: PartyType;
  guests: number;
  status: PartyStatus;
  value: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Related data
  client?: Client;
  toys?: string[];
}

/**
 * Create party request
 */
export interface CreatePartyRequest {
  title: string;
  client_id: number;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  type: PartyType;
  guests?: number;
  status?: PartyStatus;
  value: number;
  notes?: string;
  toys?: string[];
}

/**
 * Update party request
 */
export interface UpdatePartyRequest {
  title?: string;
  client_id?: number;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  type?: PartyType;
  guests?: number;
  status?: PartyStatus;
  value?: number;
  notes?: string;
  toys?: string[];
}

// ============================================
// CLIENT TYPES
// ============================================

/**
 * Client status types
 */
export type ClientStatus = "active" | "inactive";

/**
 * Client interface
 */
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
  status: ClientStatus;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Computed fields
  totalParties?: number;
  totalSpent?: number;
  lastParty?: string;
}

/**
 * Create client request
 */
export interface CreateClientRequest {
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
  status?: ClientStatus;
  notes?: string;
}

/**
 * Update client request
 */
export interface UpdateClientRequest {
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
  status?: ClientStatus;
  notes?: string;
}

/**
 * CEP API response
 */
export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// ============================================
// TOY TYPES
// ============================================

/**
 * Toy status types
 */
export type ToyStatus = "available" | "rented" | "maintenance" | "damaged";

/**
 * Toy condition types
 */
export type ToyCondition = "excellent" | "good" | "fair" | "poor";

/**
 * Toy size types
 */
export type ToySize = "Pequeno" | "Médio" | "Grande" | "Extra Grande";

/**
 * Toy energy types
 */
export type ToyEnergy = "Não" | "Elétrica";

/**
 * Toy inflatable types
 */
export type ToyInflatableType = "Não" | "Pula-pula" | "Tobogã" | "Casa";

/**
 * Toy interface
 */
export interface Toy {
  id: number;
  name: string;
  category: string;
  status: ToyStatus;
  condition: ToyCondition;
  daily_rate: number;
  value: number;
  total_quantity: number;
  available_quantity: number;
  size?: ToySize;
  energy?: ToyEnergy;
  inflatable_type?: ToyInflatableType;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create toy request
 */
export interface CreateToyRequest {
  name: string;
  category: string;
  status?: ToyStatus;
  condition?: ToyCondition;
  daily_rate: number;
  value: number;
  total_quantity: number;
  available_quantity: number;
  size?: ToySize;
  energy?: ToyEnergy;
  inflatable_type?: ToyInflatableType;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
}

/**
 * Update toy request
 */
export interface UpdateToyRequest {
  name?: string;
  category?: string;
  status?: ToyStatus;
  condition?: ToyCondition;
  daily_rate?: number;
  value?: number;
  total_quantity?: number;
  available_quantity?: number;
  size?: ToySize;
  energy?: ToyEnergy;
  inflatable_type?: ToyInflatableType;
  location?: string;
  description?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  purchase_date?: string;
  purchase_price?: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================

/**
 * Transaction types
 */
export type TransactionType = "income" | "expense";

/**
 * Transaction status types
 */
export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled";

/**
 * Transaction interface
 */
export interface Transaction {
  id: number;
  description: string;
  type: TransactionType;
  amount: number;
  category: string;
  status: TransactionStatus;
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

/**
 * Create transaction request
 */
export interface CreateTransactionRequest {
  description: string;
  type: TransactionType;
  amount: number;
  category: string;
  status?: TransactionStatus;
  date: string;
  party_id?: number;
  client_id?: number;
  notes?: string;
}

/**
 * Update transaction request
 */
export interface UpdateTransactionRequest {
  description?: string;
  type?: TransactionType;
  amount?: number;
  category?: string;
  status?: TransactionStatus;
  date?: string;
  party_id?: number;
  client_id?: number;
  notes?: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalParties: number;
  totalRevenue: number;
  totalClients: number;
  availableToys: number;
  pendingParties: number;
  confirmedParties: number;
  recentActivities: Activity[];
}

/**
 * Activity log entry
 */
export interface Activity {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  created_at: string;
}

// ============================================
// STATS TYPES
// ============================================

/**
 * Client statistics
 */
export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  vip: number;
  averageSpent: number;
}

/**
 * Party statistics
 */
export interface PartyStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averageValue: number;
  upcomingWeek: number;
}

/**
 * Toy statistics
 */
export interface ToyStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  damaged: number;
  categories: { [key: string]: number };
  totalValue: number;
  totalInventoryValue: number;
}

/**
 * Financial statistics
 */
export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingIncome: number;
  pendingExpenses: number;
  categorySummary: { [key: string]: { income: number; expense: number } };
  monthlyTrend: { month: string; income: number; expense: number }[];
}
