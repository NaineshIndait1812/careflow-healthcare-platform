export default function BrandMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#F0FDF4" stroke="#DCFCE7" />
      <path d="M12 18h12M18 12v12" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="18" cy="18" r="8.5" stroke="#16A34A" strokeWidth="1.5" />
    </svg>
  )
}
