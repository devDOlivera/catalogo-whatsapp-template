# Listado de Tareas (Control de Construcción)

## Fase 1: Configuración Base e Infraestructura (Supabase)

- [x] **1. Inicializar Proyecto Next.js:** Crear la aplicación Next.js (App Router) e instalar TailwindCSS y dependencias base (Lucide Icons, etc.).
  - *RF cubierto:* Fundacional.
  - *Hecho cuando:* El comando `npm run dev` carga la página por defecto en localhost.
- [x] **2. Configurar Variables de Entorno:** Crear el archivo `.env.local` y declarar las variables de Supabase y las del comercio (nombre, WhatsApp, moneda).
  - *RF cubierto:* RF-01.
  - *Hecho cuando:* Un console.log de `process.env.NEXT_PUBLIC_COMMERCE_NAME` imprime el valor correctamente.
- [x] **3. Crear Tablas SQL en Supabase:** Ejecutar script para crear tablas `categories`, `products` y `product_variants` con las relaciones correctas (Foreign Keys).
  - *RF cubierto:* RF-11, RF-12.
  - *Hecho cuando:* Las tablas son visibles en el dashboard de Supabase con `ON DELETE CASCADE` en `product_variants`.
- [x] **4. Configurar RLS y Storage:** Crear el bucket `catalog-images` (público) y aplicar políticas de seguridad (RLS) para permitir lectura pública de productos activos.
  - *RF cubierto:* RF-09, RF-10.
  - *Hecho cuando:* Se puede acceder por URL pública a una imagen de prueba subida al bucket, pero no se pueden hacer inserts anónimos.

## Fase 2: Gestión de Estado (Zustand)

- [x] **5. Configurar Zustand Store:** Crear `store/cartStore.ts` integrando el middleware `persist`.
  - *RF cubierto:* RF-05.
  - *Hecho cuando:* El estado inicial se guarda en el `localStorage` del navegador automáticamente al cargar.
- [x] **6. Implementar mutaciones de Carrito:** Programar `addItem`, `updateQuantity` y `removeItem` dentro de Zustand.
  - *RF cubierto:* RF-04.
  - *Hecho cuando:* El método respeta el tope máximo de 99 unidades y borra el ítem si la cantidad es 0.
- [x] **7. Validar Integridad Just-in-Time:** Crear el método `syncWithDB` en Zustand que consulte a Supabase y actualice los precios del estado local.
  - *RF cubierto:* RF-06.
  - *Hecho cuando:* Modificar un precio directo en SQL Supabase hace que el carrito local se actualice al ejecutar la función.

## Fase 3: Panel de Administración

- [ ] **8. Configurar Auth de Supabase:** Crear `(admin)/login/page.tsx` con formulario de email y contraseña.
  - *RF cubierto:* RF-09.
  - *Hecho cuando:* Ingresar credenciales correctas devuelve un token JWT en la sesión.
- [ ] **9. Proteger Rutas Admin:** Crear `(admin)/layout.tsx` con middleware o validación on-mount para redirigir si no hay sesión.
  - *RF cubierto:* RF-09.
  - *Hecho cuando:* Intentar entrar a `/dashboard` sin login redirige forzosamente a `/login`.
- [ ] **10. UI de Dashboard (Listado):** Crear la vista de `/dashboard` que renderice una tabla con todos los productos (ignorando su estado `is_active`).
  - *RF cubierto:* Fundacional.
  - *Hecho cuando:* La tabla muestra datos mockeados o reales de la tabla `products`.
- [ ] **11. Crear Formulario de Producto (Imagen Obligatoria):** Implementar carga de imagen hacia Supabase Storage y guardar el registro `product`.
  - *RF cubierto:* RF-10.
  - *Hecho cuando:* Enviar el formulario sin imagen tira error, y enviarlo completo guarda el archivo y el registro DB.
- [ ] **12. Lógica de Variante "Única":** Modificar el submit del formulario anterior para que, por defecto, inserte un registro en `product_variants` llamado "Única" con su precio.
  - *RF cubierto:* RF-11.
  - *Hecho cuando:* Al crear un producto simple, aparecen 2 registros en la DB (1 en products, 1 en variants).
- [ ] **13. Formulario Multi-Variante:** Añadir UI dinámica para agregar múltiples variantes y precios al editar/crear un producto.
  - *RF cubierto:* RF-11.
  - *Hecho cuando:* Se pueden agregar "N" filas de variantes antes de guardar en base de datos.
- [ ] **14. Toggles de Disponibilidad:** Añadir switches en la tabla/formulario para actualizar la columna `is_active` de productos y variantes.
  - *RF cubierto:* RF-13, RF-14.
  - *Hecho cuando:* Hacer click en el switch hace un UPDATE directo en Supabase.
- [ ] **15. Eliminación de Producto:** Añadir botón de borrar que dispare un DELETE al registro de `products`.
  - *RF cubierto:* RF-12.
  - *Hecho cuando:* Eliminar el producto destruye sus variantes vinculadas automáticamente por la base de datos.

## Fase 4: Vista del Cliente (Catálogo)

- [ ] **16. Layout y Navbar del Cliente:** Crear `(client)/layout.tsx` que lea el nombre del comercio del `.env` y consuma el total del carrito de Zustand.
  - *RF cubierto:* RF-01, RF-07.
  - *Hecho cuando:* El header dice el nombre de tu comercio y el ícono del carrito muestra un número `0`.
- [ ] **17. Grilla de Productos:** Programar el fetch en `(client)/page.tsx` para obtener solo productos con `is_active=true` y sus variantes `is_active=true`.
  - *RF cubierto:* RF-02.
  - *Hecho cuando:* Apagar un producto desde admin lo hace desaparecer instantáneamente al recargar el cliente.
- [ ] **18. UI Tarjeta de Producto:** Crear el componente `ProductCard` y su lógica.
  - *RF cubierto:* RF-03.
  - *Hecho cuando:* Productos simples muestran botón "Agregar". Productos con variantes muestran un `select` antes de permitir agregar.

## Fase 5: Carrito y Checkout

- [ ] **19. Interfaz de Carrito:** Crear vista/drawer para listar ítems. Incluir botones (+/-) para modificar cantidades que llamen a las mutaciones Zustand.
  - *RF cubierto:* RF-04.
  - *Hecho cuando:* Hacer click en "+" suma al contador local y al localStorage de forma instantánea.
- [ ] **20. Subtotales y Bloqueo de Vacío:** Implementar el cálculo del total basado en la moneda del env, y deshabilitar el botón principal si `cart.length === 0`.
  - *RF cubierto:* RF-01, RF-07, RF-08.
  - *Hecho cuando:* Con carrito vacío el botón es gris/no-clickeable. Al tener items, se muestra el total formateado.
- [ ] **21. Ejecución Just-in-Time:** Conectar la función `syncWithDB` de Zustand para que se ejecute al abrir el carrito.
  - *RF cubierto:* RF-06.
  - *Hecho cuando:* Un console.log confirma que se validaron los precios en background al entrar.
- [ ] **22. Checkout WhatsApp:** Crear la función que toma el carrito, formatea el string, lo codifica con `encodeURIComponent` y redirige a la API de WhatsApp.
  - *RF cubierto:* RF-08.
  - *Hecho cuando:* Dar click en el botón abre una pestaña nueva hacia `api.whatsapp.com/send...` con el texto completo.

## Fase 6: Despliegue

- [ ] **23. Despliegue en Vercel:** Subir repositorio a GitHub, conectar a Vercel y cargar variables de entorno.
  - *RF cubierto:* Criterio de Finalización.
  - *Hecho cuando:* La aplicación es navegable y plenamente funcional en la URL de producción.
