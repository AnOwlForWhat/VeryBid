# VeryBid - Database Architecture & Design 🗄️

Tài liệu thiết kế cơ sở dữ liệu chi tiết cho hệ thống đấu giá trực tuyến **VeryBid**, tích hợp kiểm duyệt đa phương tiện bằng AI và cơ chế chống tranh chấp giao dịch giây chót (Concurrency Control).

---

## 1. Sơ đồ thực thể quan hệ (ERD - Entity Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o{ ITEMS : "owns"
    USERS ||--o{ BIDS : "places"
    USERS ||--o{ TRANSACTIONS : "performs"
    USERS ||--o{ AUCTIONS : "wins"

    CATEGORIES ||--o{ ITEMS : "classifies"

    ITEMS ||--|{ ITEM_IMAGES : "has 5-10 images"
    ITEMS ||--o| ITEM_AI_REPORTS : "analyzed by"
    ITEMS ||--o| AUCTIONS : "listed in"

    AUCTIONS ||--o{ BIDS : "receives"
    AUCTIONS ||--o{ TRANSACTIONS : "settles"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string phone
        string role "BIDDER | SELLER | ADMIN"
        decimal balance "Wallet / Deposit balance"
        int reputation_score "Score 0-100"
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        bigint id PK
        string name UK
        string slug UK
        string description
        timestamp created_at
    }

    ITEMS {
        uuid id PK
        uuid seller_id FK
        bigint category_id FK
        string title
        text description
        string declared_condition "Seller claim (e.g., Mint 100%, 95%)"
        decimal suggested_starting_price
        string status "DRAFT | AI_ANALYZING | PENDING_REVIEW | APPROVED | REJECTED"
        timestamp created_at
        timestamp updated_at
    }

    ITEM_IMAGES {
        bigint id PK
        uuid item_id FK
        string image_url
        string angle "FRONT | BACK | SERIAL | SCRATCH_DETAIL | PACKAGING"
        boolean is_thumbnail
        timestamp created_at
    }

    ITEM_AI_REPORTS {
        bigint id PK
        uuid item_id FK, UK
        string identified_model "Model name detected by Gemini"
        string condition_rate "e.g., 9/10"
        decimal market_price_min "Estimated lower bound"
        decimal market_price_max "Estimated upper bound"
        decimal suggested_start_price
        jsonb risk_flags "Array of flags: ['STOCK_PHOTO', 'MISMATCH']"
        int trust_score "Score 0-100"
        text moderator_note
        jsonb raw_ai_response "Complete Gemini JSON response"
        timestamp created_at
    }

    AUCTIONS {
        uuid id PK
        uuid item_id FK, UK
        decimal start_price
        decimal step_price "Minimum increment"
        decimal buy_now_price "Optional instant buyout"
        decimal current_price "Updated atomically on each bid"
        uuid current_winner_id FK
        timestamp start_time
        timestamp end_time
        string status "UPCOMING | ACTIVE | EXTENDED | ENDED | CANCELLED"
        bigint version "Optimistic Locking version"
        timestamp created_at
        timestamp updated_at
    }

    BIDS {
        bigint id PK
        uuid auction_id FK
        uuid bidder_id FK
        decimal bid_amount
        boolean is_auto_bid "Proxy bid flag"
        timestamp created_at "Indexed millisecond precision"
    }

    TRANSACTIONS {
        bigint id PK
        uuid user_id FK
        uuid auction_id FK
        string type "DEPOSIT_HOLD | DEPOSIT_REFUND | PAYMENT | WITHDRAW"
        decimal amount
        string status "PENDING | COMPLETED | FAILED"
        timestamp created_at
    }
```

---

## 2. Chi tiết cấu trúc các bảng

### 2.1. Bảng `users`
- **Mục đích:** Quản lý danh tính, phân quyền và số dư ví cọc của người tham gia.
- **Ràng buộc:**
  - `email`: UNIQUE, NOT NULL.
  - `role`: Enum (`BIDDER`, `SELLER`, `ADMIN`).
  - `balance`: Mặc định `0.00`, không được âm (`CHECK (balance >= 0)`).

### 2.2. Bảng `categories`
- **Mục đích:** Phân loại sản phẩm sưu tầm (Diecast Model, Vintage Tech, Sneaker...).
- **Ràng buộc:**
  - `slug`: UNIQUE (hỗ trợ SEO cho Next.js).

### 2.3. Bảng `items`
- **Mục đích:** Lưu thông tin món hàng ở giai đoạn nộp hồ sơ chờ duyệt.
- **Quan hệ:** N-1 với `users` (seller_id) và N-1 với `categories`.
- **Trạng thái (`status`):**
  - `DRAFT`: Người bán đang tạo, chưa nộp đủ ảnh.
  - `AI_ANALYZING`: Đã nộp 5-10 ảnh, đang chờ RabbitMQ worker gọi Gemini API.
  - `PENDING_REVIEW`: AI đã xuất report, chờ Moderator/Admin duyệt.
  - `APPROVED`: Được duyệt, sẵn sàng lên sàn đấu giá.
  - `REJECTED`: Bị từ chối (ảnh mờ, nghi hàng fake, mô tả sai sự thật).

### 2.4. Bảng `item_images`
- **Mục đích:** Lưu trữ tối thiểu 5–10 góc chụp chi tiết của sản phẩm.
- **Quan hệ:** N-1 với `items` (`ON DELETE CASCADE`).
- **Góc chụp (`angle`):** Bắt buộc người bán khai rõ góc để AI dễ bóc tách lỗi và số serial.

### 2.5. Bảng `item_ai_reports`
- **Mục đích:** Lưu kết quả phân tích đa phương thức (Multimodal Vision) và định giá từ Google Gemini.
- **Quan hệ:** 1-1 với `items`.
- **Cột đặc biệt:**
  - `raw_ai_response`: Kiểu dữ liệu `JSONB` lưu toàn bộ payload JSON trả về từ LLM để truy vết sau này.
  - `trust_score`: Thang điểm 0–100 giúp Moderator duyệt nhanh trong 5 giây.

### 2.6. Bảng `auctions` (Trọng tâm hệ thống)
- **Mục đích:** Quản lý vòng đời và trạng thái trực tiếp của phòng đấu giá.
- **Quan hệ:** 1-1 với `items`.
- **Cơ chế kỹ thuật cốt lõi:**
  - **`version` (Optimistic Locking):** Trường số nguyên tăng dần mỗi khi có lượt bid thành công. Dùng để chặn race condition khi 100 người cùng bấm bid ở giây thứ 59.
  - **`buy_now_price`:** Nếu người mua trả mức giá này, phiên chốt ngay lập tức.
  - **`status`:** Trạng thái `EXTENDED` biểu thị phiên vừa được tự động cộng thêm 2 phút nhờ cơ chế Anti-sniping.

### 2.7. Bảng `bids` (Write-Heavy)
- **Mục đích:** Lưu lịch sử toàn bộ các lượt trả giá.
- **Index quan trọng:**
  - Composite Index: `(auction_id, created_at DESC)` để lấy nhanh top giá mới nhất cho WebSocket STOMP.

### 2.8. Bảng `transactions`
- **Mục đích:** Lưu vết dòng tiền (Giữ cọc trước khi vào phòng đấu giá, hoàn cọc cho người thua, trừ tiền người thắng).

---

## 3. Chiến lược Index & Tối ưu hiệu năng (Performance Strategy)

| Tên bảng | Index | Mục đích tối ưu |
| :--- | :--- | :--- |
| `auctions` | `(status, end_time)` | Background Scheduler truy vấn siêu tốc các phiên sắp hết hạn để chốt phiên hoặc kích hoạt Anti-sniping |
| `bids` | `(auction_id, bid_amount DESC)` | Tìm nhanh giá cao nhất hiện tại của phiên |
| `bids` | `(auction_id, created_at DESC)` | WebSocket phát sóng lịch sử đặt giá gần nhất |
| `items` | `(seller_id, status)` | Lọc danh sách đồ của người bán trong Dashboard |
