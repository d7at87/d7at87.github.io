export default function BackgroundFX() {
  const dots = Array.from({ length: 22 }, (_, i) => i)

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,141,62,0.09),transparent_55%)]" />
      <div className="blob absolute -top-32 -start-32 size-[480px] rounded-full bg-gold-500/[0.08] blur-[130px]" />
      <div
        className="blob absolute top-1/2 -end-40 size-[420px] rounded-full bg-gold-300/[0.12] blur-[130px]"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="blob absolute bottom-0 start-1/3 size-[380px] rounded-full bg-ink-950/[0.04] blur-[120px]"
        style={{ animationDelay: '-4s' }}
      />
      {dots.map((i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: `${(i * 47) % 100}%`,
            top: `${(i * 31) % 100}%`,
            animationDelay: `${(i % 7) * -1.4}s`,
            animationDuration: `${8 + (i % 5) * 2}s`,
          }}
        />
      ))}
    </div>
  )
}
