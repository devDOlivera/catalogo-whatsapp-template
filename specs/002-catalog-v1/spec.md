# Especificación de la Versión 1.0 (V1): Catálogo Web con WhatsApp

## 1. Contexto y Objetivo

El Producto Mínimo Viable (MVP) del catálogo ha sido completado y validado con éxito. El objetivo de esta nueva iteración (V1) es enriquecer la experiencia de usuario y dotar al administrador de mejores herramientas para la gestión de su negocio. Se busca mejorar la presentación de los productos (ventana de detalles, múltiples imágenes), optimizar la navegación del cliente (panel lateral para el carrito, búsqueda, filtros, categorías) y unificar visualmente toda la plataforma (heredando el diseño del catálogo hacia el panel de administración, sumando animaciones modernas e identidad de marca), todo ello manteniendo la premisa original de "fricción cero".

## 2. Usuarios

*   **Cliente Final:** Navega el catálogo, busca y filtra productos, visualiza detalles, interactúa con el carrito lateral y finaliza su pedido vía WhatsApp.
*   **Administrador:** Accede al panel de control unificado, gestiona productos (crea, edita, categoriza), reordena imágenes y destaca artículos.

## 3. Historias de Usuario

*   Como cliente, quiero ver una ventana con detalles (características) y múltiples fotos del producto para tomar una mejor decisión de compra.
*   Como cliente, quiero buscar productos por nombre y filtrarlos por categoría, precio y ofertas para encontrar rápidamente lo que busco.
*   Como cliente, quiero que el carrito se abra como un panel lateral para no perder el contexto de mi navegación.
*   Como cliente, quiero ver en todo momento la identidad (logotipo) del comercio.
*   Como administrador, quiero editar los productos existentes y gestionar hasta 4 imágenes por artículo (pudiendo elegir la portada).
*   Como administrador, quiero asignar una categoría principal y marcas de "Más vendido" u "Oferta" para destacar ciertos productos clave en mi tienda.
*   Como administrador, quiero utilizar un panel de control que comparta el mismo diseño y estilos que el catálogo de mis clientes.

## 4. Requisitos Funcionales (EARS)

*   **[RF-15] Módulo de Detalles de Producto:** CUANDO el usuario interactúe con la foto de un producto en el catálogo, el sistema DEBERÁ abrir una ventana modal con los detalles completos (texto plano con saltos de línea conservados), el selector de variantes (con la primera variante pre-seleccionada por defecto) y un carrusel de hasta 4 imágenes, PARA QUE el cliente tenga información completa. Las imágenes secundarias (2, 3 y 4) se descargarán (Lazy Load) únicamente al abrir este modal.
*   **[RF-16] Flujo de Agregar al Carrito Optimizado:** MIENTRAS el usuario esté en el catálogo general, CUANDO haga clic en "Agregar", el sistema DEBERÁ añadir directamente +1 unidad al carrito si el producto no tiene variantes (mostrando feedback visual rápido), o abrir la ventana modal si el producto sí tiene variantes. Si se alcanza el límite de 99 unidades, el sistema bloqueará la acción notificando al usuario, PARA QUE la compra sea rápida y segura.
*   **[RF-17] Gestión de Múltiples Imágenes:** MIENTRAS el administrador cree o edite un producto, el sistema DEBERÁ requerir un mínimo de 1 imagen y permitir un máximo de 4. Se validará en frontend formato (JPG/PNG/WEBP) y peso (máx 5MB). El sistema permitirá reordenarlas y eliminarlas (salvo la última), PARA QUE el producto se presente de forma atractiva y sin errores.
*   **[RF-18] Categorías y Etiquetas Manuales:** CUANDO el administrador configure un producto, el sistema DEBERÁ permitir asignarle opciones manuales de destaque ("Más vendido" y "Oferta") y una categoría principal de forma opcional (asignando "Sin Categoría" por defecto), PARA QUE la gestión sea ágil.
*   **[RF-19] Sección Automática de Novedades:** CUANDO el sistema renderice el catálogo, DEBERÁ incluir dinámicamente en una sección de "Novedades" a los productos que estén en estado "Activo" Y hayan sido creados en los últimos 30 días (cálculo en UTC desde la base de datos), PARA QUE los clientes vean siempre el inventario más reciente.
*   **[RF-20] Búsqueda y Filtros:** MIENTRAS el usuario navegue el catálogo, el sistema DEBERÁ proveer una búsqueda por texto en tiempo real, campos numéricos simples para el rango de Precio (Mín/Máx), un filtro por Categoría y un interruptor de "Ofertas". Estos criterios operarán de forma acumulativa (regla lógica AND), PARA QUE el descubrimiento de productos sea sumamente preciso.
*   **[RF-21] Carrito en Panel Lateral:** CUANDO el usuario abra el carrito de compras, el sistema DEBERÁ desplegarlo como un panel lateral superpuesto (drawer) que podrá cerrarse haciendo clic fuera (overlay), presionando "Esc" o el botón "X", PARA QUE el usuario no pierda el contexto de su navegación al revisar su pedido.
*   **[RF-22] Edición Integral de Productos:** CUANDO el administrador acceda a un producto existente en el panel, el sistema DEBERÁ permitir modificar todos sus datos (nombre, precio, características, imágenes, categoría, variantes y etiquetas), PARA QUE la información pública se mantenga precisa.
*   **[RF-23] Branding del Comercio (Logotipo):** CUANDO la plataforma se cargue (tanto catálogo como panel), el sistema DEBERÁ inyectar y mostrar el logotipo oficial de la marca a partir de una variable de entorno, PARA QUE se fortalezca la identidad del comercio sin necesidad de gestionar la imagen desde la base de datos.

