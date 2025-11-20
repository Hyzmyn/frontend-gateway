import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">Frontend Gateway</h1>
        <nav className="header-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
