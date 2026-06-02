import { prisma } from "../../lib/prisma.ts";

let feedCache: { data: any[]; key: string; timestamp: number } | null = null;
const CACHE_TTL = 3_600_000;

export const feed = async (req: any, res: any) => {
  try {
    const { university, course, semester } = req.query;

    const cacheKey = `feed:${university || ""}:${course || ""}:${semester || ""}`;

    if (feedCache && feedCache.key === cacheKey && Date.now() - feedCache.timestamp < CACHE_TTL) {
      return res.json(feedCache.data);
    }

    const where: any = {};
    if (university) where.university = university;
    if (course) where.course = { contains: course, mode: "insensitive" };
    if (semester) where.semester = semester;

    const posts = await prisma.document.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    feedCache = { data: posts, key: cacheKey, timestamp: Date.now() };
    res.json(posts);
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

export const search = async (req: any, res: any) => {
  try {
    const { q, tag, university, course, semester } = req.query;

    const where: any = {};

    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (university) where.university = university;
    if (course) where.course = { contains: course, mode: "insensitive" };
    if (semester) where.semester = semester;

    const posts = await prisma.document.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(posts);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search" });
  }
};
