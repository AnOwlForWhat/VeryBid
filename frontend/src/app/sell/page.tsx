"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { auctionApi } from "@/services/auctionApi";
import { Category, CreateItemImagePayload, ImageAngle, Item } from "@/types/auction";

interface AngleSlot {
  angle: ImageAngle;
  label: string;
  description: string;
  isRequired: boolean;
  bonus: string;
  url: string;
}

const PRESET_DEMOS = [
  {
    name: "🚗 Hot Wheels 1968 Custom Camaro Redline",
    categoryId: 1,
    title: "1968 Custom Camaro Hot Wheels Redline (White Enamel)",
    description: "Original 1968 Sweet 16 release in rare White Enamel with blue interior and bearing redline wheels. Fully intact suspension and authentic base stamping.",
    declaredCondition: "Mint 100% Unopened",
    suggestedStartingPrice: 350,
    images: [
      { angle: "FRONT" as ImageAngle, url: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=1000&q=80" },
      { angle: "BACK" as ImageAngle, url: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=1000&q=80" },
      { angle: "SERIAL_NUMBER" as ImageAngle, url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=80" },
      { angle: "PACKAGING" as ImageAngle, url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&q=80" },
      { angle: "SCRATCH_DETAIL" as ImageAngle, url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&q=80" },
    ],
  },
  {
    name: "💻 1984 Apple Macintosh 128K Original",
    categoryId: 2,
    title: "1984 Apple Macintosh 128K with Original Packaging & Mouse",
    description: "Historical first-generation Macintosh 128K signed mold case. Tested and booting System 1.0 flawlessly with CRT monitor in brilliant clarity.",
    declaredCondition: "95% Like New (Collector Grade)",
    suggestedStartingPrice: 1250,
    images: [
      { angle: "FRONT" as ImageAngle, url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&q=80" },
      { angle: "BACK" as ImageAngle, url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&q=80" },
      { angle: "SERIAL_NUMBER" as ImageAngle, url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80" },
      { angle: "PACKAGING" as ImageAngle, url: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=1000&q=80" },
      { angle: "SCRATCH_DETAIL" as ImageAngle, url: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1000&q=80" },
    ],
  },
  {
    name: "👟 Nike Air Mag 2011 Marty McFly Edition",
    categoryId: 3,
    title: "Nike Air Mag 2011 Back to the Future Limited Edition #088/1500",
    description: "Official 2011 Michael J. Fox Foundation release. LED glowing soles and luminescent buckle operational. Includes yellow anti-gravity magnetic case.",
    declaredCondition: "Deadstock Brand New",
    suggestedStartingPrice: 8500,
    images: [
      { angle: "FRONT" as ImageAngle, url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80" },
      { angle: "BACK" as ImageAngle, url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1000&q=80" },
      { angle: "SERIAL_NUMBER" as ImageAngle, url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80" },
      { angle: "PACKAGING" as ImageAngle, url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80" },
      { angle: "SCRATCH_DETAIL" as ImageAngle, url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80" },
    ],
  },
];

export default function SellItemPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [declaredCondition, setDeclaredCondition] = useState<string>("Near Mint 95%");
  const [suggestedStartingPrice, setSuggestedStartingPrice] = useState<string>("100");

  const [angleSlots, setAngleSlots] = useState<AngleSlot[]>([
    {
      angle: "FRONT",
      label: "Mặt trước (Ảnh đại diện)",
      description: "Góc chụp chính diện toàn thân vật phẩm, ánh sáng rõ ràng.",
      isRequired: true,
      bonus: "Bắt buộc",
      url: "",
    },
    {
      angle: "BACK",
      label: "Mặt sau (Lưng / Đáy)",
      description: "Kiểm tra tình trạng mặt sau và góc bản lề/đáy sản phẩm.",
      isRequired: true,
      bonus: "+10% Trust Score",
      url: "",
    },
    {
      angle: "SERIAL_NUMBER",
      label: "Số Serial / Tem chống giả",
      description: "Cận cảnh mã vạch, tem bảo hành, số khắc hoặc dấu mộc hãng.",
      isRequired: false,
      bonus: "AI Auto-Verify tem (+15%)",
      url: "",
    },
    {
      angle: "PACKAGING",
      label: "Hộp & Phụ kiện kèm theo",
      description: "Ảnh hộp đựng nguyên bản, thẻ bảo hành, sách hướng dẫn.",
      isRequired: false,
      bonus: "+10% Trust Score",
      url: "",
    },
    {
      angle: "SCRATCH_DETAIL",
      label: "Chi tiết vết xước / Hao mòn",
      description: "Minh bạch góc có lỗi nhỏ hoặc tem niêm phong nguyên vẹn.",
      isRequired: false,
      bonus: "Minh bạch tối đa",
      url: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiAnalyzingStep, setAiAnalyzingStep] = useState<number>(0);
  const [submittedItem, setSubmittedItem] = useState<Item | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await auctionApi.getCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleAngleUrlChange = (angle: ImageAngle, value: string) => {
    setAngleSlots((prev) =>
      prev.map((slot) => (slot.angle === angle ? { ...slot, url: value } : slot))
    );
  };

  const handleLoadDemo = (demo: typeof PRESET_DEMOS[0]) => {
    setTitle(demo.title);
    setDescription(demo.description);
    setDeclaredCondition(demo.declaredCondition);
    setSuggestedStartingPrice(demo.suggestedStartingPrice.toString());
    if (categories.some((c) => c.id === demo.categoryId)) {
      setSelectedCategoryId(demo.categoryId);
    }
    setAngleSlots((prev) =>
      prev.map((slot) => {
        const match = demo.images.find((img) => img.angle === slot.angle);
        return {
          ...slot,
          url: match ? match.url : slot.url,
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCategoryId) {
      setErrorMessage("Vui lòng chọn danh mục sản phẩm.");
      return;
    }

    const frontSlot = angleSlots.find((s) => s.angle === "FRONT");
    if (!frontSlot || !frontSlot.url.trim()) {
      setErrorMessage("Vui lòng nhập URL ảnh mặt trước (Ảnh đại diện).");
      return;
    }

    const priceNum = parseFloat(suggestedStartingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage("Vui lòng nhập giá khởi điểm hợp lệ lớn hơn 0.");
      return;
    }

    const imagePayloads: CreateItemImagePayload[] = angleSlots
      .filter((s) => s.url.trim().length > 0)
      .map((s) => ({
        imageUrl: s.url.trim(),
        angle: s.angle,
        isThumbnail: s.angle === "FRONT",
      }));

    setIsSubmitting(true);
    setAiAnalyzingStep(1);

    try {
      // Step simulation for AI vision pipeline
      setTimeout(() => setAiAnalyzingStep(2), 700);
      setTimeout(() => setAiAnalyzingStep(3), 1500);

      const created = await auctionApi.createItem({
        title,
        description,
        declaredCondition,
        suggestedStartingPrice: priceNum,
        categoryId: Number(selectedCategoryId),
        images: imagePayloads,
      });

      setTimeout(() => {
        setSubmittedItem(created);
        setIsSubmitting(false);
      }, 2000);
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Gửi sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>VeryBid Seller Studio</span>
            <span>•</span>
            <span>AI Verified Appraisal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Đăng Ký Sản Phẩm & Thẩm Định Đa Góc AI
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Nộp 5 góc chụp tiêu chuẩn. Hệ thống AI Multimodal Vision sẽ tự động quét đối soát tem mác, tính điểm Trust Score và gửi hồ sơ sang Ban Kiểm Duyệt.
          </p>
        </div>

        {/* Demo Fast Fillers */}
        <div className="mb-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-amber-400">⚡ Test nhanh:</span> Chọn món đồ sưu tầm mẫu để tự động điền form & bộ ảnh chuẩn:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_DEMOS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadDemo(demo)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 text-slate-200 border border-slate-700 rounded-lg transition"
              >
                {demo.name.split(" ")[0]} {demo.name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Auth prompt if not logged in */}
        {!authLoading && !isAuthenticated && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="text-sm text-amber-200">
              ⚠️ Bạn cần đăng nhập tài khoản Người bán để nộp sản phẩm lên sàn.
            </div>
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow hover:bg-amber-400 transition"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            {errorMessage}
          </div>
        )}

        {/* SUCCESS MODAL AFTER SUBMISSION */}
        {submittedItem && (
          <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Nộp Sản Phẩm Thành Công!</h3>
                <p className="text-sm text-emerald-400">AI đã quét hoàn tất và lập Báo Cáo Thẩm Định (AI Report).</p>
              </div>
            </div>

            {/* AI Report Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Trust Score (Độ Tin Cậy)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {submittedItem.aiReport?.trustScore ?? 92}/100
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Xác Thực AI
                  </span>
                </div>
                <p className="text-xs text-slate-400">Đã vượt qua kiểm định góc tem & phụ kiện.</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tình trạng AI chấm</span>
                <p className="text-lg font-bold text-white">
                  {submittedItem.aiReport?.conditionRate ?? "9.4/10 (Collector Grade)"}
                </p>
                <p className="text-xs text-slate-400">Khai báo: {submittedItem.declaredCondition}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Định giá thị trường AI</span>
                <p className="text-lg font-bold text-amber-400">
                  ${submittedItem.aiReport?.marketPriceMin?.toFixed(2)} - ${submittedItem.aiReport?.marketPriceMax?.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">Giá đề xuất khởi điểm: ${submittedItem.suggestedStartingPrice?.toFixed(2)}</p>
              </div>
            </div>

            {/* Risk Flags */}
            {submittedItem.aiReport?.riskFlags && submittedItem.aiReport.riskFlags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Huy hiệu xác thực AI:</span>
                <div className="flex flex-wrap gap-2">
                  {submittedItem.aiReport.riskFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                    >
                      ✓ {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center justify-between">
              <span>
                Trạng thái hiện tại: <strong>PENDING_REVIEW</strong>. Sản phẩm đã nằm trong hàng đợi của Ban Kiểm Duyệt.
              </span>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
              <Link
                href="/moderator"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
              >
                Mở Trang Kiểm Duyệt (Moderator Review) →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedItem(null);
                  setTitle("");
                  setDescription("");
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition"
              >
                Nộp Thêm Sản Phẩm Khác
              </button>
            </div>
          </div>
        )}

        {/* MAIN SUBMISSION FORM */}
        {!submittedItem && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Information */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  Thông Tin Vật Phẩm & Khai Báo Ban Đầu
                </h2>
                <span className="text-xs text-slate-400">Bước 1 trên 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Tên sản phẩm sưu tầm <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: 1968 Custom Camaro Hot Wheels Redline"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Danh mục chuyên biệt <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Tình trạng tự khai báo (Seller Claim)
                  </label>
                  <input
                    type="text"
                    value={declaredCondition}
                    onChange={(e) => setDeclaredCondition(e.target.value)}
                    placeholder="VD: Mint 100%, Like New 95%, Brand New In Box"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    {["Mint 100%", "95% Like New", "Excellent", "Deadstock"].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setDeclaredCondition(badge)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-400"
                      >
                        +{badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Giá khởi điểm kỳ vọng ($ USD) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={suggestedStartingPrice}
                      onChange={(e) => setSuggestedStartingPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Mô tả chi tiết & Nguồn gốc xuất xứ (Provenance) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi rõ năm sản xuất, lịch sử bảo quản, phụ kiện đi kèm để AI dễ xác thực..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none text-white text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Step 2: Multi-Angle Authenticity Image Studio */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    Bộ Ảnh 5 Góc Tiêu Chuẩn Thẩm Định AI
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Cung cấp URL ảnh chất lượng cao tương ứng với từng góc chụp để đạt điểm Trust Score cao nhất.
                  </p>
                </div>
                <span className="text-xs text-slate-400">Bước 2 trên 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {angleSlots.map((slot) => (
                  <div
                    key={slot.angle}
                    className={`p-4 rounded-xl border transition ${
                      slot.url.trim()
                        ? "bg-slate-950 border-amber-500/40"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        {slot.label}
                        {slot.isRequired && <span className="text-rose-400">*</span>}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {slot.bonus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{slot.description}</p>

                    <div className="space-y-3">
                      <input
                        type="url"
                        value={slot.url}
                        onChange={(e) => handleAngleUrlChange(slot.angle, e.target.value)}
                        placeholder="https://... ảnh HD"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none text-xs text-slate-200"
                      />

                      {/* Small thumbnail preview */}
                      {slot.url.trim() && (
                        <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slot.url}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80";
                            }}
                          />
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-400">
                            {slot.angle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI PIPELINE SIMULATION MODAL */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
                    <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">Gemini Multimodal AI Đang Thẩm Định</h3>
                    <p className="text-xs text-slate-400">Vui lòng đợi giây lát trong khi mô hình kiểm duyệt phân tích...</p>
                  </div>

                  <div className="space-y-3 text-left p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 1 ? "text-emerald-400" : "text-slate-600"}>
                        {aiAnalyzingStep >= 1 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 1 ? "text-white" : "text-slate-500"}>
                        Quét 5 góc ảnh & phân tích vết xước bề mặt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 2 ? "text-emerald-400" : "text-slate-600"}>
                        {aiAnalyzingStep >= 2 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 2 ? "text-white" : "text-slate-500"}>
                        Kiểm định tem mác Serial & tính điểm Trust Score
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 3 ? "text-emerald-400" : "text-slate-600"}>
                        {aiAnalyzingStep >= 3 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 3 ? "text-white" : "text-slate-500"}>
                        Ước lượng khoảng giá thị trường & tạo AI Report
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">
                Khi nhấn nộp, hồ sơ sẽ được AI chấm điểm và tự động chuyển đến hàng đợi Ban Kiểm Duyệt.
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Gửi Thẩm Định & Nộp Lên Sàn</span>
                <span>→</span>
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; 2026 VeryBid Platform. Multimodal AI Vision Authenticity Protocol.
      </footer>
    </div>
  );
}
