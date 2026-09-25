import { supabase } from "@/lib/supabase/client";
import ProductCard, { Product } from "@/components/client/ProductCard";

export const revalidate = 0; // Garantiza Single Source of Truth

async function getCatalog(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            title,
            description,
            image_url,
            product_variants!inner (
                id,
                name,
                price,
                is_active
            )
        `)
        .eq("is_active", true)
        .eq("product_variants.is_active", true)
        .order("created_at", { ascending: false });
    
    if (error) {
        console.error("Error al obtener productos:", error.message);
        return [];
    }

    return (data as unknown as Product[]) || [];
}

export default async function CatalogPage() {
    const products = await getCatalog();
    const currency = process.env.NEXT_PUBLIC_COMMERCE_CURRENCY || "$";

    return (
        <div>
            <section className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Nuestros Productos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Elige los productos que desees y envíanos tu pedido directo por WhatsApp.
                </p>
            </section>

            {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">
                        No hay productos disponibles en este momento.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            currency={currency}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 