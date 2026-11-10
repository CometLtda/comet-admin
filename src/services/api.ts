import { CONFIG, API_ENDPOINTS, GATEWAY_TYPES } from "@/config/constants";
import toast from "react-hot-toast";

// API response types
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface LoginResponse {
  token?: string;
  name?: string;
  email?: string;
  levelOfAccess?: number;
  isEmployee?: boolean;
  twoFactorAutenticationSetup?: string | null;
  authenticatorUri?: string;
  manualEntrySecret?: string;
}

export interface DashboardReport {
  revenue: number;
  labelsCount: number;
  date: string;
}

export interface ProfitItem extends DashboardReport {
  baseCost: number;
  profit: number;
}

export interface StreamerRankItem {
  userPublicId: string;
  name: string;
  email: string;
  labelsCount: number;
  totalPrice: number;
}

export interface SignupUserItem {
  publicId: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
}

export interface SignupDayGroup {
  date: string;
  totalSignups: number;
  users: SignupUserItem[];
}

export interface SignupsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  days: SignupDayGroup[];
}

export interface AdminUserDetail {
  publicId: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  isBlocked: boolean;
  referralCode: string | null;
  customQuoteMarkupPercentage: number | null;
  effectiveQuoteMarkupPercentage: number;
  createdAt: string | null;
  updatedAt: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  balance: number;
  totalToppedUp: number;
  shipmentsCount: number;
  labelsCount: number;
  totalLabelsPrice: number;
  referralsMadeCount: number;
  referredByName: string | null;
  referredByEmail: string | null;
}

export interface BalanceInjectionResponse { publicId: string; amount: number }
export interface MarkupResponse { publicId: string; customQuoteMarkupPercentage: number }

export interface TransferRequest {
  streamerId: number;
  streamerName: string;
  streamerEmail: string;
  streamerDateCreated: string;
  streamerProfileImage: string | null;
  withdrawStatus: number;
  request: {
    id: number;
    withdrawAmount: number;
    dateCreated: string;
    averageTicket: number;
    conversionRate: number;
    withdrawalsAmount: number;
    feedbackAlertRate: number;
    withdrawalsCount: number;
    refundsCount: number;
    analysisResult: number;
    medsCount: number;
    medsAmount: number;
    hasStreamElementsIntegration: boolean;
    hasStreamLabsIntegration: boolean;
    hasTwitchIntegration: boolean;
  };
}

export interface PayoutItem {
  payoutExternalId: string;
  amount: number;
  dateRead: string;
}

export interface AvailableAmount {
  gateway: number;
  amount: number;
}

export interface AvailableAmountResponse {
  availableAmount: AvailableAmount[];
}

export interface AiInterfaceResponse {
  version: 0 | 1;
}

export interface ExchangeRate {
  id: number;
  currency: number;
  code: string;
  codeIn: string;
  name: string;
  high: number;
  low: number;
  varBid: number;
  pctChange: number;
  bid: number;
  ask: number;
  quoteCreateDate: string;
  dateUpdated: string;
}

// Streamer detail interfaces
export interface StreamerDetail {
  id: number;
  name: string;
  email: string;
  customAvailableFrom: number;
  document: string;
  isCardEnabled: boolean;
  feedbackAlertRate?: number;
  profileImage: string | null;
  isActive: boolean;
  isVerified: boolean;
}

export interface StreamerReceiptItem {
  status: number;
  amount: number;
  fee: number;
  dateCreated: string;
  bankAccount: string;
  bankAccountCheckDigit: number;
  bankName: string;
  bankCode: string;
}

export interface StreamerTransaction {
  dateCreated: string;
  buyerName: string | null;
  donatorNickname: string;
  streamerAmount: number;
  donatorMessage: string;
  status: number;
  publicAccessId: string;
  payment: number;
  currency: number;
}

export interface StreamerTransactionsResponse {
  streamer: StreamerDetail;
  transactions: StreamerTransaction[];
  transactionsAmount: number;
  transactionsCount: number;
}

export interface StreamerFees {
  fixedFee: number;
  percentageFee: number;
  fixedOutFee: number;
}

