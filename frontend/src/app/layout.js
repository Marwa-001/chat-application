import "./globals.css";
import Providers from "@/lib/providers";

export const metadata = {
  title: "Chat App",
  description: "Realtime chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}