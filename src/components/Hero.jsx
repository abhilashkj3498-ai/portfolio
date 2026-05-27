import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">

      {/* Animated background orbs */}
      <div className="orb orb-cyan"></div>
      <div className="orb orb-purple"></div>
      <div className="orb orb-mid"></div>

      {/* Noise/grain overlay for depth */}
      <div className="hero-grain"></div>

      <div className="hero-content">
        <p className="greeting">
          <span className="greeting-dot"></span>
          Available for Projects
        </p>

        <h1 className="name">Abhilash</h1>

        <h2 className="role">
          Videographer<span className="role-sep"> · </span>
          Photographer<span className="role-sep"> · </span>
          Video Editor
        </h2>

        <p className="description">
          Creative and detail-oriented digital media professional with 1.5 years of experience
          in cinematic shooting, color grading, visual storytelling, and social media content
          creation for digital marketing campaigns and brands.
        </p>

        <div className="hero-cta">
          <button
            className="btn-primary-hero"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span>View My Work</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button
            className="btn-ghost-hero"
            onClick={() => document.getElementById('resume')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Resume
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-hint">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
