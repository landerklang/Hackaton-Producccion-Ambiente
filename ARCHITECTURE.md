# Hub Productivo - Arquitectura y plan de modularizacion

## 1. Objetivo del producto

Hub Productivo es una plataforma para descubrir y visibilizar la oferta productiva local.

Debe permitir que una persona:

- Explore vendedores y productos cercanos.
- Busque utilizando texto libre o lenguaje natural.
- Vea resultados en formato lista y mapa dentro de la misma pantalla.
- Entre al perfil de un vendedor.
- Consulte sus productos y medios de contacto.
- Guarde vendedores o productos favoritos si esta logueada.

Debe permitir que un vendedor:

- Cree su perfil productivo.
- Cargue productos y servicios.
- Use IA para transformar texto informal en un perfil o producto estructurado.
- Revise y modifique manualmente los datos antes de publicar.
- Publique, edite y despublique su oferta.

La IA asiste la carga de datos. No debe publicar informacion sin confirmacion del vendedor.

---

## 2. Principios de modularizacion

1. Cada modulo debe tener una responsabilidad clara.
2. El frontend no debe acceder directamente a MongoDB ni a Ollama/Gemini.
3. Los controladores HTTP deben ser delgados: validan la entrada y delegan en servicios.
4. La logica de IA debe estar aislada del resto del dominio.
5. Los modelos de base de datos no deben contener logica de interfaz.
6. Los contratos de API deben definirse antes de conectar pantallas.
7. Un archivo debe tener un motivo claro para cambiar.
8. Las funcionalidades de vendedores, compradores, busqueda e IA deben poder modificarse de forma independiente.

---

## 3. Estructura propuesta del repositorio

```text
/
|-- ARCHITECTURE.md
|-- README.md
|-- SPEC.md
|-- backend/
|   |-- package.json
|   |-- .env.example
|   `-- src/
|       |-- server.js
|       |-- config/
|       |   |-- db.js
|       |   `-- env.js
|       |-- middleware/
|       |   |-- auth.js
|       |   |-- errorHandler.js
|       |   `-- validate.js
|       |-- modules/
|       |   |-- producers/
|       |   |   |-- producer.model.js
|       |   |   |-- producer.controller.js
|       |   |   |-- producer.service.js
|       |   |   |-- producer.routes.js
|       |   |   `-- producer.validation.js
|       |   |-- products/
|       |   |   |-- product.model.js
|       |   |   |-- product.controller.js
|       |   |   |-- product.service.js
|       |   |   |-- product.routes.js
|       |   |   `-- product.validation.js
|       |   |-- search/
|       |   |   |-- search.controller.js
|       |   |   |-- search.service.js
|       |   |   `-- search.routes.js
|       |   |-- ai/
|       |   |   |-- ai.controller.js
|       |   |   |-- ai.service.js
|       |   |   |-- providers/
|       |   |   |   |-- ollama.provider.js
|       |   |   |   `-- gemini.provider.js
|       |   |   `-- ai.routes.js
|       |   |-- users/
|       |   |   |-- user.model.js
|       |   |   |-- user.controller.js
|       |   |   |-- user.service.js
|       |   |   `-- user.routes.js
|       |   `-- favorites/
|       |       |-- favorite.model.js
|       |       |-- favorite.controller.js
|       |       |-- favorite.service.js
|       |       `-- favorite.routes.js
|       `-- shared/
|           |-- errors/
|           |-- pagination/
|           `-- geo/
|
`-- frontend/
    |-- App.js
    |-- src/
        |-- api/
        |   |-- client.js
        |   |-- producers.api.js
        |   |-- products.api.js
        |   |-- search.api.js
        |   |-- ai.api.js
        |   `-- favorites.api.js
        |-- components/
        |   |-- ProductCard.js
        |   |-- ProducerCard.js
        |   |-- ProducerProfile.js
        |   |-- SearchBar.js
        |   |-- SearchResults.js
        |   |-- MapView.native.js
        |   |-- MapView.web.js
        |   `-- ProfilePreview.js
        |-- screens/
        |   |-- HomeScreen.js
        |   |-- ProducerScreen.js
        |   |-- SearchScreen.js
        |   |-- AIPanelScreen.js
        |   |-- FavoritesScreen.js
        |   |-- LoginScreen.js
        |   `-- ProducerEditorScreen.js
        |-- navigation/
        |   `-- AppNavigator.js
        |-- state/
        |   |-- auth.js
        |   |-- search.js
        |   `-- favorites.js
        `-- utils/
            |-- formatters.js
            `-- geo.js
