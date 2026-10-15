export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export type ImageAngle = 'FRONT' | 'BACK' | 'DETAIL' | 'SERIAL_NUMBER' | 'DEFECT';

export interface ItemImage {
  id: number;
  imageUrl: string;
  angle: ImageAngle;
  isThumbnail: boolean;
}

export type ItemStatus = 'DRAFT' | 'PENDING_AI' | 'VERIFIED' | 'REJECTED';

export interface Item {
  id: string;
  title: string;
  description: string;
  declaredCondition: string;
  suggestedStartingPrice: number;
  status: ItemStatus;
  category: Category;
  sellerId: string;
  sellerName: string;
  images: ItemImage[];
  createdAt: string;
}

export type AuctionStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Auction {
  id: string;
  item: Item;
  startPrice: number;
  stepPrice: number;
  buyNowPrice?: number | null;
  currentPrice: number;
  currentWinnerId?: string | null;
  currentWinnerName?: string | null;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  totalBids: number;
  version: number;
  createdAt: string;
}

export interface Bid {
  id: number;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  isAutoBid: boolean;
  createdAt: string;
}

export interface AuctionDetail {
  auction: Auction;
  bids: Bid[];
}

export type BidEventType = 'NEW_BID' | 'AUCTION_EXTENDED' | 'BUYOUT' | 'AUCTION_ENDED';

export interface BidEvent {
  eventType: BidEventType;
  auctionId: string;
  currentPrice: number;
  highestBidderId?: string | null;
  highestBidderName?: string | null;
  endTime?: string;
  totalBids: number;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
