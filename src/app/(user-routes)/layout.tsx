import Banner from "@/components/banner";
import FloatingWhatsApp from "@/components/floating-whatsapp";
import Footer from "@/components/footer";
import Nav from "@/components/nav";
import { findBanners } from "@/lib/data/banner";

export const revalidate = 43200;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const banner = await findBanners()
  return (
       <>
         <FloatingWhatsApp />
          {banner.length > 0 && (
            <Banner
              bannerData={banner[0]}
            />
          )}
          <Nav />
          {children}
         <Footer />
      </>
  );
}
