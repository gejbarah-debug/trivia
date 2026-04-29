// Cloudflare Worker that generates fresh Arabic trivia questions on demand.
// Calls the Anthropic API (Claude Haiku) and returns JSON. CORS-locked to the
// game's origins so the API key in env.ANTHROPIC_API_KEY can't be abused.

const ALLOWED_ORIGINS = new Set([
  "https://gejbarah-debug.github.io",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
]);

const DEFAULT_CATEGORIES = [
  "علوم", "جغرافيا", "فن وثقافة", "تاريخ",
  "لغة وأدب", "رياضة", "إسلاميات", "تكنولوجيا", "حيوانات",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ ok: true, service: "trivia-questions" }, 200, origin);
    }

    if (url.pathname !== "/generate" || request.method !== "POST") {
      return json({ error: "Not found" }, 404, origin);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY secret not configured" }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const count = clamp(body.count ?? 8, 1, 16);
    const categories = Array.isArray(body.categories) && body.categories.length > 0
      ? body.categories
      : DEFAULT_CATEGORIES;
    const excludeList = Array.isArray(body.exclude) ? body.exclude.slice(0, 80) : [];
    const excludeText = excludeList.length
      ? "أسئلة سبق طرحها — تجنّبها تمامًا ولا تكررها بأي صياغة:\n- " + excludeList.join("\n- ")
      : "";

    const prompt = `أنشئ ${count} أسئلة معلومات عامة باللغة العربية الفصحى، بصيغة JSON فقط دون أي نص إضافي.

الشروط:
- أسئلة عائلية مناسبة للجميع، صحيحة من الناحية الواقعية تمامًا
- موزّعة على فئات متنوعة من: ${categories.join("، ")}
- كل سؤال له ٤ خيارات، إجابة واحدة صحيحة فقط
- خيارات التشتيت يجب أن تكون قريبة ومعقولة، لا واضحة الخطأ
- تجنّب الأسئلة شديدة المحلية أو شديدة الصعوبة
${excludeText}

أعد JSON بهذه الصيغة الدقيقة فقط:
{
  "questions": [
    {
      "category": "<اسم الفئة بالضبط من القائمة>",
      "question": "<نص السؤال>",
      "options": ["<خيار 1>", "<خيار 2>", "<خيار 3>", "<خيار 4>"],
      "correct": <رقم بدءًا من 0 يشير إلى الخيار الصحيح>
    }
  ]
}`;

    let claudeRes;
    try {
      claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          temperature: 0.9,
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (e) {
      return json({ error: "Failed to reach Anthropic", detail: String(e) }, 502, origin);
    }

    if (!claudeRes.ok) {
      const detail = await claudeRes.text().catch(() => "");
      return json({ error: "Anthropic API error", status: claudeRes.status, detail }, 502, origin);
    }

    const data = await claudeRes.json();
    const text = data?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return json({ error: "No JSON in model response", raw: text.slice(0, 500) }, 500, origin);
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (e) {
      return json({ error: "Invalid JSON from model", detail: String(e), raw: match[0].slice(0, 500) }, 500, origin);
    }

    const generatedAt = Date.now();
    const questions = (parsed.questions || []).filter(validQuestion).map((q, i) => ({
      id: `g${generatedAt}-${i}`,
      category: q.category,
      question: q.question,
      options: q.options,
      correct: q.correct,
      generated: true,
    }));

    return json({ questions, generatedAt }, 200, origin);
  },
};

function validQuestion(q) {
  return (
    q && typeof q.question === "string" && q.question.length > 0
    && Array.isArray(q.options) && q.options.length === 4
    && q.options.every((o) => typeof o === "string" && o.length > 0)
    && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4
    && typeof q.category === "string"
  );
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Number(n) || lo)); }

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://gejbarah-debug.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}
