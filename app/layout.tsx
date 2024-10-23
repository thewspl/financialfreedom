import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { RootProvider } from "react-day-picker";
import RootProviders from "@/components/providers/RootProviders";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Financial Freedom",
  description: "Bütçenizi Yönetin", //açıklama alanı
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" style={{colorScheme: "dark"}}>  {/*normali "en" idi */}
        <body>      
          <header>
            {/*normal local host 404 hatası verirken sign in page çalışıyor (rootproviders buraya eklendiğinde)*/}
             {/* <SignedOut>
              <SignInButton />
            </SignedOut> */}
            {/* <SignedIn>
              <UserButton />
            </SignedIn> */}
          </header>
          <main><RootProviders>{children}</RootProviders></main>  {/*ROOT PROVİDERS EKLENDİĞİNDE HATA VERİYOR children çıkartıldı*/}
        </body>
      </html>
    </ClerkProvider>
  )
}

/*export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
*/