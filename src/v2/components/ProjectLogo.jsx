// Project logo on a halftone plate; projects without a logo image get a drawn glyph.
export default function ProjectLogo({ project, className = '' }) {
  return (
    <div className={`plogo ${className}`}>
      <div className="plogo-tone" aria-hidden="true" />
      {project.logo ? (
        <img src={project.logo} alt={`${project.title} logo`} loading="lazy" />
      ) : project.glyph === 'target' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-label={`${project.title} logo`}>
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-label={`${project.title} logo`}>
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="21" x2="9" y2="9" />
          <line x1="3" y1="9" x2="21" y2="9" /><path d="M14 13h3m-3 3h4" />
        </svg>
      )}
    </div>
  );
}
