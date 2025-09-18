import { FaPaintBrush, FaGithub, FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-logo special-class">
        <FaPaintBrush className="icon" />
        <h1 className="header-logo-name">SyncBoard</h1>
      </div>
      <div className="nav-hamburger">
        <FaBars className="icon" />
      </div>
      <nav className="nav special-class">
        <FaGithub
          className="icon"
          onClick={() => {
            window.open('https://github.com/moonsterr/Sync-Board', '_blank');
            console.log('this is working right');
          }}
        />
        <button
          className="registration-button"
          onClick={() => navigate('/signin')}
        >
          Sign in
        </button>
        <button className="canvas-button" onClick={() => navigate('/boards')}>
          + Board
        </button>
      </nav>
    </header>
  );
}
