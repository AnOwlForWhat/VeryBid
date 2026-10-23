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
    <div className="min-h-screen bg-[#ededec] flex flex-col justify-between p-2 sm:p-4">
      <div className="retro-window max-w-5xl mx-auto w-full">
        <Navbar />

        <main className="p-4 sm:p-6 space-y-6">
          {/* Header Title Box */}
          <div className="retro-box p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-gray-600 uppercase mb-1">
                SELLER STUDIO • 5-ANGLE MULTIMODAL VERIFICATION
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Đăng Ký Sản Phẩm & Thẩm Định Đa Góc AI
              </h1>
              <p className="mt-1 text-sm text-gray-700">
                Nộp 5 góc chụp tiêu chuẩn. AI Gemini Vision sẽ quét đối soát tem mác và cấp chứng thư Trust Score.
              </p>
            </div>

            <Link href="/moderator" className="retro-btn text-xs bg-gray-100 font-bold self-start sm:self-center">
              Xem Hàng Đợi Duyệt →
            </Link>
          </div>

          {/* Quick Demo Pre-fillers */}
          <div className="retro-box p-3 bg-yellow-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
            <div>
              <span className="font-bold">⚡ Nạp nhanh mẫu kiểm thử:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_DEMOS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadDemo(demo)}
                  className="retro-btn py-0.5 px-2 text-xs bg-white"
                >
                  {demo.name.split(" ")[0]} {demo.name.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Auth warning */}
          {!authLoading && !isAuthenticated && (
            <div className="p-3 border-2 border-black bg-yellow-100 flex items-center justify-between text-sm">
              <div>⚠️ Bạn cần đăng nhập tài khoản Người bán để nộp sản phẩm lên sàn.</div>
              <Link href="/auth/login" className="retro-btn retro-btn-primary font-bold text-xs">
                Đăng Nhập
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 border-2 border-red-600 bg-red-100 text-red-900 text-sm font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* SUCCESS MODAL AFTER SUBMISSION */}
          {submittedItem && (
            <div className="retro-box p-6 bg-yellow-50 border-2 border-black space-y-4">
              <div className="border-b-2 border-black pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black">✓ Nộp Sản Phẩm Thành Công!</h3>
                  <p className="text-sm text-gray-700">AI đã hoàn tất quét 5 góc ảnh và lập Báo Cáo Thẩm Định.</p>
                </div>
                <span className="retro-badge bg-emerald-200 text-emerald-950 font-bold">
                  PENDING_REVIEW
                </span>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-black p-3 bg-white text-center">
                  <span className="text-xs text-gray-500 uppercase block font-bold">Trust Score AI</span>
                  <div className="text-3xl font-black text-emerald-800">
                    {submittedItem.aiReport?.trustScore ?? 92}/100
                  </div>
                </div>

                <div className="border border-black p-3 bg-white text-center">
                  <span className="text-xs text-gray-500 uppercase block font-bold">Tình trạng AI chấm</span>
                  <div className="text-base font-bold mt-1">
                    {submittedItem.aiReport?.conditionRate ?? "9.4/10"}
                  </div>
                </div>

                <div className="border border-black p-3 bg-white text-center">
                  <span className="text-xs text-gray-500 uppercase block font-bold">Khoảng giá ước tính</span>
                  <div className="text-base font-bold text-blue-900 mt-1">
                    ${submittedItem.aiReport?.marketPriceMin?.toFixed(2)} - ${submittedItem.aiReport?.marketPriceMax?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Risk Flags */}
              {submittedItem.aiReport?.riskFlags && submittedItem.aiReport.riskFlags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-300">
                  {submittedItem.aiReport.riskFlags.map((flag, idx) => (
                    <span key={idx} className="retro-badge bg-white text-xs font-bold">
                      ✓ {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-3 border-t-2 border-black">
                <Link href="/moderator" className="retro-btn retro-btn-primary font-bold">
                  Mở Ban Kiểm Duyệt Để Duyệt Ngay →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedItem(null);
                    setTitle("");
                    setDescription("");
                  }}
                  className="retro-btn bg-white"
                >
                  Nộp Thêm Sản Phẩm Khác
                </button>
              </div>
            </div>
          )}

          {/* MAIN FORM */}
          {!submittedItem && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Info */}
              <div className="retro-box p-4 bg-white space-y-4">
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <strong className="text-base">[01] THÔNG TIN SẢN PHẨM KHAI BÁO</strong>
                  <span className="retro-badge text-xs">BƯỚC 1 / 2</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-bold mb-1">
                      Tên món đồ sưu tầm <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: 1968 Custom Camaro Hot Wheels Redline"
                      className="retro-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Danh mục chuyên biệt <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                      className="retro-select w-full"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Tình trạng tự khai báo (Seller Claim)
                    </label>
                    <input
                      type="text"
                      value={declaredCondition}
                      onChange={(e) => setDeclaredCondition(e.target.value)}
                      className="retro-input w-full"
                    />
                    <div className="flex gap-1.5 mt-1">
                      {["Mint 100%", "95% Like New", "Excellent", "Deadstock"].map((badge) => (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => setDeclaredCondition(badge)}
                          className="retro-badge text-xs bg-gray-100 hover:bg-yellow-200 cursor-pointer"
                        >
                          +{badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Giá khởi điểm kỳ vọng ($ USD) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={suggestedStartingPrice}
                      onChange={(e) => setSuggestedStartingPrice(e.target.value)}
                      className="retro-input w-full font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    Mô tả chi tiết & Nguồn gốc xuất xứ (Provenance) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ghi rõ năm sản xuất, lịch sử bảo quản để AI Gemini dễ đối soát..."
                    className="retro-input w-full"
                  />
                </div>
              </div>

              {/* Step 2: 5 Angles */}
              <div className="retro-box p-4 bg-white space-y-4">
                <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                  <strong className="text-base">[02] BỘ ẢNH 5 GÓC CHỤP THẨM ĐỊNH AI</strong>
                  <span className="retro-badge text-xs">BƯỚC 2 / 2</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {angleSlots.map((slot) => (
                    <div key={slot.angle} className="border-2 border-black p-3 bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>
                          {slot.label} {slot.isRequired && <span className="text-red-600">*</span>}
                        </strong>
                        <span className="retro-badge bg-yellow-200 text-[11px] font-bold">
                          {slot.bonus}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{slot.description}</p>
                      <input
                        type="url"
                        value={slot.url}
                        onChange={(e) => handleAngleUrlChange(slot.angle, e.target.value)}
                        placeholder="https://... URL ảnh HD"
                        className="retro-input w-full text-xs py-1"
                      />

                      {slot.url.trim() && (
                        <div className="h-24 w-full border border-black overflow-hidden bg-white">
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI SIMULATION MODAL (Clean retro dialog, NO green text on black) */}
              {isSubmitting && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="retro-window max-w-md w-full p-6 text-center space-y-4 bg-white">
                    <div className="text-3xl font-mono">⌛ [ GEMINI VISION SCANNING... ]</div>
                    <p className="text-sm text-gray-700">Mô hình AI đang đối soát 5 góc ảnh và tính toán Trust Score...</p>

                    <div className="space-y-2 text-left border-2 border-black p-3 bg-gray-50 text-xs font-mono">
                      <div>{aiAnalyzingStep >= 1 ? "✓ [OK]" : "○ [...]"} Quét lỗi trầy xước & phân giải ảnh</div>
                      <div>{aiAnalyzingStep >= 2 ? "✓ [OK]" : "○ [...]"} Xác minh tem kiểm định & mã serial</div>
                      <div>{aiAnalyzingStep >= 3 ? "✓ [OK]" : "○ [...]"} Tính toán Trust Score & biên độ giá</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="retro-box p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Khi bấm nộp, hồ sơ sẽ được AI chấm điểm và tự động chuyển đến Ban Kiểm Duyệt.
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="retro-btn retro-btn-primary font-black px-6 py-2.5 text-base"
                >
                  GỬI THẨM ĐỊNH & NỘP LÊN SÀN →
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
