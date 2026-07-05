import { motion } from "motion/react";
import { ArrowLeft, ShoppingBag, Book, Sparkles, Shirt } from "@/src/lib/icons";
import { Dispatch, SetStateAction, useState } from "react";
import { ViewType } from "../App";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "../hooks/useSettings";

type Category = "All" | "Quran" | "Prayer Mats" | "Tasbih" | "Books" | "Clothing";

const STORE_ITEMS = [
  {
    id: "q1",
    name: "Premium Velvet Quran",
    category: "Quran",
    price: "$29.99",
    description: "Beautifully crafted velvet bound Quran with Arabic text and English translation.",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaab31ce?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "q2",
    name: "Tajweed Quran (Color Coded)",
    category: "Quran",
    price: "$34.99",
    description: "Color-coded Tajweed rules to help perfect your recitation.",
    image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "m1",
    name: "Orthopedic Prayer Mat",
    category: "Prayer Mats",
    price: "$45.00",
    description: "Thick memory foam prayer mat for comfortable sujood.",
    image: "https://images.unsplash.com/photo-1598444458315-9f5b61ecb7d2?q=80&w=1471&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "t1",
    name: "Olive Wood Tasbih",
    category: "Tasbih",
    price: "$15.99",
    description: "Handcrafted 99-bead Tasbih made from genuine olive wood.",
    image: "https://images.unsplash.com/photo-1623912440156-fcf978c430a6?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "t2",
    name: "Digital Tally Counter",
    category: "Tasbih",
    price: "$9.99",
    description: "Compact digital finger ring counter for tracking dhikr.",
    image: "https://images.unsplash.com/photo-1577372951939-f9c490a612db?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "b1",
    name: "Fortress of the Muslim",
    category: "Books",
    price: "$8.50",
    description: "Authentic supplications (Hisnul Muslim) for daily needs.",
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  },
  {
    id: "c1",
    name: "Classic Thobe",
    category: "Clothing",
    price: "$55.00",
    description: "Elegant and comfortable white thobe for daily wear or prayers.",
    image: "https://images.unsplash.com/photo-1605001011155-2ade09886e3f?q=80&w=1470&auto=format&fit=crop",
    link: "#"
  }
];

export function StoreView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const categories: Category[] = ["All", "Quran", "Prayer Mats", "Tasbih", "Books", "Clothing"];

  const filteredItems = STORE_ITEMS.filter(
    item => selectedCategory === "All" || item.category === selectedCategory
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 z-50 bg-emerald-950 flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 bg-emerald-900 shadow-md z-10 shrink-0">
        <button
          onClick={() => setView("home")}
          className="p-2 -ml-2 rounded-full hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-100" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          Islamic Store
        </h2>
      </div>

      <div className="overflow-x-auto shrink-0 pb-2 pt-4 px-4 hide-scrollbar">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-emerald-500 text-emerald-950"
                  : "bg-emerald-900/50 text-emerald-100 border border-emerald-800/50 hover:bg-emerald-800/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-24">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="bg-emerald-900/40 border border-emerald-800/30 rounded-2xl overflow-hidden shadow-lg flex flex-col"
          >
            <div className="h-48 w-full relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-emerald-950/80 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-800/50">
                <span className="text-emerald-400 font-bold text-sm tracking-wide">{item.price}</span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-emerald-50 text-lg leading-tight">
                  {item.name}
                </h3>
              </div>
              <p className="text-xs text-emerald-200/70 leading-relaxed mb-3">
                {item.description}
              </p>
              
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now
              </a>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 opacity-50">
             <ShoppingBag className="w-12 h-12 text-emerald-500 mb-4" />
             <p className="text-emerald-200 text-sm">No items found in this category.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
