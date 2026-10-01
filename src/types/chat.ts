/** Kiểu dữ liệu cho App tạo ảnh mockup hội thoại Zalo */

export type Sender = "me" | "friend";
export type MessageKind = "text" | "image";
export type Presence = "online" | "recently" | "hidden";

export interface MessageItem {
  id: string;
  kind: "message";
  sender: Sender;
  text: string;
  time: string;
  messageKind?: MessageKind;
  imageSrc?: string; // data URL
  showSenderName?: boolean;
  senderLabel?: string;
}

export interface TimeItem {
  id: string;
  kind: "time";
  label: string;
}

export type EditorItem = MessageItem | TimeItem;

export interface ChatConfig {
  name: string;
  avatarUrl: string; // "" = gradient + chữ cái
  presence: Presence;
  showComposer: boolean;
  showMockupLabel: boolean;
  bubbleMaxWidth: number; // %
  backgroundColor: string;
}

export const DEFAULT_CONFIG: ChatConfig = {
  name: "Minh Anh",
  avatarUrl: "",
  presence: "online",
  showComposer: true,
  showMockupLabel: true,
  bubbleMaxWidth: 78,
  backgroundColor: "#E8ECF1",
};

export interface AppState {
  config: ChatConfig;
  items: EditorItem[];
}

export const PRESENCE_LABELS: Record<Presence, string> = {
  online: "Đang hoạt động",
  recently: "Vừa mới truy cập",
  hidden: "Không hiển thị",
};

/** Tạo id duy nhất */
export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now();
}