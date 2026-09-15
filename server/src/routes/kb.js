import { Router } from "express";
import { body, validationResult } from "express-validator";
import Article from "../models/Article.js";
import { isDbConnected } from "../config/db.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { serializeArticle, pageOf } from "../utils/serialize.js";
import { memory } from "../store/memoryStore.js";

const router = Router();
router.use(protect);

// GET /api/kb?q,category,page,limit
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, page = "1", limit = "20" } = req.query;
    const pg = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    if (isDbConnected()) {
      const filter = {};
      if (category) filter.category = category;
      if (q) filter.$or = [{ title: new RegExp(q, "i") }, { body: new RegExp(q, "i") }];
      const total = await Article.countDocuments(filter);
      const docs = await Article.find(filter).sort({ views: -1 }).skip((pg - 1) * lim).limit(lim);
      return res.json(pageOf(docs.map(serializeArticle), total, pg, lim));
    }

    let list = [...memory.articles].sort((a, b) => b.views - a.views);
    if (category) list = list.filter((a) => a.category === category);
    if (q) {
      const s = q.toLowerCase();
      list = list.filter((a) => `${a.title} ${a.body} ${a.category}`.toLowerCase().includes(s));
    }
    const total = list.length;
    return res.json(pageOf(list.slice((pg - 1) * lim, pg * lim).map(serializeArticle), total, pg, lim));
  })
);

// POST /api/kb
router.post(
  "/",
  [body("title").notEmpty().withMessage("Title required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const { title, body, category } = req.body;
    if (isDbConnected()) {
      const doc = await Article.create({ title, body, category });
      return res.status(201).json(serializeArticle(doc));
    }
    const a = { id: `a-${Date.now()}`, title, body: body || "", category: category || "General", views: 0, helpfulYes: 0, helpfulNo: 0, createdAt: new Date(), updatedAt: new Date() };
    memory.articles.unshift(a);
    return res.status(201).json(serializeArticle(a));
  })
);

// GET /api/kb/:id (increments views)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isDbConnected()) {
      const doc = await Article.findById(id).catch(() => null);
      if (!doc) return res.status(404).json({ error: "Article not found" });
      doc.views += 1;
      await doc.save();
      return res.json(serializeArticle(doc));
    }
    const a = memory.articles.find((x) => x.id === id);
    if (!a) return res.status(404).json({ error: "Article not found" });
    a.views += 1;
    return res.json(serializeArticle(a));
  })
);

// POST /api/kb/:id/helpful {vote: yes|no}
router.post(
  "/:id/helpful",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { vote } = req.body;
    if (isDbConnected()) {
      const doc = await Article.findById(id).catch(() => null);
      if (!doc) return res.status(404).json({ error: "Article not found" });
      if (vote === "no") doc.helpfulNo += 1;
      else doc.helpfulYes += 1;
      await doc.save();
      return res.json(serializeArticle(doc));
    }
    const a = memory.articles.find((x) => x.id === id);
    if (!a) return res.status(404).json({ error: "Article not found" });
    if (vote === "no") a.helpfulNo += 1;
    else a.helpfulYes += 1;
    return res.json(serializeArticle(a));
  })
);

export default router;
