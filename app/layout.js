import "./globals.css";

export const metadata = {
  title: "Codex Crypt",
  description:
    "Campaign manager offline-first per giochi di ruolo con JSON, mappe annotate e archivio cifrato lato client.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
