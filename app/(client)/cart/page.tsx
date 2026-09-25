"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, Loader2, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";

export default function CartPage() {
    const { items, updateQuantity, removeItem, syncWithDB } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);

    const currency = process.env.NEXT_PUBLIC_COMMERCE_CURRENCY || "$";
    const whatsappNumber = process.env.NEXT_PUBLIC_COMMERCE_WHATSAPP || "";

    // Validación Just-in-Time: Se ejecuta al abrir el carrito
    useEffect(() => {
        setIsMounted(true);
        
        const validateCart = async () => {
            setIsSyncing(true);
            await syncWithDB(supabase);
            console.log("Sincronización Just-in-Time completada: Precios y stock actualizados.");
            setIsSyncing(false);
        };

        validateCart();
    }, [syncWithDB]);

    // Cálculo del total estimado
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Redirección a WhatsApp
    const handleCheckout = () => {
        let message = "!Hola¡ Me gustaría realizar el siguiente pedido:\n\n";

        items.forEach(item => {
            message += `* ${item.quantity}x ${item.name} - ${currency}${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\n*Total estimado: ${currency}${total.toFixed(2)}*\n\n`;
        message += "Por favor, confírmame la disponibilidad.";

        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`;

        window.open(whatsappUrl, "_blank");
    };

    if (!isMounted) return null; // Previene desajustes de hidratación con Zustand persist

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-6">
                <Link href="/" className="text-gray-500 hover:text-black transition-colors mr-4">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Tu Pedido</h1>
            </div>

            {isSyncing ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-sm">Validando disponibilidad y precios...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">El carrito está vacío.</p>
                    <Link
                        href="/"
                        className="inline-block bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Volver al catálogo
                    </Link>
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-gray-100 mb-6">
                        {items.map((item) => (
                            <li key={item.variantId} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {currency} {item.price.toFixed(2)} c/u
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                            className="p-2 text-gray-600 hover:text-black disabled:opacity-50"
                                            aria-label="Reducir cantidad"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                            disabled={item.quantity >= 99}
                                            className="p-2 text-gray-600 hover:text-black disabled:opacity-50"
                                            aria-label="Aumentar cantidad"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.variantId)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        aria-label="Eliminar ítem"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-medium text-gray-900">Total estimado</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {currency} {total.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={items.length === 0}
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MessageCircle className="w-6 h-6" />
                            Enviar pedido por WhatsApp
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-3">
                            Serás redirigido a WhatsApp para confirmar la disponibilidad y el pago con el comercio.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}