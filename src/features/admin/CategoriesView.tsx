import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Folder, Plus, Edit2, Trash2, X, Search, ArrowUpDown, SlidersHorizontal, 
  Tv, Gamepad, Key, FolderInput, GripVertical, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft
} from "lucide-react";
import { Category } from "../../types";

interface CategoriesViewProps {
  token: string;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ token }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Sorting
  const [sortKey, setSortKey] = useState<keyof Category | "products">("sortOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Deletion Migration safety guard state
  const [productCount, setProductCount] = useState(0);
  const [migrationTargetId, setMigrationTargetId] = useState<string>("");
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Form states
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("Tv");
  const [catType, setCatType] = useState<"PREMIUM_ACCOUNT" | "GAME_TOPUP" | "LICENSE">("PREMIUM_ACCOUNT");
  const [catSortOrder, setCatSortOrder] = useState<number>(0);
  const [catIsActive, setCatIsActive] = useState(true);

  // Drag & Drop tracking
  const draggedIdxRef = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data kategori");
      const list = await res.json();
      setCategories(list);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Handle Form changes with slug generator
  const handleNameChange = (val: string, mode: "add" | "edit") => {
    if (mode === "add") {
      setCatName(val);
      setCatSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    } else if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name: val,
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      });
    }
  };

  // Add Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      alert("Nama Kategori dan Slug wajib diisi!");
      return;
    }
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: catName,
          slug: catSlug,
          icon: catIcon || "Tv",
          type: catType,
          sortOrder: Number(catSortOrder) || 0,
          isActive: catIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kategori baru");

      // Clean state
      setCatName("");
      setCatSlug("");
      setCatIcon("Tv");
      setCatType("PREMIUM_ACCOUNT");
      setCatSortOrder(0);
      setCatIsActive(true);
      setShowAddModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Edit Category Handler
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingCategory.name,
          slug: editingCategory.slug,
          icon: editingCategory.icon || "Tv",
          type: editingCategory.type,
          sortOrder: Number(editingCategory.sortOrder) || 0,
          isActive: editingCategory.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengupdate kategori");

      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Category & Migration Guard
  const handleDeleteCategory = async (cat: Category, forceMigrateId?: number) => {
    try {
      const payload: any = {};
      if (forceMigrateId) {
        payload.moveProductsTo = forceMigrateId;
      }

      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Safe guard checks if products still belong to the category
        if (data.needsMigration) {
          setDeletingCategory(cat);
          setProductCount(data.productCount);
          // Find first alternative category to select as default migration
          const altCat = categories.find((c) => c.id !== cat.id && c.isActive);
          setMigrationTargetId(altCat ? String(altCat.id) : "");
          setShowMigrationModal(true);
          return;
        }
        throw new Error(data.error || "Gagal menghapus kategori");
      }

      // Close migration modal
      setShowMigrationModal(false);
      setDeletingCategory(null);
      setProductCount(0);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Drag & Drop native HTML5 reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    draggedIdxRef.current = index;
    // Set a ghost drag image
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdxRef.current === null || draggedIdxRef.current === index) return;
    setDragOverIdx(index);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    const sourceIndex = draggedIdxRef.current;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reorderedList = [...sortedAndFilteredCategories];
    const [draggedItem] = reorderedList.splice(sourceIndex, 1);
    reorderedList.splice(targetIndex, 0, draggedItem);

    // Re-map sort orders globally
    const updatedOrders = reorderedList.map((item, index) => ({
      id: item.id,
      sortOrder: index + 1,
    }));

    // Optimistically update front state
    const mappedState = categories.map((cat) => {
      const match = updatedOrders.find((o) => o.id === cat.id);
      return match ? { ...cat, sortOrder: match.sortOrder } : cat;
    });
    setCategories(mappedState.sort((a, b) => a.sortOrder - b.sortOrder));

    // Call API to sync Drag & Drop changes
    try {
      const res = await fetch("/api/admin/categories-reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });
      if (!res.ok) {
        throw new Error("Gagal mengupdate urutan database");
      }
    } catch (err: any) {
      alert(err.message);
      fetchCategories(); // Revert back on error
    } finally {
      draggedIdxRef.current = null;
    }
  };

  // Toggle category state
  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          type: cat.type,
          sortOrder: cat.sortOrder,
          isActive: !cat.isActive,
        }),
      });
      if (!res.ok) throw new Error("Gagal merubah status kategori");
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Category Icon Renderer helper
  const renderCategoryIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Tv":
        return <Tv className="w-4 h-4 text-accent-primary" />;
      case "Gamepad":
        return <Gamepad className="w-4 h-4 text-accent-secondary" />;
      case "Key":
        return <Key className="w-4 h-4 text-[#FFD700]" />;
      default:
        return <Folder className="w-4 h-4 text-gray-400" />;
    }
  };

  // Category Type label and visual wrapper
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case "PREMIUM_ACCOUNT":
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider font-extrabold uppercase rounded-sm border border-accent-primary/30 bg-accent-primary/10 text-accent-primary shadow-[0_0_6px_rgba(0,245,255,0.05)]">
            Premium Account
          </span>
        );
      case "GAME_TOPUP":
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider font-extrabold uppercase rounded-sm border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary shadow-[0_0_6px_rgba(191,0,255,0.05)]">
            Game Topup
          </span>
        );
      case "LICENSE":
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider font-extrabold uppercase rounded-sm border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_6px_rgba(255,215,0,0.05)]">
            Software License
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-sm bg-gray-500/20 text-gray-400">
            {type}
          </span>
        );
    }
  };

  // Sort & Filter execution
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || cat.type === typeFilter;
    const matchesStatus = 
      statusFilter === "ALL" || 
      (statusFilter === "ACTIVE" && cat.isActive) ||
      (statusFilter === "INACTIVE" && !cat.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedAndFilteredCategories = [...filteredCategories].sort((a, b) => {
    let aVal: any = a[sortKey as keyof Category] ?? "";
    let bVal: any = b[sortKey as keyof Category] ?? "";

    if (sortKey === "products") {
      aVal = a._count?.products || 0;
      bVal = b._count?.products || 0;
    }

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculation bounds
  const totalItems = sortedAndFilteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCategories = sortedAndFilteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handleSortToggle = (key: keyof Category | "products") => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-8 text-left font-sans select-none">
      
      {/* 1. View Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-widest text-neon mb-1 uppercase">
            // MANAGE PRODUCT CATEGORIES
          </h1>
          <p className="text-[10px] text-cyber-muted font-mono uppercase tracking-widest block font-bold">
            Kelola kategori produk marketplace, tipe pengiriman, urutan display, dan status aktif
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-accent-primary/10 text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-white transition-all text-xs font-orbitron font-bold tracking-widest cursor-pointer flex items-center justify-center gap-1.5 rounded-xs"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>TAMBAH KATEGORI</span>
        </button>
      </div>

      {/* 2. Cyber Table Filter Panel */}
      <div className="bg-[#0F0F1A] border border-accent-primary/15 p-4 rounded-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative col-span-1 md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-muted">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari nama kategori atau slug..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-2">
          <label className="text-cyber-muted text-[9px] font-mono uppercase shrink-0">Tipe:</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
          >
            <option value="ALL">SEMUA TIPE</option>
            <option value="PREMIUM_ACCOUNT">PREMIUM ACCOUNT</option>
            <option value="GAME_TOPUP">GAME TOPUP</option>
            <option value="LICENSE">SOFTWARE LICENSE</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <label className="text-cyber-muted text-[9px] font-mono uppercase shrink-0">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 bg-cyber-bg border border-accent-primary/20 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
          >
            <option value="ALL">SEMUA STATUS</option>
            <option value="ACTIVE">AKTIF</option>
            <option value="INACTIVE">NON-AKTIF</option>
          </select>
        </div>
      </div>

      {/* 3. Drag & Drop Data Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-[10px] text-cyber-muted uppercase">LOADING CENTRAL DATABASE...</p>
        </div>
      ) : paginatedCategories.length > 0 ? (
        <div className="border border-accent-primary/10 bg-[#0F0F1A]/80 rounded-xs overflow-hidden shadow-2xl">
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-sans text-xs text-left">
              <thead>
                <tr className="bg-[#0A0A0F] border-b border-accent-primary/25 text-cyber-muted font-mono tracking-widest text-[9px] uppercase">
                  <th className="p-3.5 w-10 text-center">#</th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSortToggle("name")}>
                    <div className="flex items-center gap-1.5">
                      <span>Nama Kategori</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSortToggle("slug")}>
                    <div className="flex items-center gap-1.5">
                      <span>SEO Slug</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSortToggle("type")}>
                    <div className="flex items-center gap-1.5">
                      <span>Tipe</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center cursor-pointer hover:text-white" onClick={() => handleSortToggle("products")}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Jumlah Produk</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center cursor-pointer hover:text-white" onClick={() => handleSortToggle("isActive")}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center cursor-pointer hover:text-white" onClick={() => handleSortToggle("sortOrder")}>
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Urutan</span>
                      <ArrowUpDown className="w-3 h-3 text-cyber-muted/50" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((cat, index) => {
                  const absoluteIndex = indexOfFirstItem + index;
                  return (
                    <tr
                      key={cat.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, absoluteIndex)}
                      onDragOver={(e) => handleDragOver(e, absoluteIndex)}
                      onDrop={(e) => handleDrop(e, absoluteIndex)}
                      className={`border-b border-accent-primary/5 hover:bg-accent-primary/2 transition-colors align-middle select-none ${
                        dragOverIdx === absoluteIndex ? "border-t-2 border-t-accent-secondary" : ""
                      }`}
                    >
                      {/* Drag Handle */}
                      <td className="p-3.5 text-center text-cyber-muted/40 cursor-grab active:cursor-grabbing hover:text-accent-primary transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          <GripVertical className="w-4 h-4 shrink-0" />
                        </div>
                      </td>

                      {/* Name with Icon */}
                      <td className="p-3.5 font-bold text-white uppercase tracking-wide">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 bg-cyber-bg border border-accent-primary/15 rounded-xs">
                            {renderCategoryIcon(cat.icon)}
                          </span>
                          <span>{cat.name}</span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="p-3.5 font-mono text-accent-primary select-all">
                        /{cat.slug}
                      </td>

                      {/* Type badge */}
                      <td className="p-3.5">
                        {renderTypeBadge(cat.type)}
                      </td>

                      {/* Products Count */}
                      <td className="p-3.5 text-center font-mono font-bold text-white text-xs">
                        {cat._count?.products || 0} Unit
                      </td>

                      {/* Status toggle toggle switches */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-extrabold uppercase transition-all border shrink-0 cursor-pointer ${
                            cat.isActive
                              ? "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30 shadow-[0_0_6px_rgba(37,211,102,0.08)]"
                              : "bg-red-500/10 text-red-500 border-red-500/30"
                          }`}
                        >
                          {cat.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>

                      {/* Sort order value */}
                      <td className="p-3.5 text-center font-mono font-bold text-cyber-muted text-xs">
                        {cat.sortOrder}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCatName(cat.name);
                              setCatSlug(cat.slug);
                              setCatIcon(cat.icon || "Tv");
                              setCatType(cat.type);
                              setCatSortOrder(cat.sortOrder);
                              setCatIsActive(cat.isActive);
                            }}
                            className="p-1.5 text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/15 border border-accent-primary/20 hover:border-accent-primary transition-all rounded-xs cursor-pointer"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={async () => {
                              if (await window.confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
                                handleDeleteCategory(cat);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:text-white bg-red-950/5 hover:bg-red-950 border border-red-500/10 hover:border-red-500 transition-all rounded-xs cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. Table Pagination visual footer */}
          <div className="bg-[#0A0A0F] border-t border-accent-primary/15 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-cyber-muted font-mono text-[10px]">
            <div className="flex items-center gap-3">
              <span>Tampilkan baris:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-cyber-bg border border-accent-primary/20 px-2 py-1 text-white text-[10px] focus:outline-none"
              >
                <option value={5}>5 Baris</option>
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
              </select>
              <span>Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} dari {totalItems} Kategori</span>
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary text-white disabled:opacity-40 disabled:pointer-events-none rounded-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3.5 py-1 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 bg-cyber-bg border border-accent-primary/20 hover:border-accent-primary text-white disabled:opacity-40 disabled:pointer-events-none rounded-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-accent-primary/15 bg-cyber-card/10 rounded-xs">
          <Folder className="w-12 h-12 text-cyber-muted mx-auto mb-4 animate-pulse" />
          <h3 className="font-orbitron font-semibold text-lg text-white uppercase mb-1">KATEGORI KOSONG</h3>
          <p className="text-xs text-cyber-muted">Katalog kategori kosong atau filter pencarian Anda tidak memiliki hasil.</p>
        </div>
      )}

      {/* 5. MODAL: ADD CATEGORY */}
      {showAddModal && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left shadow-[0_0_30px_rgba(0,245,255,0.15)]">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setShowAddModal(false)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-lg text-white mb-5 uppercase tracking-widest text-neon">
              // INPUT DATA KATEGORI BARU
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Akun Premium"
                  value={catName}
                  onChange={(e) => handleNameChange(e.target.value, "add")}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans uppercase"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">SEO Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: akun-premium"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Tipe Kategori *</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
                  >
                    <option value="PREMIUM_ACCOUNT">Premium Account</option>
                    <option value="GAME_TOPUP">Game Topup</option>
                    <option value="LICENSE">Software License</option>
                  </select>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Pilihan Ikon *</label>
                  <select
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
                  >
                    <option value="Tv">TV SCREEN (Tv)</option>
                    <option value="Gamepad">GAMEPAD (Gamepad)</option>
                    <option value="Key">LOCK KEY (Key)</option>
                    <option value="Folder">FOLDER DEFL (Folder)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                {/* sortOrder */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Urutan Display</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>

                {/* Status Toggle checkbox */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Status Aktif</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1 font-sans text-xs">
                    <input
                      type="checkbox"
                      checked={catIsActive}
                      onChange={(e) => setCatIsActive(e.target.checked)}
                      className="rounded-sm bg-cyber-bg border-accent-primary/30 checked:bg-accent-primary text-black focus:ring-0 cursor-pointer w-4.5 h-4.5"
                    />
                    <span className="text-white uppercase tracking-wider font-bold">AKTIFKAN</span>
                  </label>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-black hover:bg-white transition-all text-xs font-orbitron font-extrabold tracking-widest cursor-pointer rounded-xs"
                >
                  SAVE KATEGORI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: EDIT CATEGORY */}
      {editingCategory && (
        <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F1A] border border-accent-primary p-6 relative rounded-xs text-left shadow-[0_0_30px_rgba(0,245,255,0.15)]">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => setEditingCategory(null)}>
              <X className="w-5 h-5" />
            </span>

            <h3 className="font-orbitron font-bold text-lg text-white mb-5 uppercase tracking-widest text-neon">
              // MODIFIKASI DATA KATEGORI
            </h3>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => handleNameChange(e.target.value, "edit")}
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans uppercase"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">SEO Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    })
                  }
                  className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Tipe Kategori *</label>
                  <select
                    value={editingCategory.type}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
                  >
                    <option value="PREMIUM_ACCOUNT">Premium Account</option>
                    <option value="GAME_TOPUP">Game Topup</option>
                    <option value="LICENSE">Software License</option>
                  </select>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Pilihan Ikon *</label>
                  <select
                    value={editingCategory.icon || "Tv"}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        icon: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-sans"
                  >
                    <option value="Tv">TV SCREEN (Tv)</option>
                    <option value="Gamepad">GAMEPAD (Gamepad)</option>
                    <option value="Key">LOCK KEY (Key)</option>
                    <option value="Folder">FOLDER DEFL (Folder)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                {/* sortOrder */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Urutan Display</label>
                  <input
                    type="number"
                    min={0}
                    value={editingCategory.sortOrder}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        sortOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-cyber-bg border border-accent-primary/25 focus:border-accent-primary focus:outline-none text-white text-xs font-mono"
                  />
                </div>

                {/* Status Toggle checkbox */}
                <div>
                  <label className="block text-cyber-muted mb-1.5 font-mono uppercase text-[9px]">Status Aktif</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1 font-sans text-xs">
                    <input
                      type="checkbox"
                      checked={editingCategory.isActive}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded-sm bg-cyber-bg border-accent-primary/30 checked:bg-accent-primary text-black focus:ring-0 cursor-pointer w-4.5 h-4.5"
                    />
                    <span className="text-white uppercase tracking-wider font-bold">AKTIFKAN</span>
                  </label>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 text-right">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-primary text-black hover:bg-white transition-all text-xs font-orbitron font-extrabold tracking-widest cursor-pointer rounded-xs"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: SAFETY DELETION MIGRATION GUARD */}
      {showMigrationModal && deletingCategory && (
        <div className="fixed inset-0 z-55 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F0F1A] border-2 border-red-500 p-6 relative rounded-xs text-left shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <span className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center text-cyber-muted hover:text-white cursor-pointer" onClick={() => {
              setShowMigrationModal(false);
              setDeletingCategory(null);
            }}>
              <X className="w-5 h-5" />
            </span>

            <span className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </span>

            <h3 className="font-orbitron font-black text-base text-red-500 tracking-wider text-center uppercase mb-2">
              KATEGORI INI MASIH DIOPERASIKAN!
            </h3>
            
            <p className="text-xs text-cyber-muted text-center leading-relaxed mb-5">
              Kategori <strong className="text-white font-bold font-mono">"{deletingCategory.name}"</strong> saat ini masih dikaitkan dengan <strong className="text-[#00F5FF] font-bold font-mono">{productCount} produk aktif</strong>. Menghapusnya secara langsung akan merusak data catalog produk di database.
            </p>

            <div className="bg-[#0A0A0F] border border-red-500/20 p-4 rounded-xs mb-6">
              <label className="block text-[#00F5FF] text-[9px] font-mono uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                <FolderInput className="w-3.5 h-3.5 shrink-0" />
                <span>PILIH KATEGORI TUJUAN MIGRASI</span>
              </label>

              {categories.filter((c) => c.id !== deletingCategory.id && c.isActive).length > 0 ? (
                <select
                  value={migrationTargetId}
                  onChange={(e) => setMigrationTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-cyber-bg border border-red-500/30 focus:border-red-500 focus:outline-none text-white text-xs font-sans"
                >
                  {categories
                    .filter((c) => c.id !== deletingCategory.id && c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.toUpperCase()} ({c.type})
                      </option>
                    ))}
                </select>
              ) : (
                <div className="text-red-400 font-mono text-[10px] uppercase text-center py-2">
                  TIDAK ADA KATEGORI AKTIF LAIN UNTUK MIGRASI. SILAKAN BUAT KATEGORI BARU LEBIH DULU.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowMigrationModal(false);
                  setDeletingCategory(null);
                }}
                className="px-4 py-2 border border-cyber-muted/30 hover:border-white text-cyber-muted hover:text-white transition-colors text-xs font-orbitron font-semibold cursor-pointer rounded-xs"
              >
                BATALKAN
              </button>

              <button
                type="button"
                disabled={!migrationTargetId}
                onClick={() => handleDeleteCategory(deletingCategory, Number(migrationTargetId))}
                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all text-xs font-orbitron font-black tracking-widest cursor-pointer rounded-xs"
              >
                HAPUS & PINDAHKAN PRODUK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
