import agricultureDB from "./agriculture-db-extended.js";

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

/* کلمات عمومی سؤال که نباید باعث انتخاب محصول اشتباه شوند */
const STOP_WORDS = new Set([
  "چیست",
  "چیست؟",
  "چیه",
  "چه",
  "چگونه",
  "چطور",
  "چرا",
  "کی",
  "کِی",
  "زمان",
  "زمانی",
  "است",
  "هست",
  "هستند",
  "دارد",
  "دارند",
  "شود",
  "شود؟",
  "باید",
  "برای",
  "در",
  "از",
  "به",
  "با",
  "را",
  "که",
  "این",
  "آن",
  "یک",
  "و",
  "یا",
  "من",
  "می",
  "کنم",
  "کنیم",
  "کنید",
  "مناسب",
  "لازم",
  "نیاز"
]);

function tokens(text = "") {
  return normalize(text)
    .split(" ")
    .filter(x => x.length > 1);
}

function meaningfulTokens(text = "") {
  return tokens(text).filter(x => !STOP_WORDS.has(x));
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

  const topicTokens = meaningfulTokens(topic);

  /* تطبیق دقیق نام موضوع */
  if (topic && question === topic) {
    score += 30;
  }

  /* موضوع به صورت کامل داخل سؤال */
  if (topic && question.includes(topic)) {
    score += 15;
  }

  /* تطبیق کلمات اصلی موضوع */
  for (const token of topicTokens) {
    if (questionTokens.includes(token)) {
      score += 6;
    }
  }

  /* تطبیق کلیدواژه‌ها */
  for (const rawKeyword of keywords) {
    const keyword = normalize(rawKeyword);

    if (!keyword) continue;

    if (question.includes(keyword)) {
      score += keyword.includes(" ") ? 8 : 5;
      continue;
    }

    const keywordTokens = meaningfulTokens(keyword);

    for (const token of keywordTokens) {
      if (questionTokens.includes(token)) {
        score += 2;
      }
    }
  }

  return score;
}

function searchKnowledge(question) {
  const q = normalize(question);
  const qTokens = meaningfulTokens(q);

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

  /*
   * اگر تطبیق واقعی با موضوع یا کلیدواژه پیدا نشده،
   * هرگز یک محصول نامرتبط را به عنوان جواب انتخاب نکن.
   */
  if (!result.item || result.score < 5) {
    return (
      "🌱 یار کشاورز آفلاین\n\n" +
      "برای این سؤال هنوز پاسخ دقیق و مطمئنی در پایگاه دانش آفلاین ندارم.\n\n" +
      "لطفاً نام محصول، نشانه یا موضوع را دقیق‌تر بنویس؛ " +
      "مثلاً «گندم، زمان آبیاری» یا «گوجه، برگ زرد».\n\n" +
      "ℹ️ من ترجیح می‌دهم وقتی اطلاعات کافی ندارم، " +
      "جواب حدسی یا مربوط به محصول دیگری ندهم."
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
