"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { ProductV1Card } from "./ProductCard";

interface ProductModalProps {
    product: ProductV1Card;
    currency: string;
    onClose: () => void;
}

export default function ProductModal({ product, currency, onClose }: ProductModalProps) {
    const addItem = useCartStore((state) => state.addItem);
    const activeVariants = product.product_variants.filter((v) => v.is_active);

    // Pre-seleccionar la primera variante
    const [selectedVariantId, setSelectedVariantId] = useState<string>(activeVariants[0]?.id || "");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [addedToast, setAddedToast] = useState(false);

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
            imageUrl: product.images[0], // Siempre guardamos la portada en el carrito
        });

        setAddedToast(true);
        setTimeout(() => {
            setAddedToast(false);
            onClose(); // Cerramos el modal tras agregarlo
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
            >
                {/* Botón cerrar */}
                <button onClick={onClose} className="absolutee top-4 right-4 z-10 bg-white/90 backdrop-blur text-gray-900 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md font-bold">
                    X
                </button>

                {/* Carrusel de imágenes */}
                <div className="w-full md:w-1/2 bg-gray-50 flex flex-col">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={product.images[currentImageIndex] || "/placeholder.png"}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Miniaturas */}
                    {product.images.length > 1 && (
                        <div className="flex gap-3 p-4 overflow-x-auto bg-white border-t border-gray-100">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-black' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <Image src={img} alt={`Miniatura ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalles del producto */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col">
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{product.title}</h2>

                    <span className="text-3xl font-bold text-gray-900 mb-6 block">
                        {currency} {currentVariant.price.toFixed(2)}
                    </span>

                    {product.description && (
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{product.description}</p>
                    )}

                    {/* Características con texto plano */}
                    {product.characteristics && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Características</h3>
                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {product.characteristics}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto">
                        {activeVariants.length > 1 && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Variante</label>
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-black font-medium"
                                >
                                    {activeVariants.map((variant) => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.name} - {currency} {variant.price.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <button
                            onClick={handleAddToCart}
                            className={`w-full text-white text-lg font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg ${addedToast ? 'bg-green-500 shadow-green-500/30' : 'bg-black hover:bg-gray-800 shadow-black/30'}`}
                        >
                            {addedToast ? "¡Agregado al carrito!" : "Agregar al carrito"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}