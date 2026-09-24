"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isMultiVariant, setIsMultiVariant] = useState(false);
    const [variants, setVariants] = useState([{ name: "Unica", price: 0 }]);
    const [loading, setLoading] = useState(false);

    const handleAddVariant = () => {
        setVariants([...variants, { name: "", price: 0 }]);
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!imageFile) return alert("La imagen es obligatoria");
        setLoading(true);

        try {
            // 1. Subir imagen a Supabase Storage
            const fileExt = imageFile.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from("catalog-images")
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from("catalog-images").getPublicUrl(fileName);

            // 2. Insertar producto
            const { data: productData, error: productError } = await supabase.from("products").insert({
                title,
                description,
                image_url: urlData.publicUrl,
            }).select().single();

            if (productError) throw productError;

            // 3. Insertar variantes
            const variantsToInsert = variants.map(v => ({
                product_id: productData.id,
                name: isMultiVariant ? v.name : "Única",
                price: v.price
            }));

            const { error: variantError } = await supabase.from("product_variants").insert(variantsToInsert);
            if (variantError) throw variantError;

            onSuccess();
        } catch (err: any) {
            alert("Error al guardar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-xl">
            <h3 className="text-xl font-bold mb-4">Crear Producto</h3>

            <input type="text" placeholder="Título" required className="w-full mb-3 p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="Descripción" className="w-full mb-3 p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} />

            <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold">Imagen Obligatoria *</label>
                <input type="file" accept="image/*" required onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full" />
            </div>

            <div className="mb-4 flex items-center gap-2">
                <input type="checkbox" id="multi" checked={isMultiVariant} onChange={e => setIsMultiVariant(e.target.checked)} />
                <label htmlFor="multi">Este producto tiene múltiples variantes (ej. colores/talles)</label>
            </div>

            {variants.map((v, index) => (
                <div key={index} className="flex gap-2 mb-2">
                    {isMultiVariant && (
                        <input type="text" placeholder="Nombre Variante" required className="flex-1 p-2 border rounded" value={v.name} onChange={e => {
                            const newV = [...variants]; newV[index].name = e.target.value; setVariants(newV);
                        }} />
                    )}
                    <input type="number" placeholder="Precio" required min="0" step="0.01" className="w-32 p-2 border rounded" value={v.price} onChange={e => {
                        const newV = [...variants]; newV[index].price = parseFloat(e.target.value); setVariants(newV);
                    }} />
                </div>
            ))}

            {isMultiVariant && (
                <button type="button" onClick={handleAddVariant} className="text-blue-600 text-sm mb-4">+ Agregar Variante</button>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
                {loading ? "Guardando..." : "Guardar Producto"}
            </button>
        </form>
    );
}