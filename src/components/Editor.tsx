import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Copy,
  Image as ImageIcon,
  User,
  Users,
  Clock,
  Upload,
} from "lucide-react";
import type { AppState, ChatConfig, EditorItem, Presence, Sender } from "../types/chat";
import { PRESENCE_LABELS, uid } from "../types/chat";
import { COLORS } from "../lib/tokens";

/* ============================================================
   Editor — panel bên phải: nhập liệu + sắp xếp kéo thả
   ============================================================ */

interface EditorProps {
  state: AppState;
  onChange: (next: AppState) => void;
}

/* ---------- helpers ---------- */
function msgItem(sender: Sender): EditorItem {
  return { id: uid(), kind: "message", sender, text: "", time: "09:00", messageKind: "text" };
}
function timeItem(): EditorItem {
  return { id: uid(), kind: "time", label: "Hôm nay" };
}

/* ---------- item có khả năng kéo ---------- */
function SortableRow({
  item,
  index,
  callbacks,
}: {
  item: EditorItem;
  index: number;
  callbacks: {
    patch: (id: string, p: Partial<EditorItem>) => void;
    duplicate: (id: string) => void;
    remove: (id: string) => void;
    addImage: (id: string, file: File) => void;
  };
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const field = (label: string, children: React.ReactNode) => (
    <label className="block mb-2">
      <span className="block text-[11px] font-semibold text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );

  const badgeColor =
    item.kind === "time"
      ? { bg: "#FFF4E5", color: "#B45309", text: "Mốc thời gian" }
      : item.sender === "me"
        ? { bg: "#E8F1FF", color: COLORS.zaloBlue, text: "Tôi" }
        : { bg: "#F0F7F6", color: "#0E7A6B", text: "Người chat" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-3 mb-2 shadow-sm"
    >
      {/* Hàng trên: kéo + loại */}
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-0.5"
          title="Kéo để đổi thứ tự"
        >
          <GripVertical size={16} />
        </button>
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
          style={{ background: badgeColor.bg, color: badgeColor.color }}
        >
          {badgeColor.text}
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">#{index + 1}</span>
      </div>

      {item.kind === "time" ? (
        <input
          value={item.label}
          onChange={(e) => callbacks.patch(item.id, { label: e.target.value })}
          placeholder="Hôm nay / 17:33"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      ) : (
        <>
          {/* Người gửi + thời gian */}
          <div className="grid grid-cols-2 gap-2">
            {field(
              "Người gửi",
              <select
                value={item.sender}
                onChange={(e) => callbacks.patch(item.id, { sender: e.target.value as Sender })}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="me">Tôi</option>
                <option value="friend">Người chat</option>
              </select>
            )}
            {field(
              "Thời gian",
              <input
                type="text"
                value={item.time}
                onChange={(e) => callbacks.patch(item.id, { time: e.target.value })}
                placeholder="09:41"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Loại tin */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => callbacks.patch(item.id, { messageKind: "text" })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                item.messageKind !== "image"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => callbacks.patch(item.id, { messageKind: "image" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                item.messageKind === "image"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-500 bg-white"
              }`}
            >
              <ImageIcon size={13} /> Ảnh
            </button>
            {item.messageKind === "image" && (
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-500 text-blue-600 bg-white cursor-pointer">
                <Upload size={13} /> Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) callbacks.addImage(item.id, f);
                  }}
                />
              </label>
            )}
          </div>

          {item.messageKind === "image" ? (
            item.imageSrc ? (
              <img
                src={item.imageSrc}
                alt=""
                className="w-full max-h-52 object-contain rounded-lg border border-gray-100 mb-1"
              />
            ) : (
              <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg py-4 text-center mb-1">
                Chọn ảnh để hiển thị trong bubble
              </div>
            )
          ) : (
            <textarea
              value={item.text}
              onChange={(e) => callbacks.patch(item.id, { text: e.target.value })}
              placeholder="Nội dung tin nhắn…"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-blue-500"
            />
          )}

          {/* Hành động */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => callbacks.duplicate(item.id)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-gray-50"
            >
              <Copy size={13} /> Duplicate
            </button>
            <button
              onClick={() => callbacks.remove(item.id)}
              className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded ml-auto"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- panel chính ---------- */
export default function Editor({ state, onChange }: EditorProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const patch = (id: string, p: Partial<EditorItem>) =>
    onChange({
      ...state,
      items: state.items.map((it) => (it.id === id ? ({ ...it, ...p } as EditorItem) : it)),
    });
  const duplicate = (id: string) => {
    const idx = state.items.findIndex((it) => it.id === id);
    if (idx < 0) return;
    const original = state.items[idx];
    const copy: EditorItem = { ...original, id: uid() } as EditorItem;
    const items = [...state.items];
    items.splice(idx + 1, 0, copy);
    onChange({ ...state, items });
  };
  const remove = (id: string) =>
    onChange({ ...state, items: state.items.filter((it) => it.id !== id) });
  const addImage = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => patch(id, { imageSrc: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const addItem = (kind: Sender | "time") =>
    onChange({
      ...state,
      items: [...state.items, kind === "time" ? timeItem() : msgItem(kind)],
    });
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = state.items.findIndex((it) => it.id === active.id);
    const newIndex = state.items.findIndex((it) => it.id === over.id);
    onChange({ ...state, items: arrayMove(state.items, oldIndex, newIndex) });
  };

  const patchConfig = (p: Partial<ChatConfig>) =>
    onChange({ ...state, config: { ...state.config, ...p } });
  const onAvatarFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => patchConfig({ avatarUrl: String(reader.result) });
    reader.readAsDataURL(f);
  };

  const btnBase =
    "flex-1 flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold px-3 py-2.5 transition active:scale-[0.98]";

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      {/* ===== Cài đặt hội thoại ===== */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
          Cài đặt hội thoại
        </h2>

        <label className="block mb-3">
          <span className="block text-[11px] font-semibold text-gray-500 mb-1">TÊN NGƯỜI CHAT</span>
          <input
            value={state.config.name}
            onChange={(e) => patchConfig({ name: e.target.value })}
            placeholder="Tên hiển thị trên header"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </label>

        <div className="mb-3">
          <span className="block text-[11px] font-semibold text-gray-500 mb-1">AVATAR</span>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold border border-gray-200"
              style={{
                background: state.config.avatarUrl
                  ? `url(${state.config.avatarUrl}) center/cover`
                  : "linear-gradient(135deg,#4D9FFF,#0047B3)",
              }}
            >
              {!state.config.avatarUrl && (state.config.name[0] || "?").toUpperCase()}
            </div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-50">
              <Upload size={14} /> Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onAvatarFile(e.target.files[0])}
              />
            </label>
            {state.config.avatarUrl && (
              <button
                onClick={() => patchConfig({ avatarUrl: "" })}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        <label className="block mb-3">
          <span className="block text-[11px] font-semibold text-gray-500 mb-1">TRẠNG THÁI</span>
          <select
            value={state.config.presence}
            onChange={(e) => patchConfig({ presence: e.target.value as Presence })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            {(Object.keys(PRESENCE_LABELS) as Presence[]).map((p) => (
              <option key={p} value={p}>
                {PRESENCE_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        {/* Tùy chọn hiển thị */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 bg-gray-50 rounded-xl p-3">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.config.showComposer}
              onChange={(e) => patchConfig({ showComposer: e.target.checked })}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            Hiện thanh gõ tin
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.config.showMockupLabel}
              onChange={(e) => patchConfig({ showMockupLabel: e.target.checked })}
              className="accent-blue-600 w-3.5 h-3.5"
            />
            Nhãn "Mockup"
          </label>
          <label className="col-span-2 flex items-center gap-2 text-xs text-gray-600">
            <span className="whitespace-nowrap">Bubble tối đa</span>
            <input
              type="range"
              min={50}
              max={90}
              value={state.config.bubbleMaxWidth}
              onChange={(e) => patchConfig({ bubbleMaxWidth: Number(e.target.value) })}
              className="flex-1 accent-blue-600"
            />
            <span className="w-8 text-right text-gray-500">{state.config.bubbleMaxWidth}%</span>
          </label>
        </div>
      </section>

      {/* ===== Danh sách hội thoại ===== */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
          Danh sách hội thoại
          <span className="font-normal text-gray-400 normal-case ml-2">
            ({state.items.length} item)
          </span>
        </h2>

        {/* Nút thêm nhanh */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => addItem("me")}
            className={btnBase}
            style={{ background: COLORS.zaloBlue, color: "#fff" }}
          >
            <User size={15} /> Tin nhắn của tôi
          </button>
          <button
            onClick={() => addItem("friend")}
            className={`${btnBase} border`}
            style={{ borderColor: COLORS.zaloBlue, color: COLORS.zaloBlue, background: "#fff" }}
          >
            <Users size={15} /> Tin nhắn người chat
          </button>
          <button
            onClick={() => addItem("time")}
            className={`${btnBase} border`}
            style={{ borderColor: "#B45309", color: "#B45309", background: "#fff" }}
          >
            <Clock size={15} /> Mốc TG
          </button>
        </div>

        {/* Kéo thả sắp xếp */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={state.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {state.items.length === 0 && (
              <div className="text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl py-10">
                Chưa có tin nhắn nào. Bấm nút phía trên để thêm.
              </div>
            )}
            {state.items.map((it, i) => (
              <SortableRow key={it.id} item={it} index={i} callbacks={{ patch, duplicate, remove, addImage }} />
            ))}
          </SortableContext>
        </DndContext>
      </section>

      <p className="text-[11px] text-gray-400 text-center pb-4">
        Preview cập nhật <strong>real-time</strong> — không cần nút Apply. Kéo giữ nút ⋮⋮ để
        đổi thứ tự.
      </p>
    </div>
  );
}