import { apiClient } from "@/lib/apiClient";
import {
  ApiResponse,
  Auction,
  AuctionDetail,
  AuctionStatus,
  Bid,
  Category,
  CreateItemPayload,
  Item,
  ItemAIReport,
  PageResponse,
  ReviewItemPayload,
} from "@/types/auction";

export interface GetAuctionsParams {
  status?: AuctionStatus;
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export const auctionApi = {
  /**
   * Fetch paginated list of auctions with optional filters
   */
  async getAuctions(params?: GetAuctionsParams): Promise<PageResponse<Auction>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Auction>>>(
      "/api/v1/auctions",
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch a single auction with details and its full bid history
   */
  async getAuctionById(id: string): Promise<AuctionDetail> {
    const response = await apiClient.get<ApiResponse<AuctionDetail>>(
      `/api/v1/auctions/${id}`
    );
    return response.data.data;
  },

  /**
   * Place a manual bid on an active auction
   */
  async placeBid(auctionId: string, bidAmount: number): Promise<Bid> {
    const response = await apiClient.post<ApiResponse<Bid>>(
      `/api/v1/auctions/${auctionId}/bids`,
      { bidAmount }
    );
    return response.data.data;
  },

  /**
   * Instantly purchase and settle an auction at buyNowPrice
   */
  async buyNow(auctionId: string): Promise<Auction> {
    const response = await apiClient.post<ApiResponse<Auction>>(
      `/api/v1/auctions/${auctionId}/buy-now`
    );
    return response.data.data;
  },

  /**
   * Get bids history for an auction
   */
  async getAuctionBids(auctionId: string): Promise<Bid[]> {
    const response = await apiClient.get<ApiResponse<Bid[]>>(
      `/api/v1/auctions/${auctionId}/bids`
    );
    return response.data.data;
  },

  /**
   * Get all product categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      "/api/v1/categories"
    );
    return response.data.data;
  },

  /**
   * Submit a new item request with multi-angle photos for AI appraisal and review
   */
  async createItem(payload: CreateItemPayload): Promise<Item> {
    const response = await apiClient.post<ApiResponse<Item>>(
      "/api/v1/items",
      payload
    );
    return response.data.data;
  },

  /**
   * Get items submitted by the current logged-in seller
   */
  async getMyItems(): Promise<Item[]> {
    const response = await apiClient.get<ApiResponse<Item[]>>(
      "/api/v1/items/my-items"
    );
    return response.data.data;
  },

  /**
   * Get all pending items awaiting moderation review (with AI reports)
   */
  async getPendingItems(): Promise<Item[]> {
    const response = await apiClient.get<ApiResponse<Item[]>>(
      "/api/v1/items/pending"
    );
    return response.data.data;
  },

  /**
   * Get item details by ID
   */
  async getItemById(id: string): Promise<Item> {
    const response = await apiClient.get<ApiResponse<Item>>(
      `/api/v1/items/${id}`
    );
    return response.data.data;
  },

  /**
   * Moderator review endpoint (Approve or Reject with optional instant auction launch)
   */
  async reviewItem(id: string, payload: ReviewItemPayload): Promise<Item> {
    const response = await apiClient.post<ApiResponse<Item>>(
      `/api/v1/items/${id}/review`,
      payload
    );
    return response.data.data;
  },

  /**
   * Trigger AI re-appraisal for an item
   */
  async reAppraiseItem(id: string): Promise<Item> {
    const response = await apiClient.post<ApiResponse<Item>>(
      `/api/v1/items/${id}/appraise`
    );
    return response.data.data;
  },

  /**
   * Get AI inspection report for an item
   */
  async getItemAiReport(id: string): Promise<ItemAIReport> {
    const response = await apiClient.get<ApiResponse<ItemAIReport>>(
      `/api/v1/items/${id}/ai-report`
    );
    return response.data.data;
  },
};
