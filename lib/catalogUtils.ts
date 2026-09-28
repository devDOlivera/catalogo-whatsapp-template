/** 
 * Evalúa si un producto es una "Novedad"
 */ 
export function isNovedad(createdAt: string, isActive: boolean = true): boolean {
    if (!isActive) return false;

    // Convertimos la fecha UTC de supabase a un objeto Date
    const createdDate = new Date(createdAt);
    const now = new Date();

    // Obtenemos la diferencia en milisegundos y la pasamos a días
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Retorna true si han pasado 30 días o menos
    return diffDays <= 30;
}

/**
 *  Filtra un arreglo completo de productos y devuelve únicamente las novedades
 */
export function filterNovedades<T extends { created_at: string; is_active?: boolean }> (productos: T[]): T[] {
    return productos.filter(producto => 
        isNovedad(producto.created_at, producto.is_active !== undefined ? producto.is_active : true)
    );
}