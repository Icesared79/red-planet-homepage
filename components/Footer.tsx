export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <a href="/" className="wordmark" aria-label="Red Planet — home">
            <img
              src="/brand/lockup-horizontal.svg"
              alt="Red Planet"
              className="wordmark-lockup"
            />
          </a>
          <div className="footer-links">
            <a href="#thesis">About</a>
            <a href="#possibilities">Use cases</a>
            <a href="#foundation">The engine</a>
            <a href="#cta">Contact</a>
          </div>
          <div className="footer-meta">© 2026 — BUILT 26.28</div>
        </div>
      </div>
    </footer>
  );
}
