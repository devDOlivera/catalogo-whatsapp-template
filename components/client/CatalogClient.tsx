"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { ProductV1 } from "@/app/(client)/page";
import { filterNovedades } from "@/lib/catalogUtils";

export default function CatalogClient({
    initialProducts,
    categories,
    currency
}: {
    initialProducts: ProductV1[],
    categories: {id: string, name: string}[],
    currency: string
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [showOffersOnly, setShowOffersOnly] = useState(false);

    // Filtrado acumulativo AND
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === "" || p.category_id === selectedCategory;

            // Precio base basado en la primera variante
            const basePrice = p.product_variants[0]?.price || 0;
            const matchesMinPrice = minPrice === "" || basePrice >= minPrice;
            const matchesMaxPrice = maxPrice === "" || basePrice <= maxPrice;

            const matchesOffer = !showOffersOnly || p.is_offer;

            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesOffer;
        });
    }, [initialProducts, searchTerm, selectedCategory, minPrice, maxPrice, showOffersOnly]);

    // Agrupaciones dinámicas
    const novedades = filterNovedades(filteredProducts);
    const masVendidos = filteredProducts.filter(p => p.is_best_seller);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setShowOffersOnly(false);
    };

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Barra de filtros */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mt-2">
                <input
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    className="flex-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <select
                    className="p-3 border border-gray-200 rounded-xl bg-white w-full md:w-auto outline-none"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="">Todas las Categorías</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <div className="flex gap-2 items-center w-full md:w-auto">
                    <span className="text-gray-500 font-medium">{currency}</span>
                    <input type="number" placeholder="Mín" className="w-full md:w-24 p-3 border border-gray-200 rounded-xl outline-none" value={minPrice} onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : "")} />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Máx" className="w-full md:w-24 p-3 border border-gray-200 rounded-xl outline-none" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : "")} />
                </div>

                <label className="flex items-center justify-center gap-2 font-semibold text-orange-600 bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 cursor-pointer w-full md:w-auto">
                    <input type="checkbox" className="w-5 h-5 rounded text-orange-500 accent-orange-500" checked={showOffersOnly} onChange={e => setShowOffersOnly(e.target.checked)} />
                    Ofertas 🔥
                </label>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                    <p className="text-gray-500 mb-6 text-xl">No encontramos resultados para tu búsqueda.</p>
                    <button onClick={clearFilters} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md">
                        Limpiar todos los filtros
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-12">

                    {novedades.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">✨ Novedades</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {novedades.map(p => <ProductCard key={`nov-${p.id}`} product={p as any} currency={currency} />)}
                            </div>
                        </section>
                    )}

                    {masVendidos.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">⭐ Más Vendidos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {masVendidos.map(p => <ProductCard key={`bv-${p.id}`} product={p as any} currency={currency} />)}
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Catálogo General</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(p => <ProductCard key={p.id} product={p as any} currency={currency} />)}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}