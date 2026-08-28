import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { ClientThemeWrapper, ThemeProvider } from "@/components/themeController";
import Footer from "@/components/footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ToastContainer } from 'react-toastify';
import QueryProviderWrapper from "@/components/queryProvider";
import ClientDataFetcher from "@/components/clientDataFetcher";
import AvatarBar from "@/components/avatarBar";
import ActionBar from "@/components/actionBar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firefly SrTools",
  description: "SrTools by Firefly Shelter",
  icons: {
    icon: "/ff-srtool.png",
    shortcut: "/ff-srtool.ico",
    apple: "/ff-srtool.png",
  },
  openGraph: {
    title: "Firefly SrTools",
    description: "SrTools by Firefly Shelter",
    url: "https://srtools.punklorde.org",
    siteName: "Firefly SrTools",
    images: [
      {
        url: "https://srtools.punklorde.org/ff-srtool.png",
        width: 312,
        height: 312,
        alt: "Firefly SrTools Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Firefly SrTools",
    description: "SrTools by Firefly Shelter",
    images: ["https://srtools.punklorde.org/ff-srtool.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning className="h-full w-full overflow-hidden overscroll-none fixed inset-0">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full overflow-hidden overscroll-none fixed inset-0 max-w-full`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProviderWrapper>
            <ThemeProvider>
              <ClientThemeWrapper>
                <ClientDataFetcher >
                  <div className="h-dvh w-full flex flex-col overflow-hidden bg-ambient-mesh selection:bg-primary/20 selection:text-primary">
                    <Header />
                    <main className="grid grid-cols-12 w-full flex-1 min-h-0 overflow-hidden">
                      <aside className="hidden sm:block sm:col-span-4 md:col-span-4 lg:col-span-3 h-full overflow-hidden border-r border-base-content/10 bg-base-100/30 backdrop-blur-sm">
                        <AvatarBar />
                      </aside>
                      <section className="col-span-12 sm:col-span-8 md:col-span-8 lg:col-span-9 h-full flex flex-col min-w-0 min-h-0 overflow-hidden">
                        <div className="shrink-0">
                          <ActionBar />
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 pt-1 pb-3 flex flex-col justify-between">
                          <div>
                            {children}
                          </div>
                          <Footer />
                        </div>
                      </section>
                    </main>
                  </div>
                </ClientDataFetcher>
              </ClientThemeWrapper>
            </ThemeProvider>
          </QueryProviderWrapper>
        </NextIntlClientProvider>
        <ToastContainer />

      </body>

    </html>
  );
}
