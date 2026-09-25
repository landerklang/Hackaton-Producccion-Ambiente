# Hub Productivo Formosa

Hub Productivo es una plataforma web y mobile para descubrir, visibilizar y activar emprendimientos locales de Formosa. Conecta productores con compradores mediante perfiles públicos, búsqueda, mapa y contacto directo por WhatsApp. Además, incorpora un asistente de IA que ayuda a transformar una idea de negocio en una propuesta estructurada, un plan inicial y un checklist legal orientativo.

El proyecto fue desarrollado como un MVP para hackathon con React Native + Expo en el frontend, Node.js + Express en el backend y MongoDB como base de datos.

## Funcionalidades principales

### Para compradores

- Explorar emprendimientos publicados.
- Buscar por nombre, categoría, descripción y palabras clave.
- Filtrar por categorías como alimentos, artesanías, tecnología y agro.
- Consultar emprendimientos en un mapa cuando tienen coordenadas.
- Abrir la descripción completa de cada emprendimiento.
- Contactar al productor directamente por WhatsApp.

### Para productores

- Registrarse e iniciar sesión con roles diferenciados.
- Generar un perfil de negocio con asistencia de IA.
- Revisar y editar los datos antes de publicar.
- Guardar el emprendimiento asociado al usuario autenticado.
- Consultar desde el perfil la descripción, el plan de negocio y el checklist legal.
- Actualizar el negocio existente sin crear duplicados.
- Editar nombre y email desde el perfil.

### Asistencia con IA

El flujo de emprendimiento recibe una idea, categoría, localidad, experiencia, disponibilidad y presupuesto. La IA devuelve información estructurada para:

- Perfil del emprendimiento.
- Cliente objetivo y oferta.
- Propuesta de valor.
- Primera oferta y estrategia de precio.
- Plan de acción para los primeros 30 días.
- Riesgos.
- Checklist legal orientativo y fuentes oficiales.

La IA genera un borrador: el productor debe revisarlo y confirmarlo antes de publicarlo.

## Tecnologías

- **Frontend:** React Native, Expo, React Native Web y React Navigation.
- **Backend:** Node.js, Express 5 y CommonJS.
- **Base de datos:** MongoDB con Mongoose.
- **Autenticación:** JWT, bcryptjs y AsyncStorage.
- **IA:** Google Gemini por defecto, con proveedor alternativo para Ollama.
- **Mapas:** `react-native-maps` en mobile y una implementación web compatible.
- **Contacto:** enlaces directos a WhatsApp.

## Estructura del proyecto

```text
/
├── backend/
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── modules/
│       │   ├── ai/
│       │   ├── favorites/
│       │   ├── producers/
│       │   ├── products/
│       │   └── users/
│       └── server.js
├── frontend/
│   ├── App.js
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── navigation/
│       └── screens/
├── ARCHITECTURE.md
├── SPEC.md
└── Readme.md
```

## Requisitos

- Node.js 18 o superior.
- npm.
- MongoDB local o una instancia de MongoDB Atlas.
- Una clave de Gemini si se utiliza el proveedor de IA por defecto.
- Expo CLI mediante los scripts incluidos en `frontend/package.json`.

## Configuración del backend

Desde la carpeta `backend`, crear un archivo `.env`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/hub-productivo
JWT_SECRET=un-secreto-local
AI_PROVIDER=gemini
GEMINI_API_KEY=tu-clave-de-gemini
```

Para usar Ollama en lugar de Gemini:

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_MODEL=qwen2.5:3b
```

Instalar dependencias y arrancar el servidor:

```bash
cd backend
npm install
npm run dev
```

El backend queda disponible en `http://localhost:3000`.

## Configuración del frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

Comandos útiles:

```bash
npm run web
npm run android
npm run ios
```

Para probar la versión web en una build estática:

```bash
npx expo export --platform web
```

La app utiliza `localhost` en web e iOS. En Android emplea `10.0.2.2` para acceder al backend local desde el emulador.

## API principal

### Salud y autenticación

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` con Bearer token
- `PUT /api/auth/me` con Bearer token

### Emprendimientos y productos

- `GET /api/producers`
- `POST /api/producers`
- `GET /api/producers/:id`
- `PUT /api/producers/:id`
- `GET /api/products`
- `POST /api/products`

Los productores pueden filtrarse por `status`, `category`, `q` y `ownerUserId`. El perfil utiliza `ownerUserId` para mostrar únicamente el negocio del usuario autenticado.

### IA

- `POST /api/ai/entrepreneur-guide`
- `POST /api/producers/ai-profile`
- `POST /api/products/ai-generate`

### Favoritos

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

## Flujo principal de demo

1. Ejecutar MongoDB y el backend.
2. Iniciar el frontend con Expo.
3. Crear una cuenta seleccionando el rol **Productor**.
4. Abrir **Publicar** y completar el flujo asistido por IA.
5. Revisar y publicar el emprendimiento.
6. Abrir **Perfil** para consultar la descripción, el plan de negocio y el checklist legal.
7. Volver a **Home** para ver el emprendimiento entre los destacados.
8. Probar búsqueda, filtros, mapa y contacto por WhatsApp.

## Persistencia y seguridad

- Las contraseñas se almacenan como hash mediante bcryptjs.
- Las sesiones utilizan JWT y el frontend conserva el token en AsyncStorage.
- Cada productor nuevo se asocia a `ownerUserId`.
- El índice único parcial de `ownerUserId` evita duplicar perfiles para un mismo usuario.
- La información legal generada por IA es orientativa y no reemplaza asesoramiento profesional.

## Validación

Build web validada con:

```bash
npx expo export --platform web
```

Chequeo de sintaxis del backend:

```bash
node --check backend/src/modules/users/userController.js
node --check backend/src/modules/producers/producerController.js
```

## Documentación adicional

- [SPEC.md](SPEC.md): alcance y especificación funcional del MVP.
- [ARCHITECTURE.md](ARCHITECTURE.md): decisiones de arquitectura y modelo de datos.
