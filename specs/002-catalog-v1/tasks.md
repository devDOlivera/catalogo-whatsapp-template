# Tareas de Implementación (V1)

Este documento desglosa el plan de implementación en tareas granulares, ordenadas por dependencia, verificables y listas para ser ejecutadas.

## Fase 1: Base de Datos y Modelo
- [x] **Tarea 1.1:** Crear la tabla `categories` en Supabase (campos: `id`, `name`, `created_at`).
  * **Cubre:** [RF-18]
  * **Hecho cuando:** La tabla existe en el esquema de Supabase y permite inserciones.
- [x] **Tarea 1.2:** Alterar la tabla `products` añadiendo campos V1 (`category_id` FK nullable, `is_best_seller` boolean, `is_offer` boolean, `characteristics` text).
  * **Cubre:** [RF-15, RF-18]
  * **Hecho cuando:** Los nuevos campos existen y devuelven datos correctamente a través de la API.
- [x] **Tarea 1.3:** Migrar la columna única de imagen en `products` hacia un campo de arreglo `images` (tipo `TEXT[]`). (Y migrar datos MVP a `images[0]`).
  * **Cubre:** [RF-17]
  * **Hecho cuando:** La base de datos puede guardar un array de hasta 4 strings por producto, y los productos viejos no perdieron su imagen.

## Fase 2: Estado Global y Lógica Core (Zustand & Utils)
- [x] **Tarea 2.1:** Modificar la acción `addProducto` del store de Zustand para incrementar directamente +1 y aplicar un tope máximo duro de 99 unidades.
  * **Cubre:** [RF-16]
  * **Hecho cuando:** Llamar a la acción con un producto ya existente sube su `quantity` en +1, y lanzar otro evento al llegar a 99 detiene el incremento (se puede probar mediante consola).
- [x] **Tarea 2.2:** Crear utilidad pura para cálculo de "Novedades" (Evaluación de fechas UTC < 30 días respecto al `created_at`).
  * **Cubre:** [RF-19]
  * **Hecho cuando:** Una función de test recibe un array de productos y retorna solo los activos con fecha menor a 30 días, sin importar la zona horaria del cliente.

## Fase 3: UI Backend (Panel de Administración)
- [x] **Tarea 3.1:** Crear y aplicar `LayoutAdmin` heredando la hoja de estilos global del catálogo. Integrar `LayoutHeader` con logo vía variable de entorno.
  * **Cubre:** [RF-23, RN: UI/UX Unificada]
  * **Hecho cuando:** La ruta secreta `/admin` luce visualmente con la misma paleta y tipografía del catálogo, y el logo carga desde `.env`.
- [x] **Tarea 3.2:** Añadir en `ProductEditor` el selector `select` para categorías (opcional) y los switches booleanos para Oferta y Más Vendido.
  * **Cubre:** [RF-18, RF-22]
  * **Hecho cuando:** El administrador puede guardar un producto con "Sin Categoría" y sus banderas correspondientes impactan en Supabase.
- [x] **Tarea 3.3:** Añadir en `ProductEditor` el campo de texto amplio (`textarea`) para `characteristics`.
  * **Cubre:** [RF-15, RF-22]
  * **Hecho cuando:** El texto escrito con múltiples saltos de línea se guarda en Supabase sin inyecciones de código.
- [x] **Tarea 3.4:** Construir el `ImageManager` en `ProductEditor`. Debe permitir de 1 a 4 imágenes, con validación de <5MB y formato en cliente, y permitir arrastrar para reordenar.
  * **Cubre:** [RF-17, Casos Límite: Límite excedido]
  * **Hecho cuando:** Intentar subir una quinta imagen, o una de 10MB, o eliminar la última foto restante, dispara un error visual rojo; reordenar las fotos y guardar actualiza el orden en el array `TEXT[]` de Supabase.

## Fase 4: UI Frontend (Catálogo Cliente)
- [x] **Tarea 4.1:** Crear `CatalogFilters` (componente Sticky): Input texto real-time, campos input number (Min/Máx), select Categoría, toggle Oferta.
  * **Cubre:** [RF-20]
  * **Hecho cuando:** Los controles se renderizan pegados al tope superior (sticky) y sus estados de React responden a los cambios del usuario.
- [x] **Tarea 4.2:** Integrar el filtrado acumulativo (Lógica AND) entre `CatalogFilters` y los productos mostrados, implementando el `EmptyState` (estado vacío).
  * **Cubre:** [RF-20, Casos Límite: Estado Vacío]
  * **Hecho cuando:** Si el usuario busca "Guitarra" + Oferta, solo aparecen esas. Si no hay ninguna, aparece un aviso de "No hay resultados" y un botón "Limpiar todos".
- [x] **Tarea 4.3:** Crear el componente renderizador de agrupaciones dinámicas para `ProductGrid` (Módulos: Novedades, Más Vendidos, Ofertas, Todos).
  * **Cubre:** [RF-18, RF-19, Casos Límite: Ausencia de Novedades]
  * **Hecho cuando:** El catálogo principal muestra bloques separados con títulos; si no hay ningún producto en Novedades, la sección de título "Novedades" no se renderiza.
- [x] **Tarea 4.4:** Refactorizar `ProductCard`. Modificar el evento del botón Agregar (agrega +1 silencioso o abre modal si requiere variantes). Agregar un feedback de Toast visual "¡Agregado!".
  * **Cubre:** [RF-16, RN: Experiencia Moderna]
  * **Hecho cuando:** Hacer clic sobre "Agregar" en una remera talla única muestra un micro-rebote/toast. Hacer clic en una remera multitalle dispara un evento modal.
- [x] **Tarea 4.5:** Crear componente `ProductModal`. Mostrar carrusel (lazy-load para índices 1,2,3), mostrar `characteristics` (`white-space: pre-wrap`), y pre-seleccionar variante inicial en select.
  * **Cubre:** [RF-15, RF-16, RN: Rendimiento Visual]
  * **Hecho cuando:** Al hacer clic en un producto, se abre un modal de forma suave (animación), la segunda y tercera imagen se descargan recién en ese momento (verificable en pestaña Red), y el botón "Agregar" funciona instantáneamente.
- [x] **Tarea 4.6:** Convertir el carrito actual en un componente `CartDrawer` (panel lateral). Implementar listeners de cierre (Escape, Clic en Overlay, Botón X).
  * **Cubre:** [RF-21]
  * **Hecho cuando:** Al abrir el carrito, este entra deslizando desde un lateral; presionar la tecla Esc lo cierra animadamente devolviendo el foco al catálogo general.

## Fase 5: Integración y Casos Límite Finales
- [x] **Tarea 5.1:** Validar el comportamiento JIT (Just In Time) dentro del `CartDrawer` vs Supabase.
  * **Cubre:** [Casos Límite: Single Source vs Panel Abierto]
  * **Hecho cuando:** Teniendo el panel lateral abierto, si un admin sube el precio manualmente en DB, y el cliente presiona "Generar Pedido", se cancela el envío, los precios cambian frente al usuario y se lanza la alerta JIT del MVP.
