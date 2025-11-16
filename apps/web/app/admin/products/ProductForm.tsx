"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type VariantInput = {
  name: string;
  sku?: string;
  price?: string;
  availableQty?: string;
};

export type AdminProductInput = {
  title: string;
  description?: string;
  regularPrice: number;
  salePrice?: number | null;
  brand?: string;
  tags?: string[];
  availableQty: number;
  stockStatus?: string;
  categoryIds: string[];
  images: string[];
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  isActive: boolean;
  variants: {
    name: string;
    sku?: string;
    price?: number;
    availableQty?: number;
  }[];
};

export type AdminProductDto = Partial<AdminProductInput> & {
  _id?: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial?: AdminProductDto | null;
};

function normalizeNumber(value: string): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("0");
  const [salePrice, setSalePrice] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [availableQty, setAvailableQty] = useState("0");
  const [stockStatus, setStockStatus] = useState<"auto" | "in_stock" | "out_of_stock" | "backorder">("auto");
  const [categoryIds, setCategoryIds] = useState("");
  const [images, setImages] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setRegularPrice(String(initial.regularPrice ?? initial.price ?? 0));
    setSalePrice(initial.salePrice != null ? String(initial.salePrice) : "");
    setBrand(initial.brand || "");
    setTags((initial.tags || []).join(","));
    setAvailableQty(String(initial.availableQty ?? 0));
    setStockStatus((initial.stockStatus as any) || "auto");
    setCategoryIds((initial.categoryIds || []).join(","));
    setImages((initial.images || []).join(","));
    setWeight(initial.weight != null ? String(initial.weight) : "");
    setDimensions({
      length: initial.dimensions?.length != null ? String(initial.dimensions.length) : "",
      width: initial.dimensions?.width != null ? String(initial.dimensions.width) : "",
      height: initial.dimensions?.height != null ? String(initial.dimensions.height) : "",
    });
    setIsActive(initial.isActive !== false);
    setVariants(
      (initial.variants || []).map((v) => ({
        name: v.name,
        sku: v.sku,
        price: v.price != null ? String(v.price) : "",
        availableQty: v.availableQty != null ? String(v.availableQty) : "",
      })) as VariantInput[],
    );
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // simple validations
    const reg = normalizeNumber(regularPrice) ?? 0;
    const sale = normalizeNumber(salePrice || "");
    if (reg <= 0) {
      setError("Regular price must be greater than 0.");
      return;
    }
    if (sale != null && sale >= reg) {
      setError("Sale price must be less than regular price.");
      return;
    }
    const invalidVariant = variants.find(
      (v) => !v.name.trim() && (v.sku || v.price || v.availableQty),
    );
    if (invalidVariant) {
      setError("Each variant with SKU/price/qty must have a name.");
      return;
    }

    setLoading(true);
    const token = window.localStorage.getItem("b2e_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = {
      title,
      description,
      regularPrice: reg,
      salePrice: sale,
      brand: brand || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      availableQty: normalizeNumber(availableQty) ?? 0,
      stockStatus: stockStatus === "auto" ? undefined : stockStatus,
      categoryIds: categoryIds.split(",").map((c) => c.trim()).filter(Boolean),
      images: images
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
      weight: normalizeNumber(weight),
      dimensions: {
        length: normalizeNumber(dimensions.length),
        width: normalizeNumber(dimensions.width),
        height: normalizeNumber(dimensions.height),
      },
      isActive,
      variants: variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          name: v.name.trim(),
          sku: v.sku || undefined,
          price: normalizeNumber(v.price || ""),
          availableQty: normalizeNumber(v.availableQty || ""),
        })),
    };

    try {
      const url =
        mode === "create"
          ? `${API_URL}/admin/products`
          : `${API_URL}/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to save product");
      }
      router.push("/admin/products");
    } catch (e: any) {
      setError(e.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "create" ? "Add Product" : "Edit Product"}
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Regular Price (PKR)</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded px-3 py-2"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale Price (PKR)</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded px-3 py-2"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="optional"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Available Qty</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded px-3 py-2"
              value={availableQty}
              onChange={(e) => setAvailableQty(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. notebook,back-to-school"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Status</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as any)}
            >
              <option value="auto">Auto (based on qty)</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="backorder">Backorder</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={categoryIds}
              onChange={(e) => setCategoryIds(e.target.value)}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Comma separated IDs, e.g. <code>school,pens</code>
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URLs</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="https://.../image1.jpg, https://.../image2.jpg"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Weight (grams)</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded px-3 py-2 text-sm"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dimensions (L x W x H, cm)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="L"
                value={dimensions.length}
                onChange={(e) => setDimensions((d) => ({ ...d, length: e.target.value }))}
              />
              <input
                type="number"
                min="0"
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="W"
                value={dimensions.width}
                onChange={(e) => setDimensions((d) => ({ ...d, width: e.target.value }))}
              />
              <input
                type="number"
                min="0"
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="H"
                value={dimensions.height}
                onChange={(e) => setDimensions((d) => ({ ...d, height: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm">Active (visible on site)</label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Variants (optional)</label>
          <p className="text-xs text-neutral-500 mb-2">Use this for sizes/colors, e.g. "A4", "A5" or "Red", "Blue".</p>
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 text-xs items-center">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Name (e.g. A4)"
                  value={v.name}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx].name = e.target.value;
                    setVariants(next);
                  }}
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="SKU"
                  value={v.sku || ""}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx].sku = e.target.value;
                    setVariants(next);
                  }}
                />
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Price"
                  value={v.price || ""}
                  onChange={(e) => {
                    const next = [...variants];
                    next[idx].price = e.target.value;
                    setVariants(next);
                  }}
                />
                <div className="flex items-center gap-1">
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Qty"
                    value={v.availableQty || ""}
                    onChange={(e) => {
                      const next = [...variants];
                      next[idx].availableQty = e.target.value;
                      setVariants(next);
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setVariants((prev) => [...prev, { name: "" }])}
            >
              + Add variant
            </button>
          </div>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            className="text-sm text-neutral-600 hover:underline"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