## 5. Requisitos No Funcionales

*   **UI/UX Unificada:** El panel de administración debe abandonar su diseño aislado y adoptar el lenguaje visual del catálogo (paleta de colores, tipografías, bordes redondeados y componentes).
*   **Experiencia Moderna:** El sistema debe incorporar transiciones y efectos visuales fluidos (microinteracciones, apertura suave de modales y paneles, efectos hover en tarjetas) que le den "vida" al proyecto, sin comprometer el rendimiento.
*   **Rendimiento Visual Continuo:** A pesar de aumentar el límite de imágenes y añadir animaciones, se debe mantener la optimización de carga rápida (Performance-First).
*   **Seguridad y Enrutamiento del Panel:** El acceso al panel de administración debe realizarse exclusivamente a través de una ruta aislada y privada (ej. `/admin`), sin enlaces o botones públicos en el catálogo.

## 6. Casos Límite y Reglas de Negocio Especiales

*   **Categoría Eliminada:** Si un administrador elimina una categoría que tiene productos asignados, estos productos reasignarán su estado a "Sin Categoría".
*   **Single Source of Truth vs Panel Lateral (JIT):** Si un administrador altera precios o disponibilidad de un producto mientras un cliente lo tiene en su panel lateral abierto, no habrá actualización en tiempo real en la UI del cliente (para proteger el rendimiento). En su lugar, cuando el cliente intente generar el pedido (clic en WhatsApp), el sistema realizará la validación Just-in-Time (JIT); si existen discrepancias, detendrá el envío, actualizará los precios en pantalla y mostrará un aviso.
*   **Ausencia de Novedades:** Si no existen productos que cumplan la condición de "Novedad" (activos y < 30 días), la sección se ocultará automáticamente.
*   **Estado Vacío (Empty State) en Búsqueda:** Si una combinación de filtros/búsqueda no arroja resultados, el catálogo mostrará un mensaje amigable indicando la ausencia de resultados y un botón de "Limpiar todos los filtros".

## 7. Fuera de Alcance

*   Productos pertenecientes a múltiples categorías simultáneas.
*   Sistema estructurado de atributos clave-valor (ej. tablas de especificaciones avanzadas).
*   Sincronización en tiempo real (WebSockets) del estado del carrito.

## 8. Criterios de Finalización (Done Criteria)

1.  El catálogo cuenta con una barra de búsqueda de texto, filtros operativos y empty states implementados.
2.  Las tarjetas de producto suman +1 al carrito directamente o abren un modal pre-seleccionando la primera variante.
3.  El modal del producto carga imágenes secundarias por lazy load y preserva formato de texto plano.
4.  El panel de administración permite la edición completa con validación frontend de imágenes (mín 1, máx 4, <5MB).
5.  El diseño del panel de administración es coherente visualmente con el catálogo.
6.  El carrito se abre en formato *drawer* con métodos de cierre completos (Esc, Overlay, X) y validación JIT preservada.
7.  El logotipo de la empresa es visible a través de variables de entorno.