export interface UpdateFeesRequest {
  percentageFee: number;
  duration: number;
}

export interface MedItem {
  generated: string;
  account: string;
  payerName: string;
  document: string;
  endToEndId: string;
  details: string;
  wasAnswered: boolean;
  amount: number;
  hasTransactionAssociated: boolean;
  streamer?: {
    id: number;
    name: string;
    email: string;
    username: string;
  };
  payer?: {
    id: number;
    name: string;
    donatorNickname: string;
    document: string;
  };
  gateway?: number;
}

export interface SearchStreamerItem {
  id: number;
  name: string;
  email: string;
  username: string;
  document: string;
  dateCreated: string;
  isActive: boolean;
  isVerified: boolean;
  profileImageUrl: string | null;
  has2FA: boolean;
  balance: number;
}

export interface LoginAsStreamerResponse {
  username: string;
  authToken: string;
  needsToSetUsername: boolean;
  needsAdditionalInfo: boolean;
  apiKey: string;
}

export interface SearchStreamersResponse {
  items: SearchStreamerItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ActivityLogItem {
  id: number;
  action: string;
  route: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  additionalInfo: string;
  dateCreated: string;
  streamer?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface ActivityLogsResponse {
  items: ActivityLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BannerItem {
  publicId: string;
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
  emoji: string;
  displayOrder: number;
  dateCreated: string;
}

export interface BannerPayload {
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
  emoji: string;
  displayOrder: number;
}

export interface AnticipationItem {
  streamer: {
    id: number;
    name: string;
    email: string;
    document: string;
  };
  dateCreated: string;
  secondsToAccept: number;
  publicId: string;
  status: number;
  fee: number;
  fullAmount: number;
  resultingAmount: number;
}

class ApiService {
  private baseURL = CONFIG.API_BASE_URL;

  private getAuthHeaders(): Record<string, string> {
    const user = localStorage.getItem("user");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (user) {
      const userData = JSON.parse(user);
      headers.Authorization = `Bearer ${userData.token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = false
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = authenticated ? this.getAuthHeaders() : {
        "Content-Type": "application/json",
        ...options.headers,
      };

      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          window.location.href = "/";
          return Promise.reject(new Error("Unauthorized"));
        }
        // Return response text for 400 errors so callers can inspect message
        if (response.status === 400) {
          const text = await response.text();
          throw new Error(text);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      console.error("API request failed:", error);
      toast.error("Erro na comunicação com o servidor");
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getDashboardData(days: number = 30): Promise<DashboardReport[]> {
    return this.request<DashboardReport[]>(`${API_ENDPOINTS.HOME}?days=${days}`, {}, true);
  }

  async getProfitData(days: number = 30): Promise<ProfitItem[]> {
    return this.request<ProfitItem[]>(`${API_ENDPOINTS.PROFIT}?days=${days}`, {}, true);
  }

  async getStreamerRank(days: number = 365): Promise<StreamerRankItem[]> {
    return this.request<StreamerRankItem[]>(`${API_ENDPOINTS.SELLER_RANK}?top=20&days=${days}`, {}, true);
  }

  async getSignups(page: number = 1, pageSize: number = 20): Promise<SignupsResponse> {
    return this.request<SignupsResponse>(`${API_ENDPOINTS.SIGNUPS}?page=${page}&pageSize=${pageSize}`, {}, true);
  }

  async getUser(userPublicId: string): Promise<AdminUserDetail> {
    return this.request<AdminUserDetail>(`${API_ENDPOINTS.USERS}/${userPublicId}`, {}, true);
  }

  async injectBalance(userPublicId: string, amount: number, description: string): Promise<BalanceInjectionResponse> {
    return this.request<BalanceInjectionResponse>("inject-balance", { method: "POST", body: JSON.stringify({ userPublicId, amount, description }) }, true);
  }

  async updateMarkup(userPublicId: string, markupPercentage: number): Promise<MarkupResponse> {
    return this.request<MarkupResponse>("markup", { method: "PUT", body: JSON.stringify({ userPublicId, markupPercentage }) }, true);
  }

  async getTransferRequests(pageNumber: number = 1, pageSize: number = 25, status?: number): Promise<TransferRequest[]> {
    const statusParam = status !== undefined ? `&status=${status}` : "";
    return this.request<TransferRequest[]>(`${API_ENDPOINTS.TRANSFER_REQUESTS}?pageNumber=${pageNumber}&pageSize=${pageSize}${statusParam}`, {}, true);
  }

  async getPayouts(page: number = 1, pageSize: number = 10): Promise<PayoutItem[]> {
    return this.request<PayoutItem[]>(`${API_ENDPOINTS.PAYOUTS}?page=${page}&pageSize=${pageSize}`, {}, true);
  }

  async getAvailableAmount(): Promise<AvailableAmountResponse> {
    const response = await this.request<any>(API_ENDPOINTS.AVAILABLE_AMOUNT, {}, true);
    const list = response?.AvailableAmount ?? response?.availableAmount ?? [];
    return { availableAmount: list };
  }

  async getAiInterface(): Promise<AiInterfaceResponse> {
    return this.request<AiInterfaceResponse>("ai-interface", {}, true);
  }

  async setAiInterface(version: 0 | 1): Promise<void> {
    return this.request<void>(`ai-interface/${version}`, { method: "PUT" }, true);
  }

  async getExchangeRates(): Promise<ExchangeRate[]> {
    return this.request<ExchangeRate[]>("exchange-rates", {}, true);
  }

  async refreshExchangeRate(currency: number): Promise<ExchangeRate> {
    return this.request<ExchangeRate>(`exchange-rates/${currency}/refresh`, { method: "POST" }, true);
  }

  async makePayouts(): Promise<void> {
    return this.request<void>(API_ENDPOINTS.MAKE_PAYOUTS, { method: "PUT" }, true);
  }

  // Streamer operations
  async getStreamerTransactions(streamerId: number, pageNumber: number = 1, pageSize: number = 10): Promise<StreamerTransactionsResponse> {
    return this.request<StreamerTransactionsResponse>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/transactions?pageNumber=${pageNumber}&pageSize=${pageSize}`, {}, true);
  }

  async updateStreamerDocument(streamerId: number, document: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/change-document`, {
      method: "PUT",
      body: JSON.stringify({ document }),
    }, true);
  }

  async updateStreamerAnticipation(streamerId: number, anticipationDays: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/anticipation`, {
      method: "PUT",
      body: JSON.stringify({ anticipationDays }),
    }, true);
  }

  async getStreamerFees(streamerId: number): Promise<StreamerFees> {
    return this.request<StreamerFees>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/fees`, {}, true);
  }

  async updateStreamerFees(streamerId: number, fees: UpdateFeesRequest): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/fees`, {
      method: "PUT",
      body: JSON.stringify(fees),
    }, true);
  }

  // MEDs operations
  async getMeds(range: number = 0, page: number = 1, pageSize: number = 20): Promise<MedItem[]> {
    return this.request<MedItem[]>(`${API_ENDPOINTS.MEDS}?range=${range}&page=${page}&pageSize=${pageSize}`, {}, true);
  }

  async uploadMedsFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const user = localStorage.getItem("user");
    const headers: Record<string, string> = {};
    
    if (user) {
      const userData = JSON.parse(user);
      headers.Authorization = `Bearer ${userData.token}`;
    }

    const response = await fetch(`${this.baseURL}${API_ENDPOINTS.MEDS}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/";
        throw new Error("Unauthorized");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Transfer operations
  async approveTransferRequest(transferRequestId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.APPROVE_TRANSFER}/${transferRequestId}`, { method: "PUT" }, true);
  }

