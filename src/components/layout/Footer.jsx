import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} Frontend Gateway. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
