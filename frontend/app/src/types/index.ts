/**
 * TypeScript interfaces matching actual Django serializer field names.
 * Field names must stay in sync with backend serializers.
 */

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserRole = "trader" | "mentor" | "admin";

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  bio: string;
  role: UserRole;
  plan?: "free" | "pro";
  onboarding_completed?: boolean;
  date_joined: string;
}

export interface LoginResponse {
  detail: string;
  user: UserProfile;
}

export interface RegisterResponse {
  detail: string;
  user: UserProfile;
}

// ── Trades ────────────────────────────────────────────────────────────────────

export type Direction  = "long" | "short";
export type TradeResult = "win" | "loss" | "breakeven" | "";
export type Emotion    =
  | "calm" | "confident" | "fearful" | "greedy"
  | "anxious" | "fomo" | "revenge" | "neutral" | "";

export interface Trade {
  id: number;
  pair: string;
  direction: Direction;
  entry_price: string;      // NUMERIC(20,8) serialised as string
  exit_price: string | null;
  quantity: string;
  entry_time: string;        // ISO 8601
  exit_time: string | null;
  pnl: string | null;
  risk_reward_ratio: string | null;
  result: TradeResult;
  emotion: Emotion;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTrades {
  count: number;
  next: string | null;
  previous: string | null;
  results: Trade[];
}

// Create / update payloads
export interface TradeCreatePayload {
  pair: string;
  direction: Direction;
  entry_price: string;
  exit_price?: string;
  quantity: string;
  entry_time: string;
  exit_time?: string;
  result?: TradeResult;
  emotion?: Emotion;
  notes?: string;
}

export type TradeUpdatePayload = Partial<TradeCreatePayload>;

// ── Trade stats (GET /api/trades/stats/) ─────────────────────────────────────

export interface TradeStats {
  total_trades: number;
  closed_trades: number;
  winning_trades: number;
  losing_trades: number;
  breakeven_trades: number;
  win_rate: number;            // 0–100
  total_pnl: string;           // Decimal → string
  avg_pnl_per_trade: string;
  avg_risk_reward: string | null;
  max_drawdown: string;
  best_trade_pnl: string | null;
  worst_trade_pnl: string | null;
  most_traded_pair: string | null;
}

// ── AI Analysis ───────────────────────────────────────────────────────────────

export interface AiInsight {
  id: number;
  content: string;
  period_start: string;
  period_end: string;
  trade_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSendPayload {
  message: string;
}

export interface ChatSendResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

// ── Prices ────────────────────────────────────────────────────────────────────

export interface PriceQuote {
  price: number;
  change_24h: number | null;
  source: "coingecko" | "finnhub";
  market_cap?: number;
  high?: number;
  low?: number;
}

/** GET /api/prices/?symbols=BTC,ETH → { "BTC": PriceQuote, "ETH": PriceQuote } */
export type PricesResponse = Record<string, PriceQuote>;

// ── Mentors ───────────────────────────────────────────────────────────────────

export interface MentorAssignment {
  id: number;
  mentor: { id: number; email: string; display_name: string };
  trader: { id: number; email: string; display_name: string };
  assigned_at: string;
  is_active: boolean;
}

export interface MentorAnnotation {
  id: number;
  trade: number;
  mentor: { id: number; display_name: string };
  content: string;
  created_at: string;
  updated_at: string;
}

// ── Dashboard helpers ─────────────────────────────────────────────────────────

export interface PnlPoint {
  date: string;    // "YYYY-MM-DD"
  cumPnl: number;  // cumulative P&L at this point
}

export interface HeatmapDay {
  date: string;
  pnl: number;
  tradeCount: number;
}

export type DateRange = "today" | "week" | "month" | "all";

// ── Common ────────────────────────────────────────────────────────────────────

export interface ApiValidationError {
  [field: string]: string | string[];
}
