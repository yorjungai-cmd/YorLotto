import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yor Lotto - เดือนนี้รวย",
  description: "Experience the thrill of the win. Your lucky numbers are just a tap away.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="top-app-bar">
          <div className="container header-content">
            <div className="logo">Yor Lotto Prediction System</div>
            <div className="header-actions">
              <button className="icon-btn">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="icon-btn">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <nav className="bottom-nav">
          <div className="nav-item active">
            <span className="material-symbols-outlined">home</span>
            <span className="nav-label">Home</span>
          </div>
          <div className="nav-item">
            <span className="material-symbols-outlined">casino</span>
            <span className="nav-label">Lucky Pick</span>
          </div>
          <div className="nav-item">
            <span className="material-symbols-outlined">cake</span>
            <span className="nav-label">Birthday</span>
          </div>
          <div className="nav-item">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="nav-label">Stats</span>
          </div>
        </nav>
      </body>
    </html>
  );
}
