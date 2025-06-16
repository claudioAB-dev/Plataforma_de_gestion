import React from "react";
import "./styles/navbar.css";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { logout } = useAuth();

  const handleNavMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <nav className="navbar">
        <div>
          <div className="navbar-brand">
            <a href="/">Hidrominerales</a>
          </div>

          <button
            className="navbar-toggle"
            onClick={handleNavMenuToggle}
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            aria-controls="navbarMenuContent"
          >
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>

          <div
            id="navbarMenuContent"
            className={`navbar-menu ${isOpen ? "is-open" : ""}`}
          >
            <div className="space-x-4">
              <a href="/" className="navbar-menu-item">
                Home
              </a>
              <a href="#" className="navbar-menu-item"></a>
              <a href="#" className="navbar-menu-item" onClick={logout}>
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
