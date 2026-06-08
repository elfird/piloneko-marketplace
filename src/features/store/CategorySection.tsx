import React, { useState } from "react";
import { Search, Tv, Gamepad, Key, Layers } from "lucide-react";
import { Category, Product } from "../../types";
import { ProductCard } from "./ProductCard";

interface CategorySectionProps {
  categories: Category[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  products,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<any>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Custom Icon parser for Category Tabs
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Tv":
        return <Tv className="w-4 h-4" />;
      case "Gamepad":
        return <Gamepad className="w-4 h-4" />;
      case "Key":
        return <Key className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  // Filter products based on active tab & query string
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === "ALL" || prod.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-accent-primary/10">
      <div className="absolute top-20 right-0 w-80 h-80 bg-accent-primary/2 rounded-full blur-[90px] pointer-events-none" />

      {/* Section Headline */}
      <div className="text-center mb-12">
        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white tracking-widest text-neon relative inline-block mb-3 uppercase">
          // CYBER CATALOG
        </h2>
        <p className="text-xs sm:text-sm text-cyber-muted font-sans uppercase tracking-widest">
          Temukan Akun Premium Resmi & Top Up Game Teraman Anda
        </p>
      </div>

      {/* Search Input Bar & Mobile Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        {/* Dynamic Category Tabs Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`font-orbitron text-xs tracking-wider uppercase px-4 py-2 border select-none transition-all duration-200 cursor-pointer flex items-center gap-1.5 rounded-xs ${
              selectedCategory === "ALL"
                ? "border-accent-primary text-accent-primary bg-accent-primary/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]"
                : "border-cyber-muted/20 text-cyber-muted hover:border-accent-primary/40 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SEMUA PRODUK</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`font-orbitron text-xs tracking-wider uppercase px-4 py-2 border select-none transition-all duration-200 cursor-pointer flex items-center gap-1.5 rounded-xs ${
                selectedCategory === cat.id
                  ? "border-accent-primary text-accent-primary bg-accent-primary/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]"
                  : "border-cyber-muted/20 text-cyber-muted hover:border-accent-primary/40 hover:text-white"
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Text Area Searches */}
        <div className="w-full md:w-80 relative flex items-center">
          <Search className="w-4 h-4 text-cyber-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari akun atau game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyber-card border border-accent-primary/20 hover:border-accent-primary/40 focus:border-accent-secondary focus:outline-none text-white text-sm font-sans placeholder-cyber-muted rounded-xs transition-colors duration-300 shadow-inner"
          />
          {/* Cyber tiny decorative corner dot */}
          <span className="absolute top-0 right-0 w-1 h-1 bg-accent-secondary" />
        </div>
      </div>

      {/* Product list grid container */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-accent-primary/20 bg-cyber-card/35 rounded-xs">
          <Layers className="w-12 h-12 text-cyber-muted mx-auto mb-4 animate-bounce" />
          <h3 className="font-orbitron font-semibold text-lg text-white mb-1 uppercase">
            Sistem Data Kosong
          </h3>
          <p className="text-sm text-cyber-muted">
            Tidak ada produk ditemukan sesuai kata kunci atau filter aktif Anda.
          </p>
        </div>
      )}
    </section>
  );
};
