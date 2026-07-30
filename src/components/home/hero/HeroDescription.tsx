"use client";


export interface HeroDescriptionProps {
  descriptionDuration: number;
  descriptionYOffset: number;
  customTime?: number;
}

export function HeroDescription({
  descriptionDuration,
  descriptionYOffset,
  customTime,
}: HeroDescriptionProps) {
  void descriptionDuration;
  void descriptionYOffset;
  void customTime;
  const descriptionLines = [
    "Câu lạc bộ học thuật hàng đầu tại HCMUT chuyên nghiên cứu",
    "và phát triển trong lĩnh vực Dữ liệu lớn, Trí tuệ nhân tạo,",
    "Điện toán đám mây và Điện toán lượng tử."
  ];

  return (
    <div className="w-full text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl lg:max-w-xl leading-relaxed text-center lg:text-left transition-all duration-200">
      {descriptionLines.map((line, idx) => (
        <span 
          key={idx} 
          className="block overflow-hidden relative py-0.5"
        >
          <span className="inline-block">
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}
