interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
  return (
    <div className={className}>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">{title}</h1>
      {subtitle && <p className="text-lg md:text-xl text-[#B4B4B4] max-w-2xl">{subtitle}</p>}
    </div>
  )
}
