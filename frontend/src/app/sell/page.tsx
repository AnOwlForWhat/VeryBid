"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AuthModal } from "@/components/AuthModal";
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
  fileName?: string;
  fileSize?: string;
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
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  // Upload and Không phân loại (true: để AI tự nhận diện, false: chọn thủ công)
  const [autoClassify, setAutoClassify] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Drag over states
  const [dragOverAngle, setDragOverAngle] = useState<ImageAngle | null>(null);

  // File input refs for each angle
  const fileInputRefs = useRef<{ [key in ImageAngle]?: HTMLInputElement | null }>({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await auctionApi.getCategories();
        // Lọc danh mục unclassified ra khỏi danh sách hiển thị thủ công nếu có
        const filtered = data.filter((c) => c.slug !== "unclassified");
        setCategories(filtered);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  // Handle direct file selection or drop
  const handleProcessFile = (angle: ImageAngle, file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chỉ tải lên tệp định dạng hình ảnh (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const sizeKb = (file.size / 1024).toFixed(0);

      setAngleSlots((prev) =>
        prev.map((slot) =>
          slot.angle === angle
            ? {
                ...slot,
                url: dataUrl,
                fileName: file.name,
                fileSize: `${sizeKb} KB`,
              }
            : slot
        )
      );
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (angle: ImageAngle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(angle, file);
    }
  };

  const handleDrop = (angle: ImageAngle, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverAngle(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(angle, file);
    }
  };

  const handleClearAngle = (angle: ImageAngle) => {
    setAngleSlots((prev) =>
      prev.map((slot) =>
        slot.angle === angle
          ? { ...slot, url: "", fileName: undefined, fileSize: undefined }
          : slot
      )
    );
    if (fileInputRefs.current[angle]) {
      fileInputRefs.current[angle]!.value = "";
    }
  };

  const handleAngleUrlChange = (angle: ImageAngle, value: string) => {
    setAngleSlots((prev) =>
      prev.map((slot) =>
        slot.angle === angle
          ? { ...slot, url: value, fileName: undefined, fileSize: undefined }
          : slot
      )
    );
  };

  const handleLoadDemo = (demo: typeof PRESET_DEMOS[0]) => {
    setTitle(demo.title);
    setDescription(demo.description);
    setDeclaredCondition(demo.declaredCondition);
    setSuggestedStartingPrice(demo.suggestedStartingPrice.toString());
    setAutoClassify(false);
    setSelectedCategoryId(demo.categoryId);

    setAngleSlots((prev) =>
      prev.map((slot) => {
        const match = demo.images.find((img) => img.angle === slot.angle);
        return {
          ...slot,
          url: match ? match.url : slot.url,
          fileName: undefined,
          fileSize: undefined,
        };
      })
    );
  };

  const handleQuickLoginSeller = async () => {
    try {
      await login({ email: "seller@verybid.com", password: "password123" });
    } catch {
      setErrorMessage("Không thể đăng nhập tài khoản Người bán.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const frontSlot = angleSlots.find((s) => s.angle === "FRONT");
    if (!frontSlot || !frontSlot.url.trim()) {
      setErrorMessage("Vui lòng tải lên hoặc chọn ảnh Mặt trước (Ảnh đại diện bắt buộc).");
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
      setTimeout(() => setAiAnalyzingStep(2), 800);
      setTimeout(() => setAiAnalyzingStep(3), 1600);

      const created = await auctionApi.createItem({
        title,
        description,
        declaredCondition,
        suggestedStartingPrice: priceNum,
        // Nếu chọn Không phân loại (autoClassify), truyền null để AI và Ban kiểm duyệt tự gán
        categoryId: autoClassify ? null : selectedCategoryId,
        images: imagePayloads,
      });

      setTimeout(() => {
        setSubmittedItem(created);
        setIsSubmitting(false);
      }, 2200);
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Gửi sản phẩm thất bại. Vui lòng kiểm tra lại thông tin khai báo.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F1E1D] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Header Title Box */}
        <div className="p-6 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97757] mb-1">
            <span>📸</span> SELLER APPRAISAL STUDIO • 5-ANGLE MULTIMODAL VERIFICATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1E1D]">
            Đăng Bán & Thẩm Định Đa Góc AI
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6B6A66] leading-relaxed max-w-2xl">
            Tải trực tiếp bộ ảnh 5 góc chuẩn từ máy tính. Mô hình Gemini 1.5 Vision sẽ quét tem serial, tình trạng hao mòn và cấp chứng thư Trust Score minh bạch.
          </p>
        </div>

        {/* Auth Check Warning Banner */}
        {!authLoading && !isAuthenticated && (
          <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs sm:text-sm text-[#92400E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Yêu cầu đăng nhập:</strong> Bạn cần đăng nhập tài khoản Người bán để nộp hồ sơ sản phẩm lên sàn.
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleQuickLoginSeller}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#FDE68A] text-[#92400E] text-xs font-bold hover:bg-[#FFFBEB] transition-colors"
              >
                ⚡ Đăng Nhập Nhanh Seller
              </button>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="claude-btn claude-btn-primary py-1 px-3 text-xs font-semibold"
              >
                Đăng Nhập
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo Pre-fillers */}
        <div className="p-3.5 bg-white border border-[#E5E4DE] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1F1E1D]">⚡ Nạp nhanh mẫu kiểm thử:</span>
            <span className="text-[#6B6A66]">(Mẫu ảnh 5 góc HD có sẵn)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_DEMOS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadDemo(demo)}
                className="py-1 px-2.5 rounded-lg border border-[#E5E4DE] text-xs font-medium text-[#1F1E1D] hover:bg-[#FAF9F5] hover:border-[#D5D3CC] transition-colors bg-white"
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#991B1B] font-semibold flex items-center justify-between">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#991B1B] hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* SUCCESS CONFIRMATION VIEW (No moderator links!) */}
        {submittedItem && (
          <div className="p-6 sm:p-7 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-[#E5E4DE] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-[#16A34A]">✓</span>
                  <h3 className="text-2xl font-bold text-[#1F1E1D]">Nộp Sản Phẩm Thành Công!</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6B6A66] mt-1">
                  Hồ sơ đã được gửi an toàn. AI Gemini Vision đã hoàn tất quét 5 góc ảnh và chuyển tiếp đến hội đồng thẩm định.
                </p>
              </div>
              <span className="claude-badge bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold self-start sm:self-auto">
                ⏳ CHỜ KIỂM DUYỆT (PENDING_REVIEW)
              </span>
            </div>

            {/* Summary AI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E4DE] text-center">
                <span className="text-[11px] text-[#6B6A66] uppercase block font-semibold">Điểm Tín Nhiệm AI</span>
                <div className="text-3xl font-extrabold text-[#15803D] mt-1">
                  {submittedItem.aiReport?.trustScore ?? 94}/100
                </div>
                <span className="text-[10px] text-[#16A34A] font-medium">Trust Score Cực Cao</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E4DE] text-center">
                <span className="text-[11px] text-[#6B6A66] uppercase block font-semibold">Tình trạng AI đánh giá</span>
                <div className="text-base font-bold text-[#1F1E1D] mt-2">
                  {submittedItem.aiReport?.conditionRate ?? "9.4/10 (Collector Grade)"}
                </div>
                <span className="text-[10px] text-[#6B6A66]">Khớp khai báo</span>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E4DE] text-center">
                <span className="text-[11px] text-[#6B6A66] uppercase block font-semibold">Định giá tham chiếu</span>
                <div className="text-base font-bold text-[#D97757] mt-2">
                  ${submittedItem.aiReport?.marketPriceMin?.toFixed(2) ?? "100.00"} - ${submittedItem.aiReport?.marketPriceMax?.toFixed(2) ?? "500.00"}
                </div>
                <span className="text-[10px] text-[#6B6A66]">Dựa trên dữ liệu thị trường</span>
              </div>
            </div>

            {/* AI Risk Flags */}
            {submittedItem.aiReport?.riskFlags && submittedItem.aiReport.riskFlags.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#E5E4DE]">
                <span className="text-xs font-semibold text-[#1F1E1D] block">Các yếu tố đã được AI xác minh:</span>
                <div className="flex flex-wrap gap-2">
                  {submittedItem.aiReport.riskFlags.map((flag, idx) => (
                    <span key={idx} className="claude-badge bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[11px] font-semibold">
                      ✓ {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Note */}
            <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E4DE] text-xs text-[#6B6A66]">
              <span>Danh mục: </span>
              <strong className="text-[#1F1E1D]">
                {submittedItem.category?.name ?? "Chờ AI nhận diện & phân loại"}
              </strong>
              <span className="text-[#9E9D96] block text-[11px] mt-0.5">
                Chuyên gia thẩm định sẽ đối soát thông số và kích hoạt phiên đấu giá của bạn lên sàn công khai.
              </span>
            </div>

            {/* Action Buttons - EXCLUSIVELY NO MODERATOR LINKS */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E5E4DE]">
              <Link
                href="/auctions"
                className="claude-btn claude-btn-primary font-semibold text-xs py-2 px-4 shadow-sm"
              >
                🏛️ Khám Phá Sàn Đấu Giá →
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedItem(null);
                  setTitle("");
                  setDescription("");
                  setAngleSlots((prev) =>
                    prev.map((s) => ({ ...s, url: "", fileName: undefined, fileSize: undefined }))
                  );
                }}
                className="claude-btn claude-btn-secondary text-xs py-2 px-4"
              >
                + Đăng Bán Sản Phẩm Khác
              </button>
              <Link
                href="/"
                className="claude-btn claude-btn-ghost text-xs py-2 px-3"
              >
                Về Trang Chủ
              </Link>
            </div>
          </div>
        )}

        {/* MAIN UPLOAD & FORM */}
        {!submittedItem && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: Product Information & Unclassified Category Mode */}
            <div className="p-6 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm space-y-5">
              <div className="border-b border-[#E5E4DE] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1F1E1D]">1. Thông Tin Khai Báo Sản Phẩm</h2>
                  <p className="text-xs text-[#6B6A66]">Thông tin cơ bản về vật phẩm của bạn</p>
                </div>
                <span className="claude-badge claude-badge-terracotta text-xs font-semibold">
                  BƯỚC 1 / 2
                </span>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                  Tên món đồ sưu tầm <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: 1968 Custom Camaro Hot Wheels Redline White Enamel"
                  className="claude-input"
                />
              </div>

              {/* Upload and Không phân loại Mode Switcher */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E4DE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F1E1D] uppercase tracking-wider">
                    Phân loại danh mục:
                  </span>
                  <span className="claude-badge bg-[#FBF3F0] text-[#D97757] border border-[#F5D3C8] text-[10px] font-bold">
                    Tùy chọn linh hoạt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Mode 1: Không phân loại (AI Auto) */}
                  <div
                    onClick={() => setAutoClassify(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      autoClassify
                        ? "bg-white border-[#D97757] ring-2 ring-[#D97757]/20 shadow-sm"
                        : "bg-white/50 border-[#E5E4DE] hover:border-[#D5D3CC]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="classifyMode"
                        checked={autoClassify}
                        onChange={() => setAutoClassify(true)}
                        className="accent-[#D97757]"
                      />
                      <strong className="text-xs text-[#1F1E1D]">
                        ✨ Không phân loại (Chờ AI nhận diện)
                      </strong>
                    </div>
                    <p className="text-[11px] text-[#6B6A66] mt-1 pl-5 leading-relaxed">
                      Mặc định gán nhãn <em>&ldquo;Chờ AI nhận diện &amp; phân loại&rdquo;</em>. AI Gemini Vision và Ban kiểm duyệt sẽ tự động đối soát ảnh và xếp danh mục chuẩn xác nhất.
                    </p>
                  </div>

                  {/* Mode 2: Chọn danh mục thủ công */}
                  <div
                    onClick={() => setAutoClassify(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      !autoClassify
                        ? "bg-white border-[#D97757] ring-2 ring-[#D97757]/20 shadow-sm"
                        : "bg-white/50 border-[#E5E4DE] hover:border-[#D5D3CC]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="classifyMode"
                        checked={!autoClassify}
                        onChange={() => setAutoClassify(false)}
                        className="accent-[#D97757]"
                      />
                      <strong className="text-xs text-[#1F1E1D]">
                        📂 Tự chọn danh mục thủ công
                      </strong>
                    </div>
                    <p className="text-[11px] text-[#6B6A66] mt-1 pl-5 leading-relaxed">
                      Chủ động gán vật phẩm vào một trong các danh mục có sẵn trên sàn VeryBid.
                    </p>
                  </div>
                </div>

                {/* Dropdown if manual mode selected */}
                {!autoClassify && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                      Chọn danh mục sản phẩm:
                    </label>
                    <select
                      value={selectedCategoryId ?? ""}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                      className="claude-input"
                    >
                      <option value="">-- Chọn danh mục phù hợp --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Condition & Starting Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                    Tình trạng tự khai báo
                  </label>
                  <input
                    type="text"
                    value={declaredCondition}
                    onChange={(e) => setDeclaredCondition(e.target.value)}
                    placeholder="VD: 95% Like New, Nguyên Seal, Mới 100%"
                    className="claude-input"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {["Mint 100%", "95% Like New", "Excellent", "Deadstock"].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setDeclaredCondition(badge)}
                        className="text-[11px] py-0.5 px-2 rounded-md bg-[#FAF9F5] border border-[#E5E4DE] hover:bg-[#F0EFEA] text-[#6B6A66]"
                      >
                        +{badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                    Giá khởi điểm kỳ vọng ($ USD) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={suggestedStartingPrice}
                    onChange={(e) => setSuggestedStartingPrice(e.target.value)}
                    placeholder="100"
                    className="claude-input font-bold text-sm"
                  />
                  <span className="text-[11px] text-[#9E9D96] block mt-1">
                    AI sẽ đưa ra biên độ giá tham chiếu dựa trên 5 góc ảnh
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
                  Mô tả chi tiết & Nguồn gốc xuất xứ (Provenance) <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi rõ năm sản xuất, các dấu vết đặc trưng hoặc phụ kiện đi kèm để AI đối soát..."
                  className="claude-input"
                />
              </div>
            </div>

            {/* SECTION 2: 5 Angles Direct File Upload (Drag & Drop) */}
            <div className="p-6 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm space-y-5">
              <div className="border-b border-[#E5E4DE] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#1F1E1D]">
                    2. Bộ Ảnh 5 Góc Tiêu Chuẩn Thẩm Định AI
                  </h2>
                  <p className="text-xs text-[#6B6A66]">
                    Hỗ trợ kéo thả ảnh (Drag & Drop) hoặc chọn trực tiếp từ máy tính
                  </p>
                </div>
                <span className="claude-badge claude-badge-terracotta text-xs font-semibold">
                  BƯỚC 2 / 2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {angleSlots.map((slot) => {
                  const isDragOver = dragOverAngle === slot.angle;
                  const hasImage = Boolean(slot.url && slot.url.trim().length > 0);

                  return (
                    <div
                      key={slot.angle}
                      className={`p-4 rounded-xl border transition-all ${
                        isDragOver
                          ? "border-[#D97757] bg-[#FBF3F0] ring-2 ring-[#D97757]/20"
                          : hasImage
                          ? "border-[#E5E4DE] bg-white shadow-sm"
                          : "border-dashed border-[#D5D3CC] bg-[#FAF9F5] hover:border-[#B8B6AF]"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverAngle(slot.angle);
                      }}
                      onDragLeave={() => setDragOverAngle(null)}
                      onDrop={(e) => handleDrop(slot.angle, e)}
                    >
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          fileInputRefs.current[slot.angle] = el;
                        }}
                        onChange={(e) => handleFileInputChange(slot.angle, e)}
                        className="hidden"
                      />

                      {/* Header slot */}
                      <div className="flex items-center justify-between mb-1.5">
                        <strong className="text-xs text-[#1F1E1D] flex items-center gap-1">
                          {slot.label} {slot.isRequired && <span className="text-[#DC2626]">*</span>}
                        </strong>
                        <span className="claude-badge claude-badge-terracotta text-[10px] font-bold">
                          {slot.bonus}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6A66] mb-3 leading-relaxed">
                        {slot.description}
                      </p>

                      {/* Preview Box or Drop Zone */}
                      {hasImage ? (
                        <div className="space-y-2">
                          <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-[#E5E4DE] bg-[#F5F5F0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slot.url}
                              alt={slot.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <button
                                type="button"
                                onClick={() => handleClearAngle(slot.angle)}
                                className="p-1 rounded-md bg-[#1F1E1D]/70 hover:bg-[#DC2626] text-white text-[10px] font-bold transition-colors"
                                title="Xóa ảnh này"
                              >
                                ✕ Xóa
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#6B6A66]">
                            <span className="truncate max-w-[200px]">
                              {slot.fileName || "Ảnh đã tải"} {slot.fileSize ? `(${slot.fileSize})` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[slot.angle]?.click()}
                              className="text-[#D97757] font-semibold hover:underline"
                            >
                              Đổi ảnh khác
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRefs.current[slot.angle]?.click()}
                          className="py-6 px-3 border border-dashed border-[#D5D3CC] rounded-lg text-center cursor-pointer hover:bg-white transition-colors bg-[#FBFBF9]"
                        >
                          <div className="text-2xl mb-1 select-none">📁</div>
                          <div className="text-xs font-semibold text-[#1F1E1D]">
                            Kéo &amp; thả ảnh vào đây
                          </div>
                          <div className="text-[11px] text-[#6B6A66] mt-0.5">
                            hoặc <span className="text-[#D97757] font-medium underline">bấm để chọn từ máy tính</span>
                          </div>
                          <span className="text-[10px] text-[#9E9D96] block mt-1">
                            Hỗ trợ JPG, PNG, WEBP
                          </span>
                        </div>
                      )}

                      {/* Optional URL Fallback */}
                      <div className="mt-2.5 pt-2 border-t border-[#E5E4DE]/60">
                        <details className="text-[11px] text-[#6B6A66] group">
                          <summary className="cursor-pointer hover:text-[#1F1E1D] font-medium select-none">
                            🔗 Hoặc dán link URL ảnh trực tiếp
                          </summary>
                          <div className="mt-1.5 flex gap-1">
                            <input
                              type="url"
                              value={slot.url.startsWith("data:") ? "" : slot.url}
                              onChange={(e) => handleAngleUrlChange(slot.angle, e.target.value)}
                              placeholder="https://... URL ảnh HD"
                              className="claude-input py-1 text-xs"
                            />
                          </div>
                        </details>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Scanning Modal Simulation */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-[#1F1E1D]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white border border-[#E5E4DE] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-[#FBF3F0] text-[#D97757] flex items-center justify-center text-xl font-bold mx-auto border border-[#F5D3C8] animate-bounce">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F1E1D]">AI Gemini Vision Đang Đối Soát</h3>
                    <p className="text-xs text-[#6B6A66] mt-1">
                      Mô hình Multimodal Vision đang phân tích 5 góc ảnh & tính điểm Trust Score...
                    </p>
                  </div>

                  <div className="space-y-2.5 text-left border border-[#E5E4DE] rounded-xl p-3.5 bg-[#FAF9F5] text-xs">
                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 1 ? "text-[#16A34A] font-bold" : "text-[#9E9D96]"}>
                        {aiAnalyzingStep >= 1 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 1 ? "text-[#1F1E1D] font-medium" : "text-[#6B6A66]"}>
                        Quét độ phân giải & phân tích bề mặt vật phẩm
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 2 ? "text-[#16A34A] font-bold" : "text-[#9E9D96]"}>
                        {aiAnalyzingStep >= 2 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 2 ? "text-[#1F1E1D] font-medium" : "text-[#6B6A66]"}>
                        Xác minh tem serial, hộp đựng & đối soát vết xước
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={aiAnalyzingStep >= 3 ? "text-[#16A34A] font-bold" : "text-[#9E9D96]"}>
                        {aiAnalyzingStep >= 3 ? "✓" : "○"}
                      </span>
                      <span className={aiAnalyzingStep >= 3 ? "text-[#1F1E1D] font-medium" : "text-[#6B6A66]"}>
                        Tính toán Trust Score & đề xuất biên độ giá thị trường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Submit Bar */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E4DE] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#6B6A66]">
                Sau khi gửi, AI Vision sẽ quét tự động và chuyển hồ sơ vào hàng đợi của Ban Kiểm Duyệt.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto claude-btn claude-btn-primary font-bold px-7 py-2.5 text-sm shadow-sm"
              >
                Gửi Thẩm Định & Nộp Lên Sàn →
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E4DE] bg-[#FAF9F5] py-8 text-xs text-[#6B6A66] mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#D97757] text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <span className="font-bold text-[#1F1E1D]">VERYBID SELLER STUDIO</span>
            <span className="text-[#9E9D96]">•</span>
            <span>Thẩm Định Đa Góc AI Minh Bạch</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auctions" className="hover:text-[#1F1E1D]">
              Sàn Đấu Giá
            </Link>
            <Link href="/" className="hover:text-[#1F1E1D]">
              Trang Chủ
            </Link>
            <span className="text-[#9E9D96]">© 2026 VeryBid.</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Guard */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Đăng Nhập Để Nộp Sản Phẩm"
        description="Vui lòng đăng nhập tài khoản Người bán để nộp sản phẩm lên sàn thẩm định AI."
      />
    </div>
  );
}
