import React from "react";
import "./styles/footer.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-copyright">
          <p>
            &copy; {currentYear} Hidrominerales. Todos los derechos reservados.
          </p>
        </div>
        <div className="footer-links">
          <a href="/privacidad" className="footer-link-item">
            Privacidad
          </a>
          <a href="/terminos" className="footer-link-item">
            Términos de Servicio
          </a>
          <a href="/contacto" className="footer-link-item">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
