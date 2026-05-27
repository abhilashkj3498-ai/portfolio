import { Link } from 'react-router-dom';
import './Projects.css';

/* Visual panel icons & accent colors per project */
const projectList = [
  {
    title:       'Social Media Promotional Videos',
    description: 'Created engaging promotional videos for businesses and marketing campaigns. Edited short-form content optimized for Instagram Reels and YouTube Shorts, applying cinematic transitions and color grading techniques.',
    tech:        ['Social Media', 'Short-form Video', 'Cinematic Transitions'],
    slug:        'social-media-promotional-videos',
    icon:        '🎬',
    accent:      '#00F0FF',
    accentRgb:   '0, 240, 255',
    gradient:    'linear-gradient(135deg, rgba(0,240,255,0.12) 0%, rgba(176,38,255,0.08) 100%)',
  },
  {
    title:       'Photography Projects',
    description: 'Conducted portrait, event, and product photography shoots for diverse clients. Enhanced and retouched photographs using Lightroom and Photoshop, managing complete post-processing workflows for professional delivery.',
    tech:        ['Portrait & Event', 'Product Shoots', 'Lightroom & Photoshop'],
    slug:        'photography-projects',
    icon:        '📷',
    accent:      '#b026ff',
    accentRgb:   '176, 38, 255',
    gradient:    'linear-gradient(135deg, rgba(176,38,255,0.12) 0%, rgba(0,240,255,0.06) 100%)',
  },
  {
    title:       'Video Editing Works',
    description: 'Professional video editing projects featuring seamless transitions, cinematic color grading, and precise audio synchronization. Delivered polished output tailored for brand campaigns and digital platforms.',
    tech:        ['Premiere Pro', 'DaVinci Resolve', 'Color Correction'],
    slug:        'video-editing-works',
    icon:        '🎞️',
    accent:      '#00F0FF',
    accentRgb:   '0, 240, 255',
    gradient:    'linear-gradient(135deg, rgba(0,240,255,0.10) 0%, rgba(176,38,255,0.10) 100%)',
  },
];

const Projects = () => {
  return (
    <section id="projects" className="projects-section">
      <div className="section-title">
        <h2>My Work</h2>
        <div className="line" />
      </div>

      <div className="projects-showcase">
        {projectList.map((project, index) => {
          const isReversed = index % 2 !== 0;

          const visualPanel = (
            <div
              className="project-visual"
              style={{ '--project-accent-rgb': project.accentRgb }}
            >
              <div className="project-visual-inner" style={{ background: project.gradient }}>
                {/* Glow blob behind icon */}
                <div
                  className="project-visual-glow"
                  style={{ background: `radial-gradient(circle, ${project.accent}33 0%, transparent 70%)` }}
                />
                {/* Big emoji icon */}
                <div className="project-visual-icon">{project.icon}</div>
                {/* Decorative grid lines */}
                <div className="project-visual-grid" />
                {/* Number badge */}
                <span className="project-number">0{index + 1}</span>
              </div>
            </div>
          );

          const contentPanel = (
            <div className="project-content">
              <div className="project-tags-top">
                {project.tech.map((t, i) => (
                  <span key={i} className="project-tag" style={{ '--tag-accent': project.accent }}>
                    {t}
                  </span>
                ))}
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>

              {project.slug && (
                <Link
                  to={`/projects/${project.slug}`}
                  className="project-cta"
                  style={{ '--project-accent': project.accent, '--project-accent-rgb': project.accentRgb }}
                >
                  <span>View Gallery</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              )}
            </div>
          );

          return (
            <div
              key={index}
              className={`project-item ${isReversed ? 'project-item--reversed' : ''}`}
            >
              {isReversed ? (
                <>
                  {contentPanel}
                  {visualPanel}
                </>
              ) : (
                <>
                  {visualPanel}
                  {contentPanel}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
