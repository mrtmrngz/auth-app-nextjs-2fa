import type { Metadata } from "next";
import {Poppins} from "next/font/google";
import "./globals.css";
import MainProvider from "@/providers/MainProvider";
import {Toaster} from "react-hot-toast";

const poppins = Poppins({
    variable: '--font-poppins',
    subsets: ["latin"],
    weight: ['400',"500", '600', '900']
});

export const metadata: Metadata = {
  title: "Nextjs Auth App",
  description: "Nextjs Auth App Client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <MainProvider>
            {children}
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
        </MainProvider>
      </body>
    </html>
  );
}
