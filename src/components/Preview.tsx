import React, { useEffect, useRef } from "react";
import {
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  MoreHorizontal,
  Mic,
  Image as ImageIcon,
} from "lucide-react";
import type { ChatConfig, EditorItem, MessageItem, TimeItem } from "../types/chat";
import { PRESENCE_LABELS } from "../types/chat";
import {
  COLORS,
  DIMENSIONS,
  FONT_STACK,
  SHADOWS,
  GRADIENTS,
  avatarGradient,
  initials,
} from "../lib/tokens";

/* ============================================================
   Chat Preview — mô phỏng cửa sổ chat Zalo (desktop/web)
   Tái tạo: header, avatar, bubble in/out, timeline, composer
   ============================================================ */

interface PreviewProps {
  config: ChatConfig;
  items: EditorItem[];
  scale?: number;
  width?: number;
  showMockupLabel?: boolean;
  height?: number; // chiều cao viewport cố định — mặc định 640 (như màn hình điện thoại)
}

/** Avatar tròn với ảnh hoặc gradient + chữ cái */
export function Avatar({
  src,
  name,
  size,
  seed = 0,
  onlineDot = false,
}: {
  src: string;
  name: string;
  size: number;
  seed?: number;
  onlineDot?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        background: src ? undefined : avatarGradient(seed),
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: size * 0.42,
          }}
        >
          {initials(name)}
        </div>
      )}
      {onlineDot && (
        <span
          style={{
            position: "absolute",
            right: 1,
            bottom: 1,
            width: DIMENSIONS.onlineDot,
            height: DIMENSIONS.onlineDot,
            borderRadius: "50%",
            background: COLORS.greenOnline,
            border: `2px solid ${COLORS.white}`,
          }}
        />
      )}
    </div>
  );
}

/** Bubble tin nhắn: in (trái, trắng) / out (phải, gradient) — border nhỏ, padding compact */
function Bubble({
  sender,
  text,
  messageKind,
  imageSrc,
  maxWidthPct,
  senderName,
  compact = false,
  marginLeft = 0,
}: {
  sender: "me" | "friend";
  text: string;
  messageKind?: "text" | "image";
  imageSrc?: string;
  maxWidthPct: number;
  senderName?: string;
  compact?: boolean;
  marginLeft?: number; // inset từ trái (avatar) — margin KHÔNG ảnh hưởng containing block
}) {
  const isMe = sender === "me";
  // Compact như Zalo mobile: radius nhỏ, padding nhỏ, line-height gọn
  const radius = compact ? 9 : DIMENSIONS.bubbleRadius;
  const tail = compact ? 3 : DIMENSIONS.bubbleTailRadius;
  // Zalo: 3 góc bo + góc gãy phía avatar (in: trên-trái, out: trên-phải)
  const radiusFinal = isMe
    ? `${radius}px ${tail}px ${radius}px ${radius}px`
    : `${tail}px ${radius}px ${radius}px ${radius}px`;
  const padV = compact ? 5 : DIMENSIONS.bubblePadV;
  const padH = compact ? 9 : DIMENSIONS.bubblePadH;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMe ? "flex-end" : "flex-start",
        maxWidth: `${maxWidthPct}%`,
        marginLeft, // inset cho tin đến — % resolve theo THREAD (không phải wrapper)
      }}
    >
      {senderName && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#4C65A8",
            marginBottom: 2,
            paddingLeft: 2,
          }}
        >
          {senderName}
        </span>
      )}
      {messageKind === "image" && imageSrc ? (
        <div
          style={{
            borderRadius: radiusFinal,
            overflow: "hidden",
            background: isMe ? COLORS.outgoingBg : COLORS.incomingBg,
            padding: 4,
            boxShadow: isMe ? undefined : SHADOWS.bubbleIn,
            border: isMe ? "none" : `1px solid ${COLORS.divider}`,
            // Image bubble: co theo content; clamp ở Bubble root (maxWidth 78%)
            width: "fit-content",
            minWidth: 0,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            style={{
              borderRadius: radius - 4,
              display: "block",
              maxWidth: 280,
              maxHeight: 320,
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: `${padV}px ${padH}px`,
            borderRadius: radiusFinal,
            background: isMe ? COLORS.outgoingBg : COLORS.incomingBg,
            color: COLORS.messageText,
            fontSize: 15,
            lineHeight: 1.35, // compact, không giãn
            // Nội bubble: co theo CONTENT; wrap do Bubble root clamp (maxWidth 78%)
            // KHÔNG set maxWidth ở đây → tránh circular % gây wrap sớm
            width: "fit-content",
            minWidth: 0,
            // Text: pre-wrap, word-break NORMAL, chỉ break chữ khi cần (KHÔNG break-all/anywhere)
            whiteSpace: "pre-wrap",
            wordBreak: "normal",
            overflowWrap: "break-word",
            boxShadow: isMe ? undefined : SHADOWS.bubbleIn,
            border: isMe ? "none" : `1px solid ${COLORS.divider}`,
          }}
        >
          {text || " "}
        </div>
      )}
    </div>
  );
}

