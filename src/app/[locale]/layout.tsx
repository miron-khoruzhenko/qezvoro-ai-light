import type { Metadata } from "next";
import Providers from "../providers";
import LocalizedHeader from "@/components/header/LocalizedHeader";
import Footer from "@/components/Footer";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { getMessages } from "@/i18n";
// import { isRtl, locales, type Locale } from "@/i18n/locales";
import { isRtl, locales, localeCodes, type Locale } from "@/i18n/locales";
function coerceLocale(loc: string): Locale {
  return (localeCodes as readonly string[]).includes(loc) ? (loc as Locale) : "en";
}

export async function generateStaticParams() {
  // лучше генерить из кодов, а не из объектов
  return localeCodes.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = coerceLocale(locale);
  await getMessages(loc); // прогрузка словаря, если нужно

  return {
    metadataBase: new URL(SITE_URL),
    alternates: buildAlternates(loc),
    title: { default: "Qezvoro Invest", template: "%s — Qezvoro Invest" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = coerceLocale(locale);
  const dict = await getMessages(loc);

  return (
    <html lang={loc} dir={isRtl(loc) ? "rtl" : "ltr"}>
      <body>
        <Providers>
          <LocalizedHeader locale={loc} />
          <main>{children}</main>
          <Footer dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
