import agricultureDB from "./agriculture-db.js";

const KNOWLEDGE_KEY = "yk-admin-knowledge-v1";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text = "") {
  return normalize(text)
    .split(" ")
    .filter(x => x.length > 1);
}

function getManagerKnowledge() {
  try {
    const raw = localStorage.getItem(KNOWLEDGE_KEY);
    const data = JSON.parse(raw || "[]");

    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      category: "مدیریت",
      topic: item.title || item.topic || "دانش مدیریت",
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      general: item.answer || item.general || "",
      solution: item.solution || ""
    }));
  } catch (e) {
    return [];
  }
}

function scoreItem(question, questionTokens, item) {
  let score = 0;

  const topic = normalize(item.topic || "");
  const keywords = Array.isArray(item.keywords)
    ? item.keywords
    : [];

  if (topic && question === topic) {
    score += 15;
  }

  if (topic && question.includes(topic)) {
    score += 8;
  }

  for (const rawKeyword of keywords) {
    const keyword = normalize(rawKeyword);

    if (!keyword) continue;

    if (question.includes(keyword)) {
      score += keyword.includes(" ") ? 6 : 3;
      continue;
    }

    const keywordTokens = tokens(keyword);

    for (const token of keywordTokens) {
      if (questionTokens.includes(token)) {
        score += 1;
      }
    }
  }

  return score;
}

function searchKnowledge(question) {
  const q = normalize(question);
  const qTokens = tokens(q);

  const managerDB = getManagerKnowledge();

  const database = [
    ...agricultureDB,
    ...managerDB
  ];

  let bestItem = null;
  let bestScore = 0;

  for (const item of database) {
    const score = scoreItem(q, qTokens, item);

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return {
    item: bestItem,
    score: bestScore
  };
}

function buildAnswer(item) {
  let answer = "";

  answer += `🌱 ${item.topic || "موضوع کشاورزی"}\n\n`;

  if (item.symptoms) {
    answer += `🔎 نشانه‌ها:\n${item.symptoms}\n\n`;
  }

  if (item.cause) {
    answer += `⚠️ علت یا توضیح:\n${item.cause}\n\n`;
  }

  if (item.general) {
    answer += `${item.general}\n\n`;
  }

  if (item.solution) {
    answer += `✅ راهکار کلی:\n${item.solution}\n\n`;
  }

  answer +=
    "ℹ️ برای تصمیم‌های حساس درباره سم، کود یا درمان، " +
    "برچسب محصول، آزمون خاک/آب و نظر کارشناس محلی را هم در نظر بگیر.";

  return answer.trim();
}

function findOfflineAnswer(question = "") {
  const q = normalize(question);

  if (!q) {
    return "🌱 سؤال کشاورزی‌ات را بنویس.";
  }

  const result = searchKnowledge(q);

  if (!result.item || result.score < 2) {
    return (
      "🌱 یار کشاورز آفلاین\n\n" +
      "برای این سؤال در پایگاه دانش آفلاین پاسخ کافی پیدا نکردم.\n\n" +
      "نام محصول، نشانه، مرحله رشد یا موضوع را دقیق‌تر بنویس؛ " +
      "مثلاً «گوجه، برگ زرد» یا «گندم، زمان آبیاری».\n\n" +
      "ℹ️ برای داده‌های زنده مثل آب‌وهوا یا تحلیل تصویری هوش مصنوعی، " +
      "از نسخه آنلاین استفاده کن."
    );
  }

  return buildAnswer(result.item);
}

export default findOfflineAnswer;
export { findOfflineAnswer };

if (typeof window !== "undefined") {
  window.YarKeshavarzOffline = {
    findOfflineAnswer,
    searchKnowledge
  };
                 }
