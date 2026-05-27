import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <h2 className="contact-title">Get In Touch</h2>
      <p className="contact-desc">
        I'm always open to discussing new projects, creative opportunities, or collaborations.
        Whether it's a brand film, a shoot, or a social media campaign — let's create something great together!
      </p>

      <div className="contact-glass glass">
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Company:</strong> Whoots Productions</p>
          <p><strong>Location:</strong> India</p>
        </div>
        <a href="mailto:" className="btn-primary" style={{ display: 'inline-block' }}>
          Say Hello
        </a>
      </div>

      <footer className="footer">
        <p>© Abhilash. Videographer, Photographer & Video Editor.</p>
      </footer>
    </section>
  );
};

export default Contact;
