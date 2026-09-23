# Constitución del Proyecto: Catálogo Web con Integración a WhatsApp

## 1. Propósito

Desarrollar un catálogo web rápido, moderno y accesible que permita a los usuarios explorar productos, agregarlos a una lista de selección (carrito) y finalizar el flujo de compra enviando un mensaje preformateado directamente al WhatsApp del vendedor para concretar la transacción.

## 2. Pila Tecnológica (Tech Stack)

- **Frontend / Framework:** Next.js (App Router) con React. Se utilizará para renderizar el catálogo y optimizar el SEO.
- **Gestión de Estado:** Zustand. Se empleará para manejar el estado global del lado del cliente, específicamente la lógica del carrito de compras, por su ligereza y simplicidad frente a otras soluciones.
- **Backend / Base de Datos / Storage:** Supabase. Actuará como base de datos (PostgreSQL) para almacenar la información de los productos, proveerá el almacenamiento (Storage) para las imágenes del catálogo y gestionará la autenticación (Auth) para el panel de administración.
- **Despliegue e Infraestructura:** Vercel. Proporcionará un despliegue continuo integrado con el repositorio, garantizando tiempos de carga óptimos a través de su red de distribución (Edge Network).

## 3. Principios de Ingeniería y Diseño

- **Arquitectura de Plantilla (Single-Tenant):** El sistema está diseñado para ser clonado e instanciado por cada cliente. Los datos específicos del comercio (nombre, número de WhatsApp de destino, moneda) se inyectarán mediante variables de entorno locales, facilitando su replicabilidad.
- **Fricción Cero en la Compra:** El flujo desde la selección del producto hasta el clic en "Enviar por WhatsApp" debe requerir la menor cantidad de pasos posibles. No se exigirá registro a los clientes para armar su pedido.
- **Rendimiento Visual (Performance-First):** Al ser un catálogo, la carga de imágenes y la navegación deben ser instantáneas. Se priorizará la optimización de imágenes nativa de Next.js.
- **Single Source of Truth (Única Fuente de Verdad):** Supabase será la única fuente de datos. Cualquier actualización en los precios o detalles de los productos en la base de datos debe reflejarse inmediatamente en el frontend.
- **Diseño Responsivo (Mobile-First):** Dado que la conversión final ocurre en WhatsApp, se asume que la inmensa mayoría de los usuarios navegarán desde dispositivos móviles. La UI debe estar optimizada para este formato.

## 4. Casos de Uso Principales (Core Goals)

- **Vista de Cliente:**
  1. Visualizar una lista o grilla de productos activos con título, precio, imagen y descripción breve.
  2. Filtrar o buscar productos por categorías (opcional en fase 1, pero preparado en arquitectura).
  3. Agregar, quitar y modificar cantidades de productos en el carrito temporal (gestionado vía Zustand).
  4. Generar un enlace dinámico de WhatsApp (`wa.me`) que contenga el resumen exacto del pedido (productos, cantidades, total estimado).
- **Vista de Administrador:**
  1. Autenticarse de forma segura.
  2. Realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre el catálogo de productos.
  3. Subir y gestionar las imágenes de los productos.
  4. Gestionar la disponibilidad del producto (activar/desactivar visibilidad en el catálogo) de manera rápida sin necesidad de eliminar el registro de la base de datos.

## 5. No-Objetivos (Non-Goals)

*Para mantener el alcance del proyecto enfocado, las siguientes características están explícitamente fuera del desarrollo actual:*

- **Arquitectura Multi-tenant (SaaS centralizado):** Cada cliente tendrá su propia instancia de código, variables de entorno y base de datos independiente. No se manejarán múltiples comercios en una misma base de datos por ahora.

- Integración de pasarelas de pago nativas (Stripe, MercadoPago, PayPal, etc.). Toda transacción financiera ocurre fuera de la plataforma.

- Gestión de inventario automatizada o control de stock numérico estricto (la disponibilidad se maneja solo como "visible/oculto" y la confirmación final ocurre en WhatsApp).

- Perfiles de usuario o historial de compras para los clientes finales.
