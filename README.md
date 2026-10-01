# Zalo Mockup Generator

Web app tạo ảnh mô phỏng hội thoại Zalo (chat preview) — nhập nội dung hội thoại, xem preview real-time, tải ảnh PNG chất lượng cao 3x.

**Không** kết nối Zalo, **không** đăng nhập, **không** gửi tin nhắn thật. Chỉ là UI generator.

## Chạy

```bash
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # build production → dist/
npm run preview    # xem bản build
```

## Tính năng

### Layout 2 cột
- **TRÁI — Kết quả**: Chat Preview cập nhật **real-time** (không cần nút Apply)
- **PHẢI — Chỉnh sửa**: toàn bộ form nhập liệu

### Nhập liệu
- TÊN NGƯỜI CHAT, AVATAR (upload ảnh), TRẠNG THÁI (Đang hoạt động / Vừa mới truy cập / Không hiển thị)
- 3 nút nhập nhanh:
  - **Tin nhắn của tôi** → bubble căn phải (gradient xanh Zalo)
  - **Tin nhắn người chat** → bubble căn trái (trắng)
  - **Mốc thời gian** → pill căn giữa (Hôm nay / 17:33)
- Mỗi tin: Người gửi, Nội dung (textarea), Thời gian (text), Loại (Text / Ảnh + upload), Duplicate, Delete
- **Kéo thả** (giữ ⋮⋮) đổi thứ tự mọi item: TIME / MESSAGE / MESSAGE / TIME / MESSAGE

### Preview Zalo (tái tạo theo mã màu hệ thiết kế Zalo)
- Header trắng 66px: avatar 44px + tên + trạng thái + 4 icon (gọi thoại/video/tìm/⋯)
- Nền chat `#E8ECF1`, bubble in trắng (`#FFFFFF`) / out gradient `#4B8DFF→#0068FF`
- Border radius 16px + góc gãy 5px phía avatar, padding 9x13px, max-width 78%
- Bubble news: font hệ thống 15px, line-height 1.45, emoji hiển thị nguyên bản
- Mốc thời gian dạng pill trắng mờ giữa
- Composer: nền trắng + divider `#E4E6EB`, input capsule `#F4F5F7` "Tin nhắn"
- Tùy chọn: hiện/ẩn thanh gõ tin, hiện/ẩn nhãn "Mockup", kéo slider bubble tối đa (50–90%)

### Export
- Nút **TẢI ẢNH** → chỉ capture Chat Preview (không capture editor/website)
- PNG độ phân giải cao **3x**, nền đúng màu chat, vuông cạnh như screenshot
- Nhãn "MOCKUP" nhỏ cố định mép dưới ảnh (phân biệt với ảnh chụp thật)

### Kỹ thuật
- React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- lucide-react (icon), @dnd-kit (kéo thả), html-to-image (export PNG)
- Tự lưu trạng thái vào localStorage (mở lại vẫn còn nội dung)

## Nghiên cứu UI Zalo (nguồn)
- Token màu chính: `#0068FF` xác nhận từ bundle chính thức `chat.zalo.me` (lazy_default-embed-render.js)
- Bubble radius 16px / tail 5px / max 78% / padding 9x13 / nền `#E8ECF1`: từ hệ thiết kế Zalo (DESIGN.md)
- Font: hệ thống (SF Pro / Segoe UI / Roboto / Noto Sans)

## Cấu trúc

```
ZLo/
├── index.html
├── vite.config.ts          # React + Tailwind v4
├── src/
│   ├── App.tsx             # Layout 2 cột + logic export PNG
│   ├── components/
│   │   ├── Preview.tsx     # ChatWindow (header/thread/composer/bubble)
│   │   └── Editor.tsx      # Panel nhập liệu + dnd-kit sortable
│   ├── lib/tokens.ts       # Design tokens Zalo (colors/typography/dimensions)
│   └── types/chat.ts       # Types EditorItem/ChatConfig
```