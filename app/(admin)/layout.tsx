"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children } : { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && pathname !== "/login") {
                // Si no hay sesión y no está en login, expulsar a login
                router.push("/login");
            } else if (session && pathname === "/login") {
                // Si ya hay sesión pero intenta entrar al login, llevar al dashboard
                router.push("/dashboard");
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router, pathname]);

    if (loading) return <div className="p-8 text-center">Cargando panel...</div>;

    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
                <nav className="flex flex-col gap-2">
                    {/* Aquí puedes agregar enlaces en el futuro */}
                    <span className="p-2 bg-gray-800 rounded">Catálogo</span>
                </nav>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}