# Plan Técnico: Catálogo Web con WhatsApp

## 1. Esquema de Base de Datos (Supabase / PostgreSQL)

Para garantizar la "Única Fuente de Verdad" y cumplir con el diseño de variantes e imágenes obligatorias, la base de datos relacional se estructurará con las siguientes tablas.

### Tablas y Relaciones

**1. Tabla `categories`**
*(Preparada para la arquitectura futura, aunque su UI esté fuera de alcance en el MVP).*

* `id`: `uuid` (Primary Key, default: `uuid_generate_v4()`)
* `name`: `text` (Not null)
* `created_at`: `timestamp with time zone` (default: `now()`)

**2. Tabla `products`**

* `id`: `uuid` (Primary Key, default: `uuid_generate_v4()`)
* `title`: `text` (Not null)
* `description`: `text`
* `image_url`: `text` (Not null - Cumple con RF-10)
* `category_id`: `uuid` (Foreign Key -> `categories.id`, nullable)
* `is_active`: `boolean` (default: `true` - Cumple con RF-13)
* `created_at`: `timestamp with time zone` (default: `now()`)

**3. Tabla `product_variants`**

* `id`: `uuid` (Primary Key, default: `uuid_generate_v4()`)
* `product_id`: `uuid` (Foreign Key -> `products.id` `ON DELETE CASCADE` - Cumple con RF-12)
* `name`: `text` (Not null, default: "Única" - Cumple con RF-11)
* `price`: `numeric` (Not null)
* `is_active`: `boolean` (default: `true` - Cumple con RF-14)

### Políticas de Seguridad de Filas (Row Level Security - RLS)

* **Políticas de Lectura (SELECT):**

  * Públicas (Anónimas): Permitidas solo si `is_active = true` (en `products` y `product_variants`).

  * Autenticadas (Admin): Lectura total sin restricciones.

* **Políticas de Escritura (INSERT, UPDATE, DELETE):**

  * Restringidas estrictamente a usuarios con sesión activa (Autenticados vía Supabase Auth).

---

## 2. Variables de Entorno

Basado en el enfoque Single-Tenant (Plantilla) definido en la Constitución y el RF-01 de la especificación, el archivo `.env.local` requerirá:

**Configuración de Supabase:**

* `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública para peticiones del cliente.

**Configuración del Comercio (Plantilla):**

* `NEXT_PUBLIC_COMMERCE_NAME`: Nombre visible del comercio (Ej. "Mi Tienda").
* `NEXT_PUBLIC_COMMERCE_WHATSAPP`: Número de destino con código de país sin símbolos (Ej. "5491123456789").
* `NEXT_PUBLIC_COMMERCE_CURRENCY`: Símbolo de la moneda local (Ej. "$", "€", "PEN").

---

## 3. Estructura de Directorios (Next.js App Router)

Se utilizarán "Route Groups" `(client)` y `(admin)` para separar los layouts y lógicas de middleware de autenticación.

```text
/
├── app/
│   ├── (client)/
│   │   ├── layout.tsx         # Navbar con carrito, Footer público
│   │   ├── page.tsx           # Catálogo principal (Lista de productos)
│   │   ├── cart/
│   │   │   └── page.tsx       # Vista detallada del carrito y checkout
│   ├── (admin)/
│   │   ├── layout.tsx         # Protección de rutas y Sidebar de admin
│   │   ├── login/
│   │   │   └── page.tsx       # Supabase Auth
│   │   ├── dashboard/
│   │   │   └── page.tsx       # CRUD de Productos y Variantes
│   ├── api/                   # (Opcional) Route handlers si son necesarios
├── components/
│   ├── ui/                    # Componentes genéricos (Botones, Inputs, Modales)
│   ├── client/                # Componentes del cliente (ProductCard, CartDrawer)
│   ├── admin/                 # Componentes administrativos (ProductForm)
├── lib/
│   └── supabase/
│       └── client.ts          # Inicialización de Supabase
├── store/
│   └── cartStore.ts           # Configuración de Zustand
└── public/
```

---

## 4. Gestión del Estado (Zustand)

El store del carrito se alojará en `store/cartStore.ts` y utilizará el middleware `persist` de Zustand para guardar los datos en el `localStorage` (RF-05).

**Estructura del Estado (`CartItem`):**

```typescript
interface CartItem {
  variantId: string;
  productId: string;
  name: string; // Nombre del producto + Variante
  price: number;
  quantity: number;
  imageUrl: string;
}
```

**Métodos del Store:**

* `addItem(item)`: Añade un nuevo ítem o incrementa la cantidad si ya existe, respetando el límite máximo (RF-04: max 99 unidades).
* `updateQuantity(variantId, amount)`: Ajusta la cantidad exacta. Si `amount <= 0`, elimina el ítem automáticamente.
* `removeItem(variantId)`: Elimina la variante específica del carrito de forma manual.
* `syncWithDB(supabaseClient)`: **Validación Just-in-Time (RF-06).** Se ejecuta al montar la ruta `/cart`. Obtiene los IDs del carrito local, consulta la tabla `product_variants` en Supabase y ajusta silenciosamente los precios, o elimina los ítems si `is_active` es `false`.

---

## 5. Flujo de Generación de Enlace WhatsApp

Para cumplir con el RF-08 y asegurar compatibilidad tanto en móvil como en escritorio, se evitará `wa.me` a favor de la API directa de enrutamiento web.

**Lógica de construcción de URL:**

1. **Base URL:** `https://api.whatsapp.com/send`
2. **Parámetro `phone`:** Cargado directamente desde `process.env.NEXT_PUBLIC_COMMERCE_WHATSAPP`.
3. **Parámetro `text`:** El carrito se itera para generar un string en formato texto plano y luego se codifica utilizando la función nativa `encodeURIComponent()` de JavaScript.

**Ejemplo de formato de texto plano antes de codificar:**

```text
¡Hola! Me gustaría realizar el siguiente pedido:

* 2x Camiseta Básica (Roja) - $20.00
* 1x Pantalón de Lino (Única) - $35.00

*Total estimado: $75.00*

Por favor, confírmame la disponibilidad.
```
