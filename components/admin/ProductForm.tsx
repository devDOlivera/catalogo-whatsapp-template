"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProductForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [characteristics, setCharacteristics] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [isBestSeller, setIsBestSeller] = useState(false);
    const [isOffer, setIsOffer] = useState(false);

    // Manejo de múltiples imágenes
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const [isMultiVariant, setIsMultiVariant] = useState(false);
    const [variants, setVariants] = useState([{ name: "Única", price: 0 }]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

    // Cargar categorías al montar
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from("categories").select("id, name");
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        const validFiles: File[] = [];

        for (const file of files) {
            // Validación Front: < 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert(`La imagen ${file.name} supera los 5MB permitidos.`);
                continue;
            }
            // Validación Front: Formatos
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                alert(`El formato de ${file.name} no es soportado. Solo JPG, PNG O WEBP.`);
                continue;
            }
            validFiles.push(file);
        }

        if (imageFiles.length + validFiles.length > 4) {
            alert("No puedes subir más de 4 imágenes por producto.");
            return;
        }

        setImageFiles([...imageFiles, ...validFiles]);
    };

    const removeImage = (index: number) => {
        if (imageFiles.length === 1) {
            alert("Debe quedar al menos 1 imagen (Portada obligatoria).");
            return;
        }
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
    };

    const handleAddVariant = () => {
        setVariants([...variants, { name: "", price: 0 }]);
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (imageFiles.length === 0) return alert("Debes subir al menos 1 imagen.");
        setLoading(true);

        try {
            // 1. Subir todas las imágenes a Supabase Storage
            const uploadedUrls: string[] = [];
            for (const file of imageFiles) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("catalog-images")
                    .upload(fileName, file);
                
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from("catalog-images").getPublicUrl(fileName);
                uploadedUrls.push(urlData.publicUrl);
            }

            // 2. Insertar producto
            const productPayload: any = {
                title,
                description,
                characteristics,
                is_best_seller: isBestSeller,
                is_offer: isOffer,
                images: uploadedUrls, // Se guarda como array
            }

            // Categoría es opcional
            if (categoryId) {
                productPayload.category_id = categoryId;
            }

            const { data: productData, error: productError } = await supabase
                .from("products")
                .insert(productPayload)
                .select()
                .single();

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
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Producto</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Título del producto" required className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" value={title} onChange={e => setTitle(e.target.value)} />

                <select className="col-span-2 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Sin Categoría</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                
                <textarea placeholder="Descripción breve" className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={description} onChange={e => setDescription(e.target.value)} rows={2} />

                <textarea placeholder="Características (Texto amplio, soporta saltos de línea)" className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap" value={characteristics} onChange={e => setCharacteristics(e.target.value)} rows={4} />
            </div>


            <div className="flex gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                        ⭐ Más Vendido
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} />
                        🔥 Oferta Especial
                </label>
            </div>

            <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Imágenes (Mín. 1, Máx. 4) <span className="text-gray-400 font-normal">- JPG, PNG, WEBP &lt; 5MB</span></label>

                {imageFiles.length < 4 && (
                    <input type="file" accept="image/jpeg, image/png, image/webp" multiple onChange={handleFileChange} className="w-full mb-4 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue100 cursor-pointer" />
                )}

                <div className="flex gap-4 flex-wrap mt-2">
                    {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative w-24 h-24 border border-gray-200 rounded-lg overflow-hidden group shadow-sm">
                            <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="object-cover w-full h-full" />
                            <div className="absolute top-0 left-0 bg-black/60 text-white text-xs px-2 py-1 rounded-br-lg">{idx === 0 ? "Portada" : idx + 1}</div>
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-sm">X</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4 flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <input type="checkbox" id="multi" checked={isMultiVariant} onChange={e => setIsMultiVariant(e.target.checked)} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
                <label htmlFor="multi" className="font-medium text-blue-900 cursor-pointer">Este producto tiene múltiples variantes (ej. colores/talles)</label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                {variants.map((v, index) => (
                    <div key={index} className="flex gap-3 mb-3">
                        {isMultiVariant && (
                            <input type="text" placeholder="Nombre (Ej: Rojo - L)" required className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ting-blue-500" value={v.name} onChange={e => {
                                const newV = [...variants]; newV[index].name = e.target.value; setVariants(newV);
                            }} />
                        )}
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-500 font-semibold">$</span>
                            <input type="number" placeholder="Precio" required min="0" step="0.01" className="w-40 p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={v.price} onChange={e => {
                                const newV = [...variants]; newV[index].price = parseFloat(e.target.value); setVariants(newV);
                            }} />
                        </div>
                    </div>
                ))}

                {isMultiVariant && (
                    <button type="button" onClick={handleAddVariant} className="text-blue-600 font-bold hover:text-blue-800 transition-colors">+ Añadir otra variante</button>
                )}
            </div>


            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold p-4 rounded-xl shadow-md disabled:bg-gray-400 text-lg">
                {loading ? "Subiendo imágenes y guardando..." : "Guardar Producto"}
            </button>
        </form>
    );
}