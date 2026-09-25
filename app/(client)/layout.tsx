"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const commerceName = process.env.NEXT_PUBLIC_COMMERCE_NAME || "Catálogo";
    const items = useCartStore((state) => state.items);

    // Evitar desajustes de deshidratación con Zustand persist
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
                        {commerceName}
                    </Link>

                    <Link
                        href="/cart"
                        prefetch={false}
                        className="relative flex items-center p-2 text-gray-700 hover:text-black transition-colors"
                        aria-label="Ver carrito"
                    >
                        <ShoppingBag className="w-6 h-6" />
                        {mounted && (
                            <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-semibold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                                {totalQuantity}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="border-t border-gray-200 bg-white py-6">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} {commerceName}. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
