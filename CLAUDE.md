# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TKKC校园导览 — a campus map/navigation system for Xiamen University Tan Kah Kee College. Three modules: Java Spring Boot backend, UniApp mobile client (H5), and a Vue 3 admin panel.

## Core Commands

### Backend (`back_end/school-map/`)
```bash
# Run (Spring Boot + Maven)
cd back_end/school-map && mvn spring-boot:run

# Build
cd back_end/school-map && mvn clean package -DskipTests

# Run tests
cd back_end/school-map && mvn test
```

### Client (`client/git_uniapp/`)
```bash
# Dev server (H5, port 8081)
cd client/git_uniapp && npm run dev:h5

# Build for H5
cd client/git_uniapp && npm run build:h5
```

### Admin Web (`manage-web/`)
```bash
# Dev server (port 5173)
cd manage-web && npm run dev

# Build for production
cd manage-web && npm run build:prod
```

## Architecture

### Backend (`back_end/school-map/`)
Spring Boot 3.5.6 / Java 21 / MyBatis / MySQL — layered architecture:

- **`controller/admin/`** — admin APIs: location CRUD, sub-location, comment/image review, user management, file upload
- **`controller/user/`** — user-facing APIs: location listing, auth (login/register/check), comments, pending image submission
- **`service/`** — business logic layer (one service per domain)
- **`mapper/`** — MyBatis interfaces, backed by XML mapper files in `resources/mapper/`
- **`pojo/`** — entities, with subdirectories for **DTO** (input), **VO** (output), plus `Result<T>` (code 1 = success, 0 = error) and `PageResult` (total + records)
- **`config/`** — CORS (`WebConfig`), Alibaba Cloud OSS (`OssConfiguration`), Spring AI DashScope
- **`interceptor/`** — `TokenInterceptor` for JWT Bearer token validation (currently registered but commented out in WebConfig)
- **`utils/`** — `JwtUtils`, `AliOssUtil`, `AliOssProperties`

Auth: JWT tokens via `io.jsonwebtoken/jjwt`. Admin login at `/admin/login`, user login at `/user/login`. Token interceptor logic exists but is disabled in config.

Image storage: Alibaba Cloud OSS (`yyc-map-location-images` bucket, Beijing endpoint). Configured via `yyc.alioss.*` properties in `application.yml`.

AI integration: Spring AI Alibaba Agent Framework with DashScope (api-key in config). Also Coze chatbot in the client.

### Client (`client/git_uniapp/`)
UniApp Vue 3 app targeting H5, organized by concern:

**Pages**: `pages/map/index.vue` (main map, thin orchestrator), `pages/auth/auth.vue` (login/register)

**Composables** (`composables/`) — reusable logic extracted from previous monolith:
- `useMap.js` — map init, markers, click handling, locate, carousel
- `useAuth.js` — login/register/logout state + API calls
- `useRoutePlanning.js` — route planning + walking animation
- `useComments.js` — comment CRUD + client-side pagination
- `useImageUpload.js` — image upload + pending review management
- `useSearch.js` — location search + result handling

**Components** (`components/`) — UI extracted from monolith:
- `SearchBar/`, `MapControls/`, `LocationPopup/`, `RouteDialog/`
- `CommentDialog/`, `LoginDialog/`, `PendingImagesDialog/`
- `ImagePreview/`, `CozeChat/`, `BeianFooter/`

**Utils**: `utils/request.js` (uni.request wrapper, base URL `http://localhost:8080`), `config/map.js` (Amap key/security, default center/zoom), `api/apis.js` (all API calls), `App.vue` (root + Coze chatbot overlay)

Important: The `BASE_URL` is hardcoded to `http://localhost:8080` in `utils/request.js`. When deploying to production, update this or use relative paths through nginx.

### Admin Web (`manage-web/`)
Vue 3 + Vite 6 admin panel, based on RuoYi-Vue 3.9.0. Element Plus + Pinia.
- **`src/router/index.js`** — routes: Index, Location Management, Sub-location Management, Comment Review, System/User Management, Image Review
- **`src/store/modules/user.js`** — auth state (Pinia), uses cookie for username persistence
- **`src/store/modules/permission.js`** — dynamic route generation based on roles
- **`src/permission.js`** — route guard with white list (`/`, `/login`, `/register`), checks for stored username before allowing access
- **`src/api/`** — API modules organized by domain under `system/` (login, location_info, sub_location, comment_review, user, etc.)
- **`vite.config.js`** — dev proxy rewrites `/api` and `/dev-api` to `http://localhost:8080`

The admin panel runs under `/admin/` base path in production. Login uses username + password without server-side token — just stores username in cookies. Roles are hardcoded to `['admin']` in getUserInfo.

### Database
MySQL `school_map` database. MyBatis XML mappers define all queries. Key tables map to the pojo entities: `LocationInfo`, `SubLocation`, `LocationImages`, `SubLocationImages`, `User`, `UserComment`, `PendingReviewImages`, `ManagementReview`.

A SQL dump is available at `_localhost-2026_04_21_23_54_25-dump.sql` in the repo root.

## Important Notes

- The canonical remote is GitHub (`git@github.com:noGoodJuiceForYou/school_map.git`). The old Gitee mirror is deprecated — do not push to it.
- When developing locally, the client's `utils/request.js` base URL and `manifest.json` proxy settings must point to the running backend (default: `http://localhost:8080`).
- CORS is configured for `localhost:8081`, `localhost:5173-5175`, and the production domain `xujcmap.top`.
- Secrets are **not** committed. Copy the templates and fill in real values:
  - Backend: `back_end/school-map/src/main/resources/application.example.yml` → `application.yml` (git-ignored). Values may also come from env vars (`DASHSCOPE_API_KEY`, `DB_USERNAME`, `DB_PASSWORD`, `OSS_BUCKET_NAME`, `OSS_ENDPOINT`, `OSS_ACCESS_KEY_ID`, `OSS_ACCESS_KEY_SECRET`).
  - Client: `client/git_uniapp/.env.example` → `.env` (`VITE_AMAP_KEY`, `VITE_AMAP_SECURITY_CODE`, `VITE_COZE_TOKEN`). Amap is loaded dynamically in `main.js`.
  - Admin: `manage-web/.env.example` → `.env.local` (`VITE_AMAP_KEY`, `VITE_AMAP_SECURITY_CODE`).
