# Catálogo Web con Integración a WhatsApp (Plantilla Single-Tenant)

Un catálogo web rápido, moderno y accesible desarrollado para negocios que buscan digitalizar su oferta de productos con fricción cero. Permite a los usuarios explorar productos, armar un pedido y enviarlo directamente como un mensaje preformateado al WhatsApp del vendedor.

Este proyecto está diseñado bajo una arquitectura de **Plantilla (Single-Tenant)**, lo que significa que cada comercio debe tener su propia instancia de código, variables de entorno y base de datos independiente.

## 🚀 Tecnologías Principales

- **Framework:** [Next.js (App Router)](https://nextjs.org/) con React.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/).
- **Estado Global:** [Zustand](https://zustand-demo.pmnd.rs/) (con middleware de persistencia en `localStorage`).
- **Base de Datos, Auth y Storage:** [Supabase](https://supabase.com/) (PostgreSQL).
- **Despliegue Recomendado:** [Vercel](https://vercel.com/).

## ✨ Características del MVP

- **Cero Fricciones:** No requiere registro de usuarios para armar un carrito.
- **Validación Just-in-Time (JIT):** Sincronización silenciosa del carrito local contra la base de datos para asegurar precios actualizados y disponibilidad antes de enviar el pedido.
- **Gestión de Variantes:** Soporte nativo para productos simples (variante "Única") o productos con múltiples opciones (talles, colores).
- **Panel de Administración Protegido:** Operaciones CRUD completas con subida de imágenes obligatoria y toggles rápidos de disponibilidad.

---

## ⚙️ Configuración e Instalación

### 1. Clonar e Instalar Dependencias

```bash
git clone <tu-repositorio>
cd catalogo-web-whatsapp
npm install
```

### 2. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y completa las siguientes variables basándote en la información del comercio y tu proyecto de Supabase:

```env
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-id-de-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica

# Configuración del Comercio
NEXT_PUBLIC_COMMERCE_NAME="Nombre de la Tienda"
NEXT_PUBLIC_COMMERCE_WHATSAPP="5491123456789" # Sin símbolos (ej: + o espacios)
NEXT_PUBLIC_COMMERCE_CURRENCY="$" # Símbolo de la moneda local
```

### 3. Configuración de Base de Datos (Supabase)

Debes ejecutar el siguiente script SQL en el editor SQL de tu panel de Supabase para crear las tablas necesarias:

```sql
-- Crear tabla de Categorías (Preparación V2.0)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Variantes (Eliminación en cascada activada)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Única',
  price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);
```

**Políticas RLS y Storage:**
1. Habilita **Row Level Security (RLS)** en ambas tablas (`products` y `product_variants`).
2. Crea una política para permitir **LECTURA PÚBLICA** (`SELECT`) a usuarios anónimos *solo si* `is_active = true`.
3. Permite todas las operaciones (`ALL`) únicamente a usuarios **autenticados**.
4. Crea un bucket público en Supabase Storage llamado exactamente `catalog-images` para almacenar las fotos de los productos.

### 4. Entorno de Desarrollo

Inicia el servidor local de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

- **Vista Pública:** `http://localhost:3000`
- **Panel de Admin:** `http://localhost:3000/login`

## 📦 Despliegue en Vercel

1. Sube tu repositorio a GitHub.
2. Importa el proyecto desde el dashboard de Vercel.
3. Asegúrate de cargar todas las variables de entorno (`.env.local`) en la configuración de entorno de Vercel.
4. Despliega la aplicación.