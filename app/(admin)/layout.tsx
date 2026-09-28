"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children } : { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    
    const logoUrl = process.env.NEXT_PUBLIC_STORE_LOGO_URL || "";

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

    if (loading) return <div className="p-8 text-center flex items-center justify-center min-h-screen">Cargando panel...</div>;

    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex bg-gray-50 text-gray-900">
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm z-10">
                <div className="mb-8 flex justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Store Logo" className="h-25 object-contain" />
                    ) : (
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Panel</h1>
                    )}
                </div>
                <nav className="flex flex-col gap-2">
                    <span className="p-3 bg-blue-50 text-blue-700 font-semibold rounded-lg shadow-sm border border-blue-100">Catálogo</span>
                </nav>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}