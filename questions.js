// Small fallback question bank used if questions.json fails to load.
// The full bank lives in questions.json (the public API endpoint).
window.QUESTIONS_BANK = [
  { id: 1, category: "علوم", question: "ما أكبر كوكب في المجموعة الشمسية؟", options: ["زحل", "نبتون", "المشتري", "أورانوس"], correct: 2 },
  { id: 3, category: "علوم", question: "ما الرمز الكيميائي للذهب؟", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
  { id: 21, category: "جغرافيا", question: "ما أطول نهر في العالم؟", options: ["النيل", "الأمازون", "اليانغتسي", "المسيسيبي"], correct: 0 },
  { id: 28, category: "جغرافيا", question: "ما عاصمة اليابان؟", options: ["كيوتو", "أوساكا", "طوكيو", "سيول"], correct: 2 },
  { id: 42, category: "فن وثقافة", question: "ما اللوحة الأشهر للفنان دافنشي؟", options: ["الليلة المرصعة", "الموناليزا", "الصرخة", "العشاء الأخير"], correct: 1 },
  { id: 49, category: "فن وثقافة", question: "بلقب «أمير الشعراء» يُعرف:", options: ["حافظ إبراهيم", "أحمد شوقي", "خليل مطران", "إيليا أبو ماضي"], correct: 1 },
  { id: 63, category: "تاريخ", question: "في أي سنة سقطت الأندلس؟", options: ["1453", "1492", "1517", "1571"], correct: 1 },
  { id: 95, category: "إسلاميات", question: "كم عدد سور القرآن الكريم؟", options: ["100", "110", "114", "120"], correct: 2 },
];

// Load the full bank from the public API (questions.json). On success, replaces
// window.QUESTIONS_BANK with the full set. On failure, keeps the fallback above.
window.loadQuestions = async function loadQuestions(url = "questions.json") {
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (Array.isArray(data?.questions) && data.questions.length > 0) {
      window.QUESTIONS_BANK = data.questions;
      window.QUESTIONS_META = {
        version: data.version,
        language: data.language,
        license: data.license,
        categories: data.categories,
        count: data.questions.length,
      };
      return data.questions.length;
    }
    throw new Error("Invalid questions.json shape");
  } catch (e) {
    console.warn("[trivia] Falling back to embedded question bank:", e.message);
    return window.QUESTIONS_BANK.length;
  }
};

window.AVATARS = [
  { id: 0, emoji: "🦊", name: "الثعلب الذكي", color: "var(--c-orange)" },
  { id: 1, emoji: "🦉", name: "البومة الحكيمة", color: "var(--c-purple)" },
  { id: 2, emoji: "🦁", name: "الأسد الجريء", color: "var(--c-yellow)" },
  { id: 3, emoji: "🐉", name: "التنين الناري", color: "var(--c-pink)" },
  { id: 4, emoji: "🦄", name: "الوحيد القرن", color: "var(--c-teal)" },
  { id: 5, emoji: "🐺", name: "الذئب القائد", color: "var(--c-blue)" },
];

window.LEADERBOARD_SEED = [
  { name: "ليلى", avatar: 1, score: 4820, streak: 9 },
  { name: "خالد", avatar: 2, score: 4350, streak: 7 },
  { name: "سارة", avatar: 4, score: 3990, streak: 6 },
  { name: "عمر", avatar: 0, score: 3540, streak: 5 },
  { name: "نورا", avatar: 3, score: 3120, streak: 4 },
  { name: "يوسف", avatar: 5, score: 2780, streak: 3 },
  { name: "هدى", avatar: 1, score: 2510, streak: 3 },
  { name: "أحمد", avatar: 2, score: 2050, streak: 2 },
];
