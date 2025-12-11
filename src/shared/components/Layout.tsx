import type { FC, PropsWithChildren } from 'react';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <div>
            <a href="/" className="nav-brand">tsuji1&apos;s Webpage</a>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Profile</a>
            <a href="/blog" className="nav-link">Blog</a>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
};
