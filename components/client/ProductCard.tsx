"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export interface Variant {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
}

export interface Product {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    product_variants: Variant[];
}

interface ProductCardProps {
    product: Product;
    currency: string;
}

export default function ProductCard({ product, currency }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    // Filtrar variantes activas de respaldo
    const activeVariants = product.product_variants.filter((v) => v.is_active);

    const hasMultipleVariants = activeVariants.length > 1;
    const [selectedVariantId, setSelectedVariantId] = useState<string>(
        activeVariants[0]?.id || ""
    );

    const currentVariant = activeVariants.find((v) => v.id === selectedVariantId) || activeVariants[0];

    const handleAddToCart = () => {
        if (!currentVariant) return;

        const variantLabel = currentVariant.name === "Única"
            ? product.title
            : `${product.title} (${currentVariant.name})`;

        addItem({
            variantId: currentVariant.id,
            productId: product.id,
            name: variantLabel,
            price: currentVariant.price,
            quantity: 1,
            imageUrl: product.image_url,
        });
    };

    if (!currentVariant) return null;

    return (
        <article className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-square w-full bg-gray-100">
                <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                />
            </div>

            <div className="flex flex-col flex-1 p-4">
                <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {product.title}
                </h2>

                {product.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                            {currency} {currentVariant.price.toFixed(2)}
                        </span>

                        {hasMultipleVariants && (
                            <select
                                aria-label="Seleccionar variante"
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                className="text-xs bg-gray-50 border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
                            >
                                {activeVariants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full bg-black hover:bg-gray-800 text-white text-sm font-medium  py-2.5 px-4 rounded-lg transition-colors active:scale-[0.98]"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </article>
    );
}