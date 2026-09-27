# Plan de Implementación Técnico (V1)

Este documento detalla el diseño técnico para la Versión 1.0 del Catálogo Web, basado en los lineamientos de `constitution.md` y `spec.md`.

## 1. Módulos y Arquitectura (Frontend y Backend)

### Módulo Catálogo (Cliente)
*   **`ProductGrid`:** Componente principal que iterará la lista de productos. Gestionará dinámicamente las secciones (Más vendidos, Ofertas, Novedades). *(Cubre RF-18, RF-19)*
*   **`CatalogFilters`:** Barra superior pegajosa (sticky) con input de texto para búsqueda en tiempo real, inputs numéricos simples para Mín/Máx de precios, selector de categorías y el toggle de Ofertas. *(Cubre RF-20)*
*   **`ProductCard`:** Representación individual del producto. Mostrará solo la imagen de portada y tendrá el botón "Agregar" que despachará directamente al store de Zustand (+1) si no hay variantes. *(Cubre RF-16, RF-20)*
*   **`ProductModal`:** Modal superpuesto. Mostrará la descripción en texto plano (`white-space: pre-wrap`), un selector de variantes pre-seleccionado, y un carrusel. Instanciará componentes `next/image` con carga diferida para las imágenes adicionales. *(Cubre RF-15, RF-16)*
*   **`CartDrawer`:** Panel lateral manejado mediante estado global (abierto/cerrado). Escuchará eventos de teclado (Escape) y clics en el overlay para cerrarse. *(Cubre RF-21)*

### Módulo Panel (Administrador)
*   **`ProductEditor`:** Formulario central unificado con el mismo diseño del catálogo (mismos componentes UI). Incluirá validación frontend para archivos (<5MB, JPG/PNG/WEBP), un manejador de orden visual (drag & drop o botones de flechas) para un arreglo de imágenes, y selectores de etiquetas. *(Cubre RF-17, RF-22)*

### Módulo Core Compartido
*   **`LayoutHeader`:** Componente que leerá la variable de entorno `NEXT_PUBLIC_STORE_LOGO_URL` para renderizar la marca en el encabezado. *(Cubre RF-23)*

## 2. Modelo de Datos (Supabase)

Para soportar las nuevas características, se extenderá el esquema actual.

*   **Tabla `categories` (NUEVA):**
    *   `id` (UUID, PK)
    *   `name` (Text)
    *   `created_at` (TimestampZ)

*   **Tabla `products` (MODIFICACIONES):**
    *   Añadir `category_id` (UUID, Foreign Key hacia `categories`, Nullable). *(Cubre RF-18)*
    *   Añadir `is_best_seller` (Boolean, default false). *(Cubre RF-18)*
    *   Añadir `is_offer` (Boolean, default false). *(Cubre RF-18)*
    *   Añadir `characteristics` (Text, Nullable). *(Cubre RF-15)*
    *   **Cambio en imágenes:** Convertir el campo actual de imagen única a un arreglo de textos: `images` (TEXT[]). El tamaño máximo por aplicación será 4. *(Cubre RF-17)*

## 3. Decisiones Técnicas Justificadas

1.  **Manejo de Múltiples Imágenes (Array vs. Tabla Relacional)**
    *   *Decisión:* Guardar las URLs de las imágenes como un arreglo (`TEXT[]`) en la propia tabla `products`. *(Cubre RF-17)*
    *   *Justificación:* Dado que hay un límite estricto y bajo (4 imágenes máximo), guardarlas en la misma tabla elimina la necesidad de hacer un `JOIN` relacional. Esto maximiza la velocidad de las consultas a la base de datos, alineado 100% con el principio "Performance-First".
    *   *Alternativa descartada:* Crear una tabla separada `product_images` con relación de uno a muchos. Se descartó por añadir complejidad innecesaria y sobrecarga en la lectura del catálogo.
