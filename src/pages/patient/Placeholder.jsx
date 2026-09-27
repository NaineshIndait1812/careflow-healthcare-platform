/**
 * Clean placeholder for routes not yet implemented.
 * Accepts `icon`, `title`, `description` props.
 */
export default function Placeholder({ icon = '🚧', title, description }) {
  return (
    <div className="placeholder-page">
      <div className="ph-icon">{icon}</div>
      <h3>{title || 'Coming Soon'}</h3>
      <p>{description || 'This section is under construction and will be available soon.'}</p>
    </div>
  )
}
