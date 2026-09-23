import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CartItem {
    variantId: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    removeItem: (variantId: string) => void;
    syncWithDB: (supabase: SupabaseClient) => Promise<void>;
}

export const useCartStore = create<CartState> () (
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (item) => item.variantId === newItem.variantId
                    );

                    if (existingItem) {
                        const updateQuantity = Math.min(existingItem.quantity + newItem.quantity, 99);
                        return {
                            items: state.items.map((item) => 
                                item.variantId === newItem.variantId
                                    ? { ...item, quantity: updateQuantity }
                                    : item
                            ),
                        };
                    }

                    const initialQuantity = Math.min(newItem.quantity, 99);
                    return {
                        items: [...state.items, { ...newItem, quantity: initialQuantity }],
                    };
                });
            },

            updateQuantity: (variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(variantId);
                    return;
                }

                const validQuantity = Math.min(quantity, 99);

                set((state) => ({
                    items: state.items.map((item) =>
                        item.variantId === variantId
                            ? { ...item, quantity: validQuantity }
                            : item
                    ),
                }));
            },

            removeItem: (variantId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.variantId !== variantId),
                }));
            },

            syncWithDB: async (supabase) => {
                const { items } = get();
                if (items.length === 0) return;

                const variantIds = items.map((item) => item.variantId);

                // Consultar la tabla product_variants en Supabase
                const { data: dbVariants, error } = await supabase
                    .from("product_variants")
                    .select("id, price, is_active")
                    .in("id", variantIds);

                if (error || !dbVariants) {
                    console.error("Error al sincronizar el carrito con la base de datos:", error);
                    return;
                }

                set((state) => {
                    const updatedItems = state.items
                        .map((item) => {
                            const dbVariant = dbVariants.find((v) => v.id === item.variantId);

                            // Si la variante ya no existe o está inactiva, se filtra eliminándola silenciosamente
                            if (!dbVariant || !dbVariant.is_active) {
                                return null;
                            }

                            // Ajustar el precio si hay una discrepancia entre el local y la DB
                            if (dbVariant.price !== item.price) {
                                return { ...item, price: dbVariant.price };
                            }

                            return item;
                        })
                        .filter(Boolean) as CartItem[]; // Filtramos los valores nulos

                    return { items: updatedItems };
                });
            },
        }),
        {
            name: "cart-storage", // Clave bajo la cual se persistirá en localStorage
        }
    )
);