```

Durante la hackathon no es necesario crear todos estos archivos. La estructura indica el limite de cada responsabilidad para evitar que todo termine en `server.js`, `HomeScreen.js` o un controlador gigante.

---

## 4. Responsabilidades por modulo

### Producers

Gestiona el perfil publico del vendedor, su estado de publicacion y ubicacion.

No debe gestionar productos directamente ni llamar a Ollama.

### Products

Gestiona el catalogo publicado de cada vendedor.

Debe encargarse de crear, editar, listar, publicar y despublicar productos.

### Search

Combina filtros de texto, categoria, ubicacion y eventualmente relevancia semantica.

No debe duplicar la logica de `ProductService` ni consultar MongoDB desde el frontend.

### AI

Convierte texto libre en un borrador de perfil o producto.

Debe trabajar mediante un contrato estructurado y devolver JSON validado. No debe guardar automaticamente en la base de datos.

### Users

Gestiona compradores logueados y, en una etapa posterior, vendedores autenticados.

### Favorites

Relaciona usuarios con productores o productos guardados.

---

## 5. Modelo de datos MongoDB

### Producer

```js
{
  _id: ObjectId,
  name: String,
  slug: String,
  category: String,
  description: String,
  profileText: String,
  whatsappNumber: String,
  instagram: String,
  addressText: String,
  location: {
    type: 'Point',
    coordinates: [Number, Number]
  },
  status: 'draft' | 'published' | 'archived',
  ownerUserId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

Indices recomendados:

```js
producerSchema.index({ location: '2dsphere' });
producerSchema.index({ category: 1, status: 1 });
producerSchema.index({ name: 'text', description: 'text' });
```

La contrasena no deberia formar parte del perfil publico. Si se mantiene autenticacion local, debe vivir en `User.passwordHash`, no en `Producer`.

### Product

```js
{
  _id: ObjectId,
  producerId: ObjectId,
  title: String,
  description: String,
  price: Number | 'Consultar',
  currency: String,
  imageUrl: String,
  tags: [String],
  metadata: Object,
  status: 'draft' | 'published' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

Indices recomendados:

```js
productSchema.index({ producerId: 1, status: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
```

### User

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: 'buyer' | 'producer' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Favorite

```js
{
  _id: ObjectId,
  userId: ObjectId,
  producerId: ObjectId,
  productId: ObjectId,
  createdAt: Date
}
```

Debe existir solo uno de `producerId` o `productId`. Un indice unico puede evitar favoritos repetidos.

---

## 6. API REST propuesta

### Producers

```text
POST   /api/producers
GET    /api/producers/:id
PATCH  /api/producers/:id
DELETE /api/producers/:id
GET    /api/producers/nearby?latitude=-26.18&longitude=-58.17&distance=10000
```

`POST /api/producers` debe recibir un perfil revisado por el vendedor y crear un perfil en estado `draft` o `published`, segun la accion elegida.

### Products

```text
POST   /api/products
GET    /api/products?producerId=:id
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/publish
POST   /api/products/:id/archive
```

El endpoint actualmente agregado en la rama es:

```text
POST /api/products
GET  /api/products
```

Debe conservarse como contrato inicial mientras se agregan `GET /:id`, `PATCH` y estados de publicacion.

### Search

```text
GET /api/search?q=impresion%203d&latitude=-26.18&longitude=-58.17&radius=10000
```

Respuesta sugerida:

```json
{
  "query": "impresion 3d",
  "results": [
    {
      "type": "product",
      "score": 0.94,
      "producer": {},
      "product": {},
      "distanceMeters": 1250
    }
  ]
}
```

La primera version puede usar texto, tags y categoria. La busqueda semantica puede agregarse despues sin cambiar la pantalla si se conserva este contrato.

### AI

```text
POST /api/ai/profile-draft
POST /api/ai/product-draft
POST /api/ai/profile-edit
```

Cada endpoint debe devolver un borrador, no persistirlo directamente.

Ejemplo de perfil:

```json
{
  "name": "Impresiones del Norte",
  "category": "Impresion 3D",
  "description": "",
  "products": ["souvenirs personalizados"],
  "locationText": "Formosa",
  "whatsappNumber": "",
  "instagram": "",
  "missingFields": ["description", "whatsappNumber"],
  "profileText": ""
}
```

### Users y favoritos

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/me
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:id
```

---

## 7. Flujo principal de la aplicacion

### Exploracion publica

```text
HomeScreen
  -> SearchBar
  -> SearchResults
  -> MapView
  -> ProducerCard
  -> ProducerProfile
  -> ProductCard
  -> WhatsApp / Instagram
```

Lista y mapa deben compartir el mismo estado de busqueda. Cambiar la consulta debe actualizar ambos, no crear dos busquedas distintas.

### Creacion de perfil

```text
ProducerEditorScreen
  -> respuestas del vendedor
  -> AI profile draft
  -> ProfilePreview
  -> edicion manual o por chat
  -> validacion
  -> POST /api/producers
  -> estado published
```

### Carga de producto

```text
ProductEditorScreen
  -> texto libre o formulario
  -> AI product draft opcional
  -> edicion manual
  -> POST /api/products
  -> producto asociado al producerId
```

---

## 8. Reglas para el asistente de IA

- No inventar redes sociales, precios, ubicaciones ni categorias.
- Usar cadena vacia si el dato no fue proporcionado.
- Devolver JSON valido y estable.
- Validar el JSON en el backend antes de enviarlo al frontend.
- Permitir edicion manual antes de publicar.
- No guardar automaticamente una respuesta de IA.
- Mantener Ollama/Gemini detras de una interfaz comun para poder cambiar de proveedor.

Para Ollama, el perfil se genera localmente. Para Gemini, la clave debe permanecer en el backend.

---

## 9. Como evitar pisarse entre integrantes

### Limites de archivos

- Integrante A: `frontend/src/screens` y `frontend/src/components`.
- Integrante B: `backend/src/modules/producers` y modelos de productores.
- Integrante C: `backend/src/modules/products`, busqueda e IA.

Si una tarea cruza limites, primero se define el contrato de API y despues cada integrante trabaja en su modulo.

### Reglas de Git

1. Cada integrante trabaja en su rama.
2. Commits pequenos y descriptivos.
3. No commitear `.env`.
4. Antes de mergear, actualizar la rama y revisar conflictos.
5. No editar el mismo archivo central si puede crearse un modulo nuevo.
6. Revisar `git diff` y `git status` antes de compartir cambios.

Commits sugeridos:

```text
feat: add producer creation endpoint
feat: add product CRUD endpoints
feat: add natural language search
feat: add editable AI profile preview
feat: add buyer favorites
```

---

## 10. Plan de implementacion por etapas

### Etapa 1: integracion actual

- Mantener el chatbot funcional.
- Separar IA de productos y perfiles.
- Definir el contrato final del perfil.
- Crear `.env.example`.

### Etapa 2: publicacion de vendedores

- Ampliar `Producer` con descripcion, redes y estado.
- Crear `POST /api/producers`.
- Crear `PATCH /api/producers/:id`.
- Permitir editar el borrador antes de publicar.

### Etapa 3: catalogo

- Completar CRUD de productos.
- Agregar formulario manual.
- Agregar carga asistida por IA.
- Asociar cada producto a un productor.

### Etapa 4: exploracion

- Reemplazar mocks por API real.
- Implementar busqueda y filtros.
- Implementar consulta geografica.
- Sincronizar lista y mapa.

### Etapa 5: compradores

- Registro y login.
- Favoritos.
- Perfil del comprador.
- Seguridad de endpoints privados.

---

## 11. Decisiones que conviene confirmar

Estas decisiones no bloquean el primer prototipo, pero deben definirse antes de cerrar la arquitectura:

1. ¿Un vendedor puede tener varios perfiles o solo uno?
2. ¿Un producto puede pertenecer a mas de un vendedor?
3. ¿La ubicacion se ingresa como localidad, direccion o coordenadas del dispositivo?
4. ¿Los compradores necesitan cuenta para contactar o solo para guardar favoritos?
5. ¿Habra moderacion antes de publicar?
6. ¿Se permitiran precios publicos o solo el estado `Consultar`?
7. ¿Se almacenaran imagenes localmente o mediante un servicio externo?
8. ¿Ollama sera obligatorio en desarrollo o existira un proveedor remoto de respaldo?
9. ¿La publicacion necesita autenticacion desde el primer prototipo?
10. ¿El alcance geografico inicial sera Formosa Capital, toda la provincia o cualquier localidad?

Mientras estas decisiones no esten cerradas, conviene usar estados `draft` y `published`, contratos pequenos y servicios reemplazables.