  async refuseTransferRequest(transferRequestId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.REFUSE_TRANSFER}/${transferRequestId}`, { method: "PUT" }, true);
  }

  async standbyTransferRequest(transferRequestId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STANDBY_TRANSFER}/${transferRequestId}`, { method: "PUT" }, true);
  }

  async verifyStreamerWithdraw(streamerId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.VERIFY_STREAMER}/${streamerId}`, { method: "PUT" }, true);
  }

  async blockStreamer(streamerId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.BLOCK_STREAMER}/${streamerId}`, { method: "PUT" }, true);
  }

  async unblockStreamer(streamerId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.UNBLOCK_STREAMER}/${streamerId}`, { method: "PUT" }, true);
  }

  async disableStreamer2FA(streamerId: number): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/disable-2fa`, { method: "PUT" }, true);
  }

  async updateStreamerUsername(streamerId: number, username: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/change-username`, {
      method: "PUT",
      body: JSON.stringify({ field: username }),
    }, true);
  }

  async updateStreamerEmail(streamerId: number, email: string): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/change-email`, {
      method: "PUT",
      body: JSON.stringify({ field: email }),
    }, true);
  }

  async getStreamerMeds(streamerId: number, pageNumber: number = 1, pageSize: number = 20): Promise<MedItem[]> {
    return this.request<MedItem[]>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/meds?pageNumber=${pageNumber}&pageSize=${pageSize}`, {}, true);
  }

  async toggleStreamerCard(streamerId: number, isCardEnabled: boolean): Promise<void> {
    return this.request<void>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/toggle-card?isCardEnabled=${isCardEnabled}`, { method: "PUT" }, true);
  }

  async loginAsStreamer(streamerId: number): Promise<LoginAsStreamerResponse> {
    return this.request<LoginAsStreamerResponse>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/login-as-streamer`, {}, true);
  }

  async getStreamerActivityLogs(streamerId: number, page: number = 1, pageSize: number = 25): Promise<ActivityLogsResponse> {
    return this.request<ActivityLogsResponse>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/activity-logs?page=${page}&pageSize=${pageSize}`, {}, true);
  }

  async getStreamerReceipts(streamerId: number, pageNumber: number = 1, pageSize: number = 25): Promise<StreamerReceiptItem[]> {
    return this.request<StreamerReceiptItem[]>(`${API_ENDPOINTS.STREAMERS}/${streamerId}/receipts?page=${pageNumber}&pageSize=${pageSize}`, {}, true);
  }

  async searchStreamers(search: string, page: number = 1, pageSize: number = 20): Promise<SearchStreamersResponse> {
    return this.request<SearchStreamersResponse>(`${API_ENDPOINTS.STREAMERS}/search?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`, {}, true);
  }

  // Banners (Notificações)
  async getBanners(): Promise<BannerItem[]> {
    return this.request<BannerItem[]>("banners", {}, true);
  }

  async createBanner(payload: BannerPayload): Promise<void> {
    return this.request<void>("banners", { method: "POST", body: JSON.stringify(payload) }, true);
  }

  async updateBanner(publicId: string, payload: BannerPayload): Promise<void> {
    return this.request<void>(`banners/${publicId}`, { method: "PUT", body: JSON.stringify(payload) }, true);
  }

  async deleteBanner(publicId: string): Promise<void> {
    return this.request<void>(`banners/${publicId}`, { method: "DELETE" }, true);
  }

  // Anticipations
  async getAnticipations(pageNumber = 1, pageSize = 25, status?: number): Promise<AnticipationItem[]> {
    const statusParam = status !== undefined ? `&status=${status}` : "";
    return this.request<AnticipationItem[]>(`anticipations?pageNumber=${pageNumber}&pageSize=${pageSize}${statusParam}`, {}, true);
  }

  async approveAnticipation(publicId: string): Promise<void> {
    return this.request<void>(`anticipations/${publicId}/approve`, { method: "PUT" }, true);
  }

  async refuseAnticipation(publicId: string): Promise<void> {
    return this.request<void>(`anticipations/${publicId}/refuse`, { method: "PUT" }, true);
  }

  async removeAnticipation(publicId: string): Promise<void> {
    return this.request<void>(`anticipations/${publicId}/remove`, { method: "DELETE" }, true);
  }

  // Utility method to get gateway name
  getGatewayName(gatewayId: number): string {
    return GATEWAY_TYPES[gatewayId] || "Desconhecido";
  }
}

export const apiService = new ApiService();
