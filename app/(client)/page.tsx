import { supabase } from "@/lib/supabase/client";
import CatalogClient from "@/components/client/CatalogClient";
import { Variant } from "@/components/client/ProductCard";

export const revalidate = 0; // Garantiza Single Source of Truth

export interface ProductV1 {
    id: string;
    title: string;
    description: string | null;
    characteristics: string | null;
    images: string[];
    is_best_seller: boolean;
    is_offer: boolean;
    created_at: string;
    category_id: string | null;
    product_variants: Variant[];
}

async function getCatalog(): Promise<ProductV1[]> {
    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            title,
            description,
            characteristics,
            images,
            is_best_seller,
            is_offer,
            created_at,
            category_id,
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

    return (data as unknown as ProductV1[]) || [];
}

async function getCategories() {
    const { data } = await supabase.from("categories").select("id, name");
    return data || [];
}

export default async function CatalogPage() {
    const products = await getCatalog();
    const categories = await getCategories();
    const currency = process.env.NEXT_PUBLIC_COMMERCE_CURRENCY || "$";

    return (
        <CatalogClient
            initialProducts={products}
            categories={categories}
            currency={currency}
        />
    );
} 