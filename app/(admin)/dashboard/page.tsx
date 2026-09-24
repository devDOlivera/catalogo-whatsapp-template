"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";

export default function DashboardPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    const fetchProducts = async () => {
        const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (data) setProducts(data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        await supabase.from("products").update({ is_active: !currentStatus }).eq("id", id);
        fetchProducts();
    };

    const deleteProduct = async (id: string) => {
        if (confirm("¿Estás seguro? Esto eliminará el producto y sus variantes.")) {
            await supabase.from("products").delete().eq("id", id);
            fetchProducts();
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        fetchProducts();
    };

    return (
        <div>
            <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">
                    {showForm ? "Crear Nuevo Producto" : "Gestión de Catálogo"}
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`${showForm ? "bg-gray-500" : "bg-green-600"} text-white px-4 py-2 rounded`}
                    >
                        {showForm ? "Volver al listado" : "Nuevo Producto"}
                    </button>
            </div>

            {showForm ? (
                <ProductForm onSuccess={handleFormSuccess} />
            ) : (
                <table className="w-full bg-white rounded shadow">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 text-left">Título</th>
                            <th className="p-3 text-left">Activo</th>
                            <th className="p-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b">
                                <td className="p-3">{product.title}</td>
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={product.is_active}
                                        onChange={() => toggleAvailability(product.id, product.is_active)}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                </td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:underline">
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">
                                    No hay productos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}