2.  **Filtrado y Búsqueda (Client-Side vs. Server-Side)**
    *   *Decisión:* El servidor (Supabase) enviará la lista completa de productos activos al cliente. La barra de búsqueda y los filtros se ejecutarán mediante Javascript (React/Zustand) directamente en el navegador del usuario. *(Cubre RF-20)*
    *   *Justificación:* Al ser un catálogo ligero para WhatsApp, tener todos los datos en memoria permite que el filtrado y la búsqueda sean verdaderamente instantáneos ("fricción cero"), sin micro-retrasos por peticiones de red al servidor.
    *   *Alternativa descartada:* Realizar búsquedas SQL en el servidor (ej. Supabase text search). Se descartó porque causaría latencia al teclear en dispositivos móviles.
3.  **Carga de Imágenes del Modal (Lazy Load Extremo)**
    *   *Decisión:* El componente `ProductCard` solo descargará `images[0]`. `ProductModal` descargará `images[1]`, `[2]` y `[3]` únicamente al abrirse. *(Cubre RF-15, Casos Límite)*
    *   *Justificación:* Protege agresivamente el ancho de banda en redes móviles, garantizando que agregar 3 fotos extra por producto no ralentice la carga inicial del catálogo.
    *   *Alternativa descartada:* Precargar todas las imágenes del carrusel oculto en la grilla. Se descartó por violar la regla de carga instantánea en móviles.
4.  **Validación de Carrito (JIT vs WebSockets)**
    *   *Decisión:* Mantener la validación silenciosa (Just-in-Time) que ocurre justo antes de abrir WhatsApp. *(Cubre Casos Límite)*
    *   *Justificación:* Cumple con la regla de Single Source of Truth sin el costo de mantener suscripciones en tiempo real abiertas en el teléfono del cliente (lo cual drena batería y datos).
    *   *Alternativa descartada:* Suscripciones WebSockets (Supabase Realtime) al estado de los productos. Se descartó por ser costoso (overkill) para el problema a resolver.

## 4. Estrategia de Pruebas (Testing)

Se implementarán pruebas para asegurar la solidez de las reglas de negocio, sin escribir código innecesario.

### Pruebas Unitarias (Lógica Aislada)
*   **Filtros Acumulativos:** Verificar que la función de filtrado devuelva los arrays correctos cuando se le pasen múltiples parámetros (ej. Categoría X + Precio < 100 + Búsqueda "azul"). *(Cubre RF-20)*
*   **Store del Carrito:** Probar que la función `addProducto` incremente correctamente en +1, asigne la variante por defecto y lance un error capturable si llega al límite de 99 unidades. *(Cubre RF-16)*
*   **Cálculo UTC de Novedades:** Validar la función que determina si un producto es "Novedad" enviándole fechas simuladas, asegurando que el límite de 30 días sea matemáticamente estricto y use UTC. *(Cubre RF-19)*

### Pruebas de Componentes (UI)
*   **CartDrawer:** Montar el componente y simular el evento de tecla "Escape" y el clic en el fondo oscuro (overlay), verificando que la propiedad `isOpen` cambie a falso. *(Cubre RF-21)*
*   **Empty State:** Montar la grilla de productos con un array vacío y verificar que se renderice el mensaje de advertencia y el botón de "Limpiar filtros". *(Cubre RF-20, Casos Límite)*

### Pruebas E2E (Integración Completa)
*   **Flujo del Administrador:** Simular la subida de un producto sin imágenes (debe fallar), luego con 5 imágenes (debe fallar la validación frontend de máx 4) y finalmente la creación exitosa con 4 imágenes. *(Cubre RF-17)*
*   **Flujo del Cliente (Compra Ágil):** Simular una búsqueda, hacer clic en la tarjeta de un producto con variantes (abre modal), seleccionar la variante, presionar "Agregar", abrir el panel lateral y presionar checkout. *(Cubre RF-15, RF-21)*
