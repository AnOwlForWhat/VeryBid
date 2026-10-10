# VeryBid 🚀
> **AI-powered Verified Online Auction Platform**

## 📖 Overview
VeryBid is a robust online auction platform designed specifically for the **Collectibles & Rare Items** niche (e.g., Diecast models, vintage tech, limited sneakers, antiques). It solves the biggest pain point in the secondary market: trust and authenticity. By leveraging Multimodal AI for automated initial item appraisal and integrating a high-performance real-time bidding engine, VeryBid ensures a fair, transparent, and exhilarating auction experience.

## ✨ Core Features
### 1. AI-Assisted Moderation (Trust & Verify)
- Sellers upload 5-10 detailed images of the item.
- Background workers process the images asynchronously using **Multimodal AI (Gemini 1.5 Flash/Pro)** to:
  - Identify the item model, authenticity markers, and specifications.
  - Detect physical defects (scratches, damages) from images.
  - Crawl web data for current market valuations.
- The AI generates a Trust Score & Risk Report for human moderators to approve/reject.

### 2. Real-Time Bidding Engine (WebSockets)
- Sub-second bid updates across all connected clients via STOMP WebSockets.
- Synchronized countdown timers.

### 3. Advanced Auction Rules
- **Anti-Sniping (Soft Close):** Any bid placed within the last 2 minutes automatically extends the auction by an additional 2 minutes, preventing last-second bot sniping and ensuring fair price discovery.
- **Buy-Now Option:** Sellers can set a premium price to allow buyers to instantly purchase the item, bypassing the auction wait time.

### 4. Concurrency & Race Condition Handling
- Strict transaction locking (Optimistic/Pessimistic Locking in DB + Redis Distributed Lock) to handle hundreds of concurrent users attempting to bid at the exact same millisecond during the auction's closing moments.

## 🛠 Tech Stack
- **Backend:** Java Spring Boot 3, Spring Security, Spring Data JPA.
- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui.
- **Database:** PostgreSQL (Primary Data), Redis (Caching, Distributed Locks, Pub/Sub).
- **Message Queue:** RabbitMQ (for async AI image processing).
- **Real-time:** Spring WebSocket (STOMP).
- **AI Integration:** Google Gemini API (Multimodal Vision & Search Grounding).

## 🛡️ DevOps, DevSecOps & QA
This project is engineered with an enterprise-grade infrastructure mindset, focusing heavily on security, automation, and reliability under load.

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose for isolated microservices (API, PostgreSQL, Redis, RabbitMQ).
- **CI/CD Pipeline:** GitHub Actions for automated build, test, and deployment.
- **Monitoring & Logging:** Prometheus & Grafana to monitor traffic spikes and active WebSocket connections.

### DevSecOps & Security
- **Authentication:** JWT with HttpOnly cookies for secure session management.
- **Rate Limiting & Anti-Spam:** Redis-based API rate limiting to mitigate DDoS and brute-force bid spamming.
- **Security Scanning (SAST):** SonarQube / Snyk integrated into the CI pipeline to automatically scan for vulnerabilities in code and dependencies.
- **WebSocket Security:** Handshake interception and JWT validation for STOMP connections.
- **Input Validation:** Strict sanitization to prevent SQL Injection and XSS.

### Quality Assurance & Testing
- **Unit & Integration Testing:** JUnit 5, Mockito, Testcontainers.
- **Stress & Load Testing (Crucial):** Using **JMeter** or **k6** to simulate the "Flash Crowd" effect (e.g., 1,000 concurrent users spamming the bid button in the final 10 seconds) to prove the system handles concurrency without crashing or data corruption.

## 📐 System Architecture (High-Level)
*(To be added: Architecture Diagram detailing Client -> Spring Boot API -> RabbitMQ -> AI Worker)*

## 🗄️ Database Schema
*(To be added: ERD containing Users, Categories, Items, Item_Images, Item_AI_Reports, Auctions, Bids, Transactions)*

## 🛣️ Roadmap
- **Phase 1: Foundation & Auth** - Setup Spring Boot, Next.js, Docker, PostgreSQL, JWT Auth.
- **Phase 2: Core Auction & Real-time** - Auction CRUD, STOMP WebSockets, Bid Concurrency Locking.
- **Phase 3: AI Moderation Pipeline** - Image Upload (AWS S3/Cloudinary), RabbitMQ Workers, Gemini API Integration.
- **Phase 4: DevSecOps & Load Testing** - CI/CD, JMeter Load Testing, Security Hardening.
