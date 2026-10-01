import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Smartphone } from "lucide-react";
import Preview from "./components/Preview";
import Editor from "./components/Editor";
import type { AppState } from "./types/chat";
import { DEFAULT_CONFIG, uid } from "./types/chat";
import { COLORS } from "./lib/tokens";

/* ============================================================
   Zalo Mockup Generator — layout 2 cột
   TRÁI : Chat Preview (cập nhật real-time)
   PHẢI : Editor (nhập liệu, kéo thả, export)
   ============================================================ */

const STORAGE_KEY = "zalo-mockup-state-v1";

/** Demo khởi tạo — đúng ví dụ người dùng đưa ra */
function initialState(): AppState {
  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch {
      /* ignore */
    }
    return null;
  })();
  if (saved && Array.isArray(saved.items) && saved.config) return saved;
  return {
    config: { ...DEFAULT_CONFIG, name: "Minh Anh" },
    items: [
      { id: uid(), kind: "time", label: "17:33 Hôm nay" },
      { id: uid(), kind: "message", sender: "friend", text: "Bạn đang làm gì đấy?", time: "17:33" },
      { id: uid(), kind: "message", sender: "me", text: "Mình đang làm việc.", time: "17:34" },
      { id: uid(), kind: "message", sender: "friend", text: "Tối nay rảnh không?", time: "17:35" },
      { id: uid(), kind: "message", sender: "me", text: "Có.", time: "17:36" },
    ],
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Lưu tự động (real-time) vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state]);

  const itemCount = state.items.length;

  // Xuất PNG 3x — chỉ capture node ChatWindow (không capture editor/website)
  const handleExport = useCallback(async () => {
    const node = previewRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: state.config.backgroundColor,
        cacheBust: false,
        skipFonts: true, // không chờ font mạng — dùng font hệ thống mặc định
        // Ảnh xuất = screenshot Zalo thật: vuông cạnh, không shadow khung
        style: {
          borderRadius: "0px",
          boxShadow: "none",
          margin: "0",
          // Preview hiển thị là viewport cố định (scroll nội bộ); khi capture
          // bỏ height cố định → ảnh PNG full toàn bộ conversation, không cắt
          height: "auto",
          maxHeight: "none",
          overflow: "visible",
        },
      });
      const slug =
        (state.config.name || "chat")
          .trim()
          .replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ]+/g, "-")
          .slice(0, 40) || "chat";
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `zalo-mockup-${slug}.png`;
      a.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Xuất ảnh thất bại: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  }, [state.config.backgroundColor, state.config.name]);

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      {/* ============ TRÁI — KẾT QUẢ ============ */}
      <main className="flex-1 min-w-0 h-1/2 md:h-full flex flex-col">
        {/* Thanh trên: tiêu đề + nút tải ảnh */}
        <header className="h-14 flex items-center gap-3 px-4 bg-white border-b border-gray-200 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: COLORS.zaloBlue }}
          >
            <Smartphone size={18} />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-gray-800">Zalo Mockup Generator</h1>
            <p className="text-[11px] text-gray-400">
              {itemCount} item · preview cập nhật real-time · xuất PNG 3x
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="ml-auto flex items-center gap-2 text-sm font-bold text-white rounded-xl px-5 py-2.5 transition active:scale-[0.97] disabled:opacity-60 disabled:cursor-wait"
            style={{ background: COLORS.zaloBlue }}
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Đang tạo ảnh…" : "TẢI ẢNH"}
          </button>
        </header>

        {/* Vùng preview — scroll khi dài */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-100">
          <div className="w-[420px] max-w-full">
            <Preview
              ref={previewRef}
              config={state.config}
              items={state.items}
              showMockupLabel={state.config.showMockupLabel}
            />
          </div>
        </div>
      </main>

      {/* ============ PHẢI — CHỈNH SỬA ============ */}
      <aside className="w-full md:w-[480px] lg:w-[520px] h-1/2 md:h-full bg-white border-l border-gray-200 shrink-0">
        <Editor state={state} onChange={setState} />
      </aside>
    </div>
  );
}