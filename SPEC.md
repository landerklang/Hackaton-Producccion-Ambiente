# Project Specification: Hub Productivo Formosa (Hackathon MVP)

## 1. Context & Objective
A 24-hour React Native mobile MVP to connect local producers with buyers in Formosa. Transactions are handled externally via WhatsApp. The core value is discovery, geolocation, and AI-assisted onboarding for non-tech-savvy producers via an NLP-to-JSON bot.

## 2. Tech Stack
- **Frontend:** React Native (Expo recommended for rapid hackathon prototyping).
- **Backend:** Node.js with Express.js.
- **Database:** MongoDB (using Mongoose for schemas and geospatial indexing).
- **Security/Auth:** bcrypt.js (for basic producer password hashing).
- **AI Assistant:** Google Gemini API / OpenAI API (Structured JSON output mode).
- **Maps & Geolocation:** `react-native-maps` + MongoDB `2dsphere` index for location-based queries.

## 3. Core Entities & Data Model (MongoDB)

### Producer (Collection: `producers`)
- `_id`: ObjectId
- `name`: String (e.g., "Apícola Formosa")
- `category`: String (e.g., "Agro", "Tecnología", "Artesanía")
- `whatsappNumber`: String (Format: country code + number)
- `passwordHash`: String (hashed via bcrypt)
- `location`: GeoJSON Object 
  - `type`: "Point"
  - `coordinates`: [longitude, latitude]
- `addressText`: String (e.g., "Barrio Centro, Capital")

### Product (Collection: `products`)
- `_id`: ObjectId
- `producerId`: ObjectId (Ref: 'Producer')
- `title`: String
- `price`: Number / String
- `imageUrl`: String
- `tags`: [String] (e.g., ["miel", "organico"])
- `metadata`: Object (Flexible schema for dynamic attributes based on category)

## 4. Key Screens (React Native)

1. **Home / Dashboard Screen:**
   - Search bar component.
   - Interactive Map (`react-native-maps`) plotting nearby `Producers` using pins.
   - Horizontal ScrollView of recent/random `Products`.
2. **Search Results Screen:**
   - FlatList rendering `ProductCard` components.
3. **Product Modal / Detail Sheet:**
   - Large image, price, tags.
   - Primary Button: "Contactar por WhatsApp" (uses React Native `Linking.openURL('whatsapp://send?phone=...&text=...')`).
4. **Producer Storefront Screen:**
   - Producer info header and map snippet of their location.
   - FlatList of their specific `Products`.
5. **AI Assistant Screen (Producer Panel):**
   - TextInput for natural language input ("Describe what you sell").
   - Backend endpoint `/api/products/ai-generate` calls LLM, receives JSON, and creates the `Product` document.

## 5. Technical Constraints & Hackathon Shortcuts
- Use Expo Go for testing to avoid Android Studio/Xcode build times.
- Mock image uploads: Use direct image URLs or a simple Cloudinary endpoint. Do not build custom file storage.
- Keep the map scope centered on Formosa coordinates by default (`latitude: -26.1849, longitude: -58.1731`).