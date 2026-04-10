import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bostadskalkyl",
  description: "Rakna pa husforsaljning och huskop pa svenska",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <a href="/" className="text-xl font-semibold text-slate-900">
              Bostadskalkyl
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-8 text-xs text-slate-500">
          Verktyget ger indikativa berakningar och ersatter inte radgivning.
          Kontrollera alltid siffrorna mot Skatteverket, Finansinspektionen
          och Konsumentverket fore viktiga beslut.
        </footer>
      </body>
    </html>
  );
}
