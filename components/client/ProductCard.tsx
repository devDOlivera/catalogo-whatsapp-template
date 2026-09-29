"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import ProductModal from "./ProductModal";

export interface Variant {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
}

export interface ProductV1Card {
    id: string;
    title: string;
    description: string | null;
    characteristics: string | null;
    images: string[];
    product_variants: Variant[];
}

interface ProductCardProps {
    product: ProductV1Card;
    currency: string;
}

export default function ProductCard({ product, currency }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addedToast, setAddedToast] = useState(false);

    // Filtrar variantes activas
    const activeVariants = product.product_variants.filter((v) => v.is_active);
    const hasMultipleVariants = activeVariants.length > 1;
    
    // Si no hay variantes activas, no mostramos la tarjeta
    if (activeVariants.length === 0) return null;

    const baseVariant = activeVariants[0];

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (hasMultipleVariants) {
            // Si tiene variantes, abrimos el modal
            setIsModalOpen(true);
        } else {
            // Si es variante única, sumamos +1 directo y mostramos feedback visual
            addItem({
                variantId: baseVariant.id,
                productId: product.id,
                name: baseVariant.name === "Única" ? product.title : `${product.title} (${baseVariant.name})`,
                price: baseVariant.price,
                quantity: 1,
                imageUrl: product.images[0], // Usamos la portada
            });

            // Mostrar micro-feedback temporal
            setAddedToast(true);
            setTimeout(() => setAddedToast(false), 1500);
        }
    };

    return (
        <>
            <article
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group h-full"
            >
                <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                    <Image
                        src={product.images[0] || "/placeholder.png"}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">
                        {product.title}
                    </h2>

                    {product.description && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    <div className="mt-auto pt-5">
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="text-xl font-black text-gray-900">
                                {currency} {baseVariant.price.toFixed(2)}
                            </span>
                        </div>

                        {/* Botón dinámico */}
                        <button
                            type="button"
                            onClick={handleActionClick}
                            className={`w-full text-white text-sm font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] ${addedToast ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-black hover:bg-gray-800'}`}
                        >
                            {addedToast ? "¡Agregado +1!" : (hasMultipleVariants ? "Elegir opciones" : "Agregar")}
                        </button>
                    </div>
                </div>
            </article>

            {isModalOpen && (
                <ProductModal
                    product={product}
                    currency={currency}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}