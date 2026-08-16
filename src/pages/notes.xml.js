import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site, defaultSeo } from "../data/site";

export async function GET(context) {
  const notes = (await getCollection("notes", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );

  return rss({
    title: `${site.name} — Notes`,
    description: defaultSeo.description,
    site: context.site ?? site.url,
    items: notes.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishDate,
      link: `/notes/${entry.id}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