/** Mốc thời gian — pill trắng mờ giữa màn hình */
function TimeSeparator({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 6px" }}>
      <span
        style={{
          background: "rgba(255,255,255,0.75)",
          color: COLORS.textSecondary,
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 12px",
          borderRadius: 999,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Khoảng cách ngang từ mép trái thread → bubble người chat (avatar 32 + gap 8) */
const INCOMING_INSET = DIMENSIONS.avatarThread + 8;

/**
 * Nhóm tin NHẬN (Người chat):
 * - Avatar absolute bên trái (align TOP), KHÔNG chiếm cột flex → MessageColumn
 *   rộng TRỌN thread, bubble resolve maxWidth theo THREAD (cùng base với outgoing).
 * - MessageColumn flex column, bubble co theo content (fit-content), mép trái
 *   thẳng hàng sau avatar nhờ marginLeft INCOMING_INSET.
 */
function IncomingMessageGroup({
  messages,
  config,
}: {
  messages: MessageItem[];
  config: ChatConfig;
}) {
  const last = messages[messages.length - 1];
  return (
    <div style={{ position: "relative" }}>
      {/* Avatar overlay — absolute, top */}
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        <Avatar src={config.avatarUrl} name={config.name} size={DIMENSIONS.avatarThread} />
      </div>
      {/* MessageColumn — width 100% thread; bubble % resolve theo THREAD */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2,
          minWidth: 0,
          width: "100%",
        }}
      >
        {messages.map((m) => (
          <Bubble
            key={m.id}
            sender="friend"
            text={m.text}
            messageKind={m.messageKind}
            imageSrc={m.imageSrc}
            maxWidthPct={config.bubbleMaxWidth}
            compact
            marginLeft={INCOMING_INSET} // margin không ảnh hưởng containing block → maxWidth theo THREAD
          />
        ))}
        {last?.time && (
          <span
            style={{
              fontSize: 9,
              lineHeight: 1.2,
              color: COLORS.messageTimeColor,
              marginTop: 2,
              marginLeft: INCOMING_INSET,
              alignSelf: "flex-start",
              paddingLeft: 2,
              paddingRight: 2,
            }}
          >
            {last.time}
          </span>
        )}
      </div>
    </div>
  );
}

/** Tin GỬI (Tôi) — không avatar, sát bên phải, timestamp ở tin cuối cụm */
function OutgoingMessageRow({
  item,
  config,
  isLastInGroup,
}: {
  item: MessageItem;
  config: ChatConfig;
  isLastInGroup: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      {/* Column rộng trọn thread để bubble resolve maxWidthPct theo THREAD
          (cùng base với incoming), bubble tự co content, canh phải */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Bubble
          sender="me"
          text={item.text}
          messageKind={item.messageKind}
          imageSrc={item.imageSrc}
          maxWidthPct={config.bubbleMaxWidth}
          compact
        />
        {isLastInGroup && item.time && (
          <span
            style={{
              fontSize: 9,
              lineHeight: 1.2,
              color: COLORS.messageTimeColor,
              marginTop: 2,
              alignSelf: "flex-end",
              paddingLeft: 2,
              paddingRight: 2,
            }}
          >
            {item.time}
          </span>
        )}
      </div>
    </div>
  );
}

const SMILEY_W = 26; // px — kích thước icon smile: tương đương chiều cao vùng nhập (composer 60px), như Zalo mobile
const SMILEY_COLOR = "#4B5563"; // xám ĐẬM, rõ nét (không xám nhạt)

/**
 * ZaloSmiley — SVG custom mô phỏng icon smile Zalo mobile hiện hành:
 * vòng tròn viền bo bên ngoài, bên trong 2 mắt chấm + miệng cười cách điệu.
 * Nét dày 1.8, màu xám đậm, rõ nét; căn giữa trục dọc với chữ "Tin nhắn".
 */
function ZaloSmiley() {
  return (
    <svg
      width={SMILEY_W}
      height={SMILEY_W}
      viewBox="0 0 24 24"
      fill="none"
      stroke={SMILEY_COLOR}
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Viền tròn bo ngoài — như icon sticker Zalo */}
      <circle cx="12" cy="12" r="10" />
      {/* Mắt: 2 chấm tròn bên trong */}
      <circle cx="8.7" cy="10.2" r="1.15" fill={SMILEY_COLOR} stroke="none" />
      <circle cx="15.3" cy="10.2" r="1.15" fill={SMILEY_COLOR} stroke="none" />
      {/* Miệng cười cong cách điệu (vòng cung xuống dưới) */}
      <path d="M8 13.2a4.6 4.6 0 0 0 8 0" />
    </svg>
  );
}

/** Composer — thanh nhập tin nhắn Zalo hiện hành:
 *  [smile] Tin nhắn ... [more] [mic] [image] — không pill, không nút send */
function Composer({ height }: { height: number }) {
  return (
    <div
      style={{
        flex: "0 0 auto",
        height,
        background: COLORS.canvas,
        borderTop: `0.5px solid ${COLORS.divider}`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px",
      }}
    >
      {/* Icon trái: emoji/sticker — SVG custom dáng Zalo mobile (to, rõ, viền tròn) */}
      <ZaloSmiley />
      {/* Ô nhập: nền trong suốt (không pill), placeholder "Tin nhắn" */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
          color: COLORS.textTertiary,
          fontSize: 14,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        Tin nhắn
      </div>
      {/* Nhóm action phải: more, mic, gallery */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <MoreHorizontal size={22} color={COLORS.textSecondary} strokeWidth={1.8} />
        <Mic size={22} color={COLORS.textSecondary} strokeWidth={1.8} />
        <ImageIcon size={22} color={COLORS.textSecondary} strokeWidth={1.8} />
      </div>
    </div>
  );
}

/**
 * Cửa sổ chat Zalo đầy đủ (header + thread + composer).
 * forwardRef để App bắt node export PNG.
 */
export const ChatWindow = React.forwardRef<HTMLDivElement, PreviewProps>(function ChatWindow(
  { config, items, scale = 1, width = 400, showMockupLabel = true, height = 640 }: PreviewProps,
  ref
) {
  const headerH = DIMENSIONS.headerHeight * scale;

  const compH = config.showComposer ? DIMENSIONS.composerHeight * scale : 0;
  const convoRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true); // mặc định bám đáy

  // Auto-scroll thông minh: chỉ cuộn xuống tin mới nhất khi người dùng ĐANG ở
  // gần cuối conversation. Nếu đang kéo lên xem tin cũ → giữ nguyên vị trí,
  // không giật xuống (hành vi giống Zalo mobile).
  useEffect(() => {
    const el = convoRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [items]);

  const handleConvoScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // Cách đáy < 24px coi là "đang ở cuối" → được bám đáy tiếp
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  /* --- Gom cụm: sender đổi (me/friend/time) → group mới với avatar mới --- */
  const normalizeSender = (it: EditorItem): "me" | "friend" | "time" =>
    it.kind === "time" ? "time" : it.sender;
  const groups: { type: "me" | "friend" | "time"; items: MessageItem[] }[] = [];
  let curType: "me" | "friend" | "time" | null = null;
  for (const it of items) {
    const t = normalizeSender(it);
    if (t === "time") {
      groups.push({ type: "time", items: [] });
      curType = null;
      continue;
    }
    if (t !== curType || curType === null) {
      groups.push({ type: t, items: [] });
      curType = t;
    }
    groups[groups.length - 1].items.push(it as MessageItem);
  }

  return (
    <div
      ref={ref}
      style={{
        width: width * scale,
        height: height * scale, // chiều cao viewport CỐ ĐỊNH — không kéo dài theo content
        background: config.backgroundColor,
        fontFamily: FONT_STACK,
        overflow: "hidden",
        borderRadius: scale > 1 ? 0 : 12,
        boxShadow: scale > 1 ? "none" : SHADOWS.float,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
      data-zlo-preview
    >
      {/* HEADER — cố định trên, không bị đẩy theo conversation */}
      <div
        style={{
          flex: "0 0 auto",
          height: headerH,
          background: GRADIENTS.header,
          borderBottom: `1px solid ${COLORS.cyanDeep}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${16 * scale}px`,
          gap: 12 * scale,
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={28 * scale} strokeWidth={1.5} style={{ marginLeft: -8 * scale, cursor: "pointer" }} />
        <div style={{ flex: 1, minWidth: 0, marginLeft: -4 * scale }}>
          <div
            style={{
              fontSize: 16 * scale,
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {config.name || "…"}
          </div>
          <div
            style={{
              fontSize: 11 * scale,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.2,
              marginTop: 1 * scale,
            }}
          >
            {PRESENCE_LABELS[config.presence]}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16 * scale,
            color: "#fff",
          }}
        >
          <Phone size={22 * scale} strokeWidth={1.5} />
          <Video size={22 * scale} strokeWidth={1.5} />
          <MoreVertical size={22 * scale} strokeWidth={1.5} />
        </div>
      </div>

      {/* THREAD — scroll dọc nội bộ, flex:1 giữa Header & Composer */}
      <div
        ref={convoRef}
        className="zlo-conversation"
        onScroll={handleConvoScroll}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          padding: `${16 * scale}px ${12 * scale}px`,
        }}
      >
        {items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: COLORS.textTertiary,
              fontSize: 13,
              marginTop: 40,
            }}
          >
            Nhập tin nhắn để xem preview…
          </div>
        )}
        {groups.map((g, gi) => {
          if (g.type === "time") {
            const timeItem = items.find((it): it is TimeItem => it.kind === "time");
            return <TimeSeparator key={`time-${gi}`} label={timeItem?.label || "Hôm nay"} />;
          }
          if (g.type === "friend") {
            return (
              <div key={`fg-${gi}`} style={{ marginBottom: 10 }}>
                <IncomingMessageGroup messages={g.items} config={config} />
              </div>
            );
          }
          // g.type === "me": mỗi tin là một row riêng sát phải; giữa các tin cùng cụm gap 2px
          return (
            <div
              key={`mg-${gi}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-end",
                marginBottom: 10,
              }}
            >
              {g.items.map((m, i) => (
                <OutgoingMessageRow
                  key={m.id}
                  item={m}
                  config={config}
                  isLastInGroup={i === g.items.length - 1}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* COMPOSER */}
      {config.showComposer && <Composer height={compH} />}

      {/* Nhãn Mockup nhỏ — mép dưới ảnh xuất, cố định */}
      {showMockupLabel && (
        <div
          style={{
            position: "relative",
            height: 16 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 9 * scale,
              letterSpacing: 1.5 * scale,
              color: "rgba(0,0,0,0.22)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Mockup
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * Preview scale 1 (màn hình editor) — giữ nguyên tỷ lệ Zalo.
 * forwardRef để App bắt node export.
 */
const Preview = React.forwardRef<HTMLDivElement, PreviewProps>(function Preview(props, ref) {
  return <ChatWindow {...props} ref={ref} scale={1} width={400} height={640} />;
});
export default Preview;