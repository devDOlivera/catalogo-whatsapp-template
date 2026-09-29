"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import CartDrawer from "@/components/client/CartDrawer";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const commerceName = process.env.NEXT_PUBLIC_COMMERCE_NAME || "Catálogo";
    const items = useCartStore((state) => state.items);

    // Estado para controlar el panel lateral
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Evitar desajustes de deshidratación
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tight text-gray-900">
                        {commerceName}
                    </Link>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative flex items-center p-2 text-gray-700 hover:text-black transition-colors focus:outline-none"
                        aria-label="Ver carrito"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {mounted && totalQuantity > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-sm">
                                {totalQuantity}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 relative">
                {children}
            </main>

            <footer className="border-t border-gray-200 bg-white py-8 mt-auto">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500 font-medium">
                    &copy; {new Date().getFullYear()} {commerceName}. Todos los derechos reservados.
                </div>
            </footer>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}
