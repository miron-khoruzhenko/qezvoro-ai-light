import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import TOC from "@/components/TOC";
import { extractToc } from "@/lib/toc";
import { absUrl, baseOpenGraph, buildAlternates } from "@/lib/seo";
import { getMessages } from "@/i18n";

import s from "./page.module.scss";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getMessages(locale);
  const title = `${t.brand?.name ?? "Qezvoro Invest"} — ${t.nav?.privacy ?? "Privacy Policy"}`;
  const description = t.hero?.extra ?? "Политика конфиденциальности Qezvoro Invest";
  const url = absUrl(locale, "/privacy");
  return { ...baseOpenGraph(title, description, url), alternates: buildAlternates(locale, "/privacy") };
}

const CONTENT_DIR = path.join(process.cwd(), "src", "i18n", "articles");

async function load(locale: string, slug: string, fallback = "ru") {
  const read = async (loc: string) =>
    fs.readFile(path.join(CONTENT_DIR, `${slug}.md`), "utf8"); // статьи у тебя общие — оставляем ru как основной
  try {
    return await read(locale);
  } catch {
    return await read(fallback);
  }
}

export default async function PrivacyPage(
  { params }: { params: Promise<{ locale: string }> }   // <-- тут Promise
) {
  const { locale } = await params;                      // <-- достаём из промиса
  const raw = await load(locale, "privacy");
  const { content, data } = matter(raw);
  const toc = extractToc(content);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-20">
        {/* HERO */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gradient-text">
                {data.title ?? "Политика конфиденциальности"}
              </h1>
              {data.description && (
                <p className="text-lg text-muted-foreground">{data.description}</p>
              )}
              {data.updatedAt && (
                <p className="text-sm text-muted-foreground mt-2">Обновлено: {data.updatedAt}</p>
              )}
            </div>

            {/* GRID: content + TOC */}
            <div className="grid lg:grid-cols-[1fr_280px] gap-8 max-w-6xl mx-auto">
              <article className={"rounded-2xl border bg-card/60 shadow-sm backdrop-blur-sm p-5 md:p-8 lg:p-10 " + s.article}>
                <Markdown>{content}</Markdown>
              </article>

              <TOC items={toc} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
