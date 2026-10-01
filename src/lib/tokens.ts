/**
 * ============================================================
 * ZALO UI DESIGN TOKENS (nghiên cứu từ hệ thống thiết kế Zalo
 * + bundle chat.zalo.me + clone web phổ biến)
 * ============================================================
 * Chú thích nguồn:
 *  - #0068FF = Zalo Blue anchor (xác nhận trực tiếp từ bundle
 *    chat.zalo.me: lazy_default-embed-render...js)
 *  - #E8ECF1 chat backdrop, 16pt radius / 5pt tail, bubble max 78%,
 *    9/13pt padding: từ Zalo DESIGN.md (iOS) — desktop/web dùng cùng
 *    ngôn ngữ thiết kế với header trắng thay vì xanh đặc
 *  - Font: hệ thống (web không bundle Be Vietnam Pro riêng)
 */

export const COLORS = {
  // Brand
  zaloBlue: "#0068FF",
  zaloBluePressed: "#0052CC",
  zaloBlueDeep: "#0047B3",
  cyanDeep: "#0F7EC4", // đáy gradient header (tone cyan-blue) — borderBottom header
  blueSoft: "#DBEBFF", // bubble out iOS tint
  bubbleOutStart: "#4B8DFF", // gradient desktop
  bubbleOutEnd: "#0068FF", // gradient desktop

  // Surfaces
  canvas: "#FFFFFF",
  chatBackdrop: "#E8ECF1",
  surface1: "#F4F5F7",
  surface2: "#EBEDF0",
  divider: "#E4E6EB",

  // Text
  ink: "#1A1A1A",
  inkOut: "#FFFFFF", // text on gradient bubble
  textSecondary: "#6B7280",
  textTertiary: "#9AA0AA",

  // Semantic
  red: "#F5325B",
  greenOnline: "#18A957",
  white: "#FFFFFF",

  // Message bubble tokens — riêng, KHÔNG dùng màu xanh generic/đậm kiểu Messenger
  incomingBg: "#F7F8FA", // in = trắng xám rất nhẹ (Zalo mobile)
  outgoingBg: "#E8F3FF", // out = xanh cyan/xanh trời RẤT NHẠT (Zalo mobile hiện hành)
  messageText: "#1A1A1A", // text = màu tối
  messageTimeColor: "#9AA0AA", // timestamp = xám nhạt
} as const;

export const TYPOGRAPHY = {
  bubble: "15px", // tin nhắn
  name: "14px", // tên người chat trong thread (nhóm)
  headerName: "15px", // tên trên header
  status: "12px", // trạng thái dưới tên
  timestamp: "11px", // giờ dưới bubble
  daySeparator: "11px", // mốc thời gian giữa
  sending: "11px",
  composer: "14px",
} as const;

export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", ' +
  '"Noto Sans", "Be Vietnam Pro", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';

export const DIMENSIONS = {
  headerHeight: 66, // px — header chat (desktop)
  avatarHeader: 44, // avatar trên header
  avatarThread: 32, // avatar cạnh tin nhắn
  avatarGroup: 36,
  bubbleMaxWidthPct: 78, // % so với vùng chat
  bubbleRadius: 16,
  bubbleTailRadius: 5,
  bubblePadV: 9,
  bubblePadH: 13,
  msgGapAfter: 6, // gap giữa các tin cùng sender
  msgGapSenderChange: 14, // gap khi đổi sender
  threadInsetH: 12, // lề ngang vùng tin
  threadInsetV: 16,
  composerHeight: 60, // px — Zalo web: padding 10px + ô nhập 40px
  sendBtn: 38,
  onlineDot: 10,
} as const;

export const SHADOWS = {
  bubbleIn: "0 1px 2px rgba(0,0,0,0.06)",
  header: "0 1px 4px rgba(0,0,0,0.08)",
  float: "0 4px 16px rgba(0,0,0,0.10)",
} as const;

export const GRADIENTS = {
  // Avatar fallback — theo Zalo: linear-gradient(135deg, #4D9FFF, #0047B3)
  avatarList: [
    "linear-gradient(135deg, #4D9FFF, #0047B3)", // blue (chuẩn)
    "linear-gradient(135deg, #FF8A5C, #FF5C5C)", // cam-đỏ
    "linear-gradient(135deg, #3FBF9F, #1ABA9A)", // xanh lá
    "linear-gradient(135deg, #A78BFA, #7C5CFC)", // tím
    "linear-gradient(135deg, #F472B6, #EC4899)", // hồng
    "linear-gradient(135deg, #FBBF24, #F59E0B)", // vàng
    "linear-gradient(135deg, #60A5FA, #3B82F6)", // xanh dương nhạt
    "linear-gradient(135deg, #34D399, #10B981)", // emerald
  ],
  bubbleOut: "linear-gradient(135deg, #4B8DFF 0%, #0068FF 100%)",
  // Header Zalo — tone CYAN-BLUE đặc trưng của Zalo hiện hành
  // (đo pixel ảnh chính thức zalo.me: ~#0DA6FB-#10A1FC trên, ~#1183CB-#1B8BCF dưới).
  // KHÔNG dùng màu gradient bubble (đậm kiểu Messenger) — header tách riêng.
  header: "linear-gradient(180deg, #11A0FA 0%, #1587CE 100%)",
} as const;

/** Lấy màu nền avatar theo seed (0 = chuẩn Zalo blue) */
export function avatarGradient(seed: number): string {
  return GRADIENTS.avatarList[Math.abs(seed) % GRADIENTS.avatarList.length];
}

/** Chữ cái đầu (hỗ trợ tiếng Việt có dấu: lấy ký tự đầu chuẩn Unicode) */
export function initials(name: string): string {
  const n = (name || "?").trim();
  return n ? Array.from(n)[0].toUpperCase() : "?";
}