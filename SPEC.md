# Project Specification: Hub Productivo Formosa (Hackathon MVP)

## 1. Context & Objective
A 24-hour React Native mobile/web MVP designed as a **relational hub** rather than a traditional transactional marketplace. It connects local producers with buyers in Formosa, fostering a "Kilómetro Cero" economy and B2B networking. Transactions are handled seamlessly via direct WhatsApp routing. Core features include producer-centric discovery, a geolocation Map Modal, Role-Based Access Control (RBAC), and an AI-assisted onboarding flow for non-tech-savvy entrepreneurs.

## 2. Tech Stack
- **Frontend:** React Native (Expo) optimized for both Mobile and Web responsiveness.
- **State/Session:** `AsyncStorage` for local token persistence and RBAC UI toggling.
- **Backend:** Node.js with Express.js.
- **Database:** MongoDB (Mongoose for schemas, `2dsphere` for geospatial indexing).
- **Security/Auth:** bcrypt.js for password hashing.
- **AI Assistant:** Google Gemini API / OpenAI API (Structured JSON output mode).
- **Maps & Geolocation:** `react-native-maps` for the contextual Map Modal.

## 3. UI & Styling Guidelines (Theme: Institucional Local)
The application utilizes a clean, high-contrast light theme inspired by the colors of Argentina and Formosa to project official, institutional reliability while preventing eye strain.

- **Main Backgrounds (Screens):** `#F8F9FA` (Off-white)
- **Headers & Primary Buttons:** `#74ACDF` (Celeste Argentino)
- **Cards & Inputs Background:** `#FFFFFF` (Pure white with subtle `#000` shadow/elevation)
- **Primary Text (Titles, user names):** `#2D2D2D` (Dark slate grey)
- **Secondary Text (Descriptions, placeholders):** `#6C757D`
- **Borders & Dividers:** `#E0E0E0`
- **Category Tags:** Background `#E3F2FD`, Text `#1565C0`
- **Keyword Tags:** Background `#E9ECEF`, Text `#495057`

## 4. Core Entities & Data Model (MongoDB)

### User (Collection: `users`)
- `_id`: ObjectId
- `name`: String
- `email`: String
- `passwordHash`: String
- `role`: Enum `['comprador', 'productor']`
- `businessId`: ObjectId (Ref: 'Producer', nullable)

### Producer/Business (Collection: `producers`)
- `_id`: ObjectId
- `ownerId`: ObjectId (Ref: 'User')
- `name`: String (e.g., "Apiarios del Monte")
- `category`: String (e.g., "Alimentos", "Tecnología", "Artesanía")
- `description`: String
- `whatsappNumber`: String (Format: country code + number for universal deep linking)
- `keywords`: [String]
- `coverImage`: String (URL)
- `location`: GeoJSON Object 
  - `type`: "Point"
  - `coordinates`: [longitude, latitude]

### Product (Collection: `products`)
- `_id`: ObjectId
- `producerId`: ObjectId (Ref: 'Producer')
- `title`: String
- `price`: Number
- `description`: String
- `imageUrl`: String
- `tags`: [String]

## 5. Key Screens (React Native)

1. **Auth Stack (Welcome / Login / Register):**
   - Centered responsive cards (`maxWidth: 450`).
   - Registration defaults to redirecting to `Home` to allow browsing before forcing store creation.
2. **Home Screen (Producer Discovery):**
   - Producer-centric search (queries `name` and `keywords`).
   - UI toggles based on RBAC (Hides "Publicar" if user is a `comprador`).
   - Producer Cards with cover images and direct WhatsApp action buttons.
3. **Map Modal:**
   - Overlays on the Home screen via `react-native-maps`.
   - Renders pins strictly based on active search/filter results.
4. **Profile Screen (Management Hub):**
   - Fetches and syncs user data via `AsyncStorage` / API.
   - RBAC Conditional UI: If `productor` without a business, shows "Crear Negocio con IA". If has business, shows "Subir nuevo artículo".
5. **AI Assistant Screen (Store/Product Generation):**
   - Natural language input mapped to structured catalog fields.
   - Includes live image preview via URL pasting for rapid MVP testing.
6. **Centro de Desarrollo Emprendedor (Resources):**
   - Reusable card grid displaying formalization guides, institutional links, and regional normative data.

## 6. Technical Constraints & Hackathon Shortcuts
- **Web Compatibility:** Wrap all main screen content in `maxWidth: 1000` or `maxWidth: 600` containers with `alignSelf: 'center'` to ensure the app functions perfectly as a web dashboard for judges.
- **Image Handling:** Use direct image URLs with live `<Image>` previews instead of building complex multi-part form file uploads.
- **Map Centering:** Default `react-native-maps` region rigidly set to Formosa (`latitude: -26.1849, longitude: -58.1731`, delta `0.05`).