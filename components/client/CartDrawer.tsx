"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, MessageCircle, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem, syncWithDB } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [jitWarning, setJitWarning] = useState(false);

    const currency = process.env.NEXT_PUBLIC_COMMERCE_CURRENCY || "$";
    const whatsappNumber = process.env.NEXT_PUBLIC_COMMERCE_WHATSAPP || "";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setJitWarning(false);
        
        const oldTotal = total;
        const oldItemsCount = items.length;
        
        await syncWithDB(supabase);
        
        const currentItems = useCartStore.getState().items;
        const newTotal = currentItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        if (newTotal !== oldTotal || currentItems.length !== oldItemsCount) {
            setJitWarning(true);
            setIsCheckingOut(false);
            return; 
        }

        let message = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
        currentItems.forEach(item => {
            message += `* ${item.quantity}x ${item.name} - ${currency}${(item.price * item.quantity).toFixed(2)}\n`;
        });
        message += `\n*Total estimado: ${currency}${newTotal.toFixed(2)}*\n\n`;
        message += "Por favor, confírmame la disponibilidad.";
        const encodedText = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedText}`;
        window.open(whatsappUrl, "_blank");
        setIsCheckingOut(false);
    };

    if (!isMounted) return null;

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}
            {/* Drawer */}
            <div 
                className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">Tu Pedido</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {jitWarning && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium animate-pulse">
                            ⚠️ Algunos precios o disponibilidades cambiaron mientras comprabas. Hemos actualizado tu carrito. Revisa antes de enviar.
                        </div>
                    )}
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-gray-500 mb-6 text-lg">El carrito está vacío.</p>
                            <button onClick={onClose} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md">
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <li key={item.variantId} className="py-5 flex gap-4">
                                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                        <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{currency} {item.price.toFixed(2)} c/u</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5 text-gray-600 hover:text-black disabled:opacity-50">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= 99} className="p-1.5 text-gray-600 hover:text-black disabled:opacity-50">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.variantId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-lg font-bold text-gray-700">Total estimado</span>
                            <span className="text-3xl font-black text-gray-900">{currency} {total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#25D366]/30 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isCheckingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageCircle className="w-6 h-6" />}
                            {isCheckingOut ? "Validando tu pedido..." : "Enviar pedido"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}