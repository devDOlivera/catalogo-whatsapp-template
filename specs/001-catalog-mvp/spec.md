# Especificaciones del Sistema (Spec): Catálogo Web con WhatsApp

## 1. Introducción

Este documento detalla los requisitos funcionales y los límites operativos para el Catálogo Web. Se utiliza la sintaxis EARS para definir el comportamiento esperado del sistema bajo distintas condiciones, asegurando que el desarrollo cumpla con el "Qué" y el "Por qué" establecidos en la Constitución.

## 2. Requisitos Funcionales (EARS)

### 2.1 Configuración Global del Sistema

* **\[RF-01\] Inyección de Datos del Comercio:** CUANDO el sistema se inicialice, la aplicación DEBERÁ cargar los metadatos del comercio (número de WhatsApp, nombre del comercio, moneda local) desde las variables de entorno, PARA QUE el código fuente pueda ser clonado y reutilizado por distintos clientes sin modificaciones.

### 2.2 Vista del Cliente (Catálogo y Carrito)

* **\[RF-02\] Exploración:** CUANDO el usuario ingrese a la página principal, el sistema DEBERÁ mostrar una lista de todos los productos cuyo estado sea "activo", PARA QUE el usuario pueda explorar la oferta disponible.

* **\[RF-03\] Detalle y Variantes:** MIENTRAS visualiza un producto, CUANDO este posea múltiples variantes (ej. colores), el sistema DEBERÁ mostrar solo las "activas"; o CUANDO sea un producto simple, el sistema DEBERÁ asignarle internamente la variante por defecto ("Única") y ocultar el selector, PARA QUE la experiencia de compra sea fluida y sin pasos innecesarios.

* **\[RF-04\] Gestión Integral del Carrito:** MIENTRAS interactúa con un producto, CUANDO el usuario agregue, reduzca o elimine ítems, el sistema DEBERÁ actualizar el carrito respetando un límite máximo de 99 unidades por variante y eliminando automáticamente del registro aquellos ítems cuya cantidad llegue a cero, PARA QUE el cliente tenga control total sobre su pedido y se eviten desbordamientos visuales.

* **\[RF-05\] Persistencia del Estado:** CUANDO existan ítems en el carrito, el sistema DEBERÁ persistir esta información en el almacenamiento local del dispositivo, PARA QUE el usuario no pierda su selección si recarga o cierra accidentalmente la pestaña.

* **\[RF-06\] Validación de Integridad (Just-in-Time):** MIENTRAS el usuario abra el carrito o intente ir al checkout, el sistema DEBERÁ validar silenciosamente en la base de datos el estado y precio actual de los ítems almacenados localmente, y actualizar/notificar en caso de discrepancias, PARA QUE se respete la única fuente de verdad y se eviten envíos de pedidos con precios desactualizados o stock agotado.

* **\[RF-07\] Resumen de Compra:** MIENTRAS existan ítems válidos en el carrito, el sistema DEBERÁ calcular y mostrar el subtotal por ítem y el costo total estimado, PARA QUE el cliente tenga total transparencia del costo.

* **\[RF-08\] Redirección a WhatsApp:** CUANDO el usuario haga clic en finalizar compra (botón que DEBERÁ permanecer deshabilitado si el carrito está vacío), el sistema DEBERÁ generar el mensaje preformateado y redirigir mediante la URL oficial `https://api.whatsapp.com/send`, PARA QUE el cliente concrete la compra minimizando posibles errores de enrutamiento en computadoras de escritorio.

### 2.3 Vista del Administrador (Gestión)

* **\[RF-09\] Autenticación:** CUANDO un administrador intente acceder a la ruta del panel de control, el sistema DEBERÁ solicitar credenciales de acceso válidas, PARA QUE solo personal autorizado pueda modificar el catálogo.

* **\[RF-10\] Gestión de Productos e Imágenes Obligatorias:** MIENTRAS el administrador cree o edite productos generales, el sistema DEBERÁ exigir como campo obligatorio la carga de al menos una (1) imagen representativa, PARA QUE se garantice una presentación visual consistente y se elimine la necesidad de placeholders por defecto en la UI.

* **\[RF-11\] Gestión de Variantes y Precios:** MIENTRAS edita o crea un producto, el sistema DEBERÁ asignar una variante "Única" si es un artículo simple, o permitir añadir múltiples opciones con precios independientes, PARA QUE el negocio ofrezca un portafolio versátil.

* **\[RF-12\] Eliminación en Cascada:** CUANDO el administrador elimine un producto general desde el panel, el sistema DEBERÁ eliminar simultáneamente (mediante ON DELETE CASCADE en base de datos) todas sus variantes asociadas, PARA QUE no existan datos huérfanos que consuman recursos o generen conflictos.

* **\[RF-13\] Control de Disponibilidad (Producto):** MIENTRAS el administrador esté en el listado de productos, CUANDO haga clic en el botón de disponibilidad de un producto, el sistema DEBERÁ cambiar su estado (activo/inactivo) y ocultarlo o mostrarlo inmediatamente en la vista del cliente, PARA QUE se eviten pedidos de productos agotados o fuera de temporada.

* **\[RF-14\] Control de Disponibilidad (Variante):** MIENTRAS el administrador gestione un producto específico, el sistema DEBERÁ permitir cambiar el estado de disponibilidad (activo/inactivo) de cada variante de forma individual, PARA QUE se puedan ocultar tamaños o colores agotados sin ocultar el producto entero.

## 3. Fuera de Alcance (Out of Scope)

Los siguientes elementos NO forman parte de esta iteración para garantizar la velocidad de entrega del MVP:

* Interfaz de usuario para filtrado y búsqueda por categorías (la estructura relacional se preparará en la base de datos para la versión 2.0).
* Arquitectura Multi-tenant SaaS (una sola base de datos centralizada para varios comercios).
* Captura de datos personales (nombre, dirección) mediante formularios web antes de redirigir a WhatsApp.
* Asignación de imágenes individuales y específicas para cada variante del producto.
* Control estricto de inventario numérico (descuento automático de stock tras enviar el mensaje).
* Pagos en línea (tarjetas, billeteras virtuales) integrados en la web.

## 4. Criterios de Finalización (Done Criteria)

El proyecto se considerará completo en su fase de MVP cuando:

1. Un cliente pueda navegar un catálogo visual, gestionar un carrito con topes de cantidad, ser validado en tiempo real contra la base de datos (Just-in-Time) y ser redirigido exitosamente vía API de WhatsApp.
2. La información del comercio objetivo (Nombre, WhatsApp, Moneda) provenga íntegramente de variables de entorno.
3. Un administrador pueda autenticarse, crear productos (con imagen obligatoria), definir variantes y controlar la visibilidad con eliminación en cascada.
4. El sistema completo esté desplegado en Vercel y conectado correctamente a Supabase.
