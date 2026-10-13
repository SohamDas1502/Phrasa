export type Hanzi = {
  char: string;
  pinyin: string;
  meaning: string;
  note?: string;
  example?: { word: string; pinyin: string; meaning: string };
};

export type Sentence = {
  /** Tiles the learner arranges, in the correct order. */
  tokens: string[];
  punct: "。" | "？" | "！";
  pinyin: string;
  en: string;
};

export type Lesson = {
  id: number;
  title: string;
  chars: Hanzi[];
  /** Every sentence uses only characters from this lesson or earlier ones. */
  sentences: Sentence[];
};

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "First words",
    chars: [
      { char: "我", pinyin: "wǒ", meaning: "I / me" },
      { char: "你", pinyin: "nǐ", meaning: "you" },
      {
        char: "好",
        pinyin: "hǎo",
        meaning: "good",
        note: "女 (woman) + 子 (child) = good.",
        example: { word: "你好", pinyin: "nǐ hǎo", meaning: "hello" },
      },
      { char: "是", pinyin: "shì", meaning: "to be (am / is / are)" },
      {
        char: "人",
        pinyin: "rén",
        meaning: "person",
        note: "Looks like a person walking on two legs.",
        example: { word: "好人", pinyin: "hǎo rén", meaning: "good person" },
      },
    ],
    sentences: [
      { tokens: ["你", "好"], punct: "。", pinyin: "nǐ hǎo", en: "Hello." },
      { tokens: ["我", "是", "人"], punct: "。", pinyin: "wǒ shì rén", en: "I am a person." },
      { tokens: ["你", "是", "人"], punct: "。", pinyin: "nǐ shì rén", en: "You are a person." },
      { tokens: ["我", "是", "好", "人"], punct: "。", pinyin: "wǒ shì hǎo rén", en: "I am a good person." },
      { tokens: ["你", "是", "好", "人"], punct: "。", pinyin: "nǐ shì hǎo rén", en: "You are a good person." },
    ],
  },
  {
    id: 2,
    title: "Questions and “not”",
    chars: [
      { char: "他", pinyin: "tā", meaning: "he / him", note: "亻 person radical." },
      {
        char: "她",
        pinyin: "tā",
        meaning: "she / her",
        note: "女 woman radical. Sounds exactly like 他.",
      },
      {
        char: "不",
        pinyin: "bù",
        meaning: "not",
        note: "Becomes bú before a 4th-tone syllable: 不是 bú shì.",
      },
      {
        char: "很",
        pinyin: "hěn",
        meaning: "very",
        note: "Often just links a subject to an adjective: 我很好 “I’m good”.",
      },
      {
        char: "吗",
        pinyin: "ma",
        meaning: "(question particle)",
        note: "Add it to the end of a statement to make a yes/no question.",
      },
    ],
    sentences: [
      { tokens: ["你", "好", "吗"], punct: "？", pinyin: "nǐ hǎo ma", en: "How are you?" },
      { tokens: ["我", "很", "好"], punct: "。", pinyin: "wǒ hěn hǎo", en: "I’m very well." },
      { tokens: ["她", "好", "吗"], punct: "？", pinyin: "tā hǎo ma", en: "Is she well?" },
      { tokens: ["她", "不", "好"], punct: "。", pinyin: "tā bù hǎo", en: "She is not well." },
      { tokens: ["他", "不", "是", "好", "人"], punct: "。", pinyin: "tā bú shì hǎo rén", en: "He is not a good person." },
      { tokens: ["你", "是", "好", "人", "吗"], punct: "？", pinyin: "nǐ shì hǎo rén ma", en: "Are you a good person?" },
    ],
  },
  {
    id: 3,
    title: "China and school",
    chars: [
      {
        char: "中",
        pinyin: "zhōng",
        meaning: "middle",
        note: "A line through the middle of a box.",
        example: { word: "中国", pinyin: "Zhōngguó", meaning: "China (the Middle Kingdom)" },
      },
      {
        char: "国",
        pinyin: "guó",
        meaning: "country",
        note: "A border 囗 around 玉 jade: treasure inside borders.",
      },
      {
        char: "大",
        pinyin: "dà",
        meaning: "big",
        note: "A person stretching their arms out wide.",
        example: { word: "大学", pinyin: "dàxué", meaning: "university" },
      },
      {
        char: "小",
        pinyin: "xiǎo",
        meaning: "small",
        example: { word: "小学", pinyin: "xiǎoxué", meaning: "primary school" },
      },
      { char: "学", pinyin: "xué", meaning: "to study / learn" },
      {
        char: "生",
        pinyin: "shēng",
        meaning: "to be born; life",
        example: { word: "学生", pinyin: "xuéshēng", meaning: "student" },
      },
    ],
    sentences: [
      { tokens: ["我", "是", "中国", "人"], punct: "。", pinyin: "wǒ shì Zhōngguó rén", en: "I am Chinese." },
      { tokens: ["你", "是", "中国", "人", "吗"], punct: "？", pinyin: "nǐ shì Zhōngguó rén ma", en: "Are you Chinese?" },
      { tokens: ["中国", "很", "大"], punct: "。", pinyin: "Zhōngguó hěn dà", en: "China is very big." },
      { tokens: ["我", "是", "学生"], punct: "。", pinyin: "wǒ shì xuéshēng", en: "I am a student." },
      { tokens: ["她", "是", "大学", "生"], punct: "。", pinyin: "tā shì dàxuéshēng", en: "She is a university student." },
      { tokens: ["他", "不", "是", "小学", "生"], punct: "。", pinyin: "tā bú shì xiǎoxuéshēng", en: "He is not a primary school student." },
    ],
  },
  {
    id: 4,
    title: "Food and drink",
    chars: [
      { char: "吃", pinyin: "chī", meaning: "to eat", note: "口 mouth radical on the left." },
      { char: "喝", pinyin: "hē", meaning: "to drink", note: "Also has the 口 mouth radical." },
      {
        char: "水",
        pinyin: "shuǐ",
        meaning: "water",
        note: "The three-dot 氵 “water” radical comes from this character.",
        example: { word: "喝水", pinyin: "hē shuǐ", meaning: "drink water" },
      },
      {
        char: "茶",
        pinyin: "chá",
        meaning: "tea",
        note: "艹 grass radical on top, because it’s a plant.",
      },
      { char: "爱", pinyin: "ài", meaning: "to love" },
      {
        char: "饭",
        pinyin: "fàn",
        meaning: "cooked rice; a meal",
        note: "饣 on the left is the food radical.",
        example: { word: "吃饭", pinyin: "chī fàn", meaning: "to eat (a meal)" },
      },
    ],
    sentences: [
      { tokens: ["我", "爱", "你"], punct: "。", pinyin: "wǒ ài nǐ", en: "I love you." },
      { tokens: ["我", "喝", "水"], punct: "。", pinyin: "wǒ hē shuǐ", en: "I drink water." },
      { tokens: ["你", "喝", "茶", "吗"], punct: "？", pinyin: "nǐ hē chá ma", en: "Do you drink tea?" },
      { tokens: ["他", "不", "喝", "茶"], punct: "。", pinyin: "tā bù hē chá", en: "He doesn’t drink tea." },
      { tokens: ["我", "爱", "中国"], punct: "。", pinyin: "wǒ ài Zhōngguó", en: "I love China." },
      { tokens: ["中国", "饭", "很", "好吃"], punct: "。", pinyin: "Zhōngguó fàn hěn hǎochī", en: "Chinese food is delicious." },
    ],
  },
  {
    id: 5,
    title: "We, also, have",
    chars: [
      {
        char: "们",
        pinyin: "men",
        meaning: "(plural for people)",
        example: { word: "我们", pinyin: "wǒmen", meaning: "we / us" },
      },
      { char: "也", pinyin: "yě", meaning: "also / too", note: "Goes before the verb: 我也是 “me too”." },
      { char: "有", pinyin: "yǒu", meaning: "to have; there is" },
      {
        char: "没",
        pinyin: "méi",
        meaning: "not (with 有)",
        example: { word: "没有", pinyin: "méiyǒu", meaning: "don’t have" },
      },
      {
        char: "什",
        pinyin: "shén",
        meaning: "what (in 什么)",
        example: { word: "什么", pinyin: "shénme", meaning: "what" },
      },
      {
        char: "么",
        pinyin: "me",
        meaning: "(suffix in 什么)",
        example: { word: "什么", pinyin: "shénme", meaning: "what" },
      },
    ],
    sentences: [
      { tokens: ["我们", "是", "学生"], punct: "。", pinyin: "wǒmen shì xuéshēng", en: "We are students." },
      { tokens: ["你", "也", "是", "中国", "人", "吗"], punct: "？", pinyin: "nǐ yě shì Zhōngguó rén ma", en: "Are you Chinese too?" },
      { tokens: ["我", "有", "水"], punct: "。", pinyin: "wǒ yǒu shuǐ", en: "I have water." },
      { tokens: ["我", "没有", "茶"], punct: "。", pinyin: "wǒ méiyǒu chá", en: "I don’t have tea." },
      { tokens: ["你", "喝", "什么"], punct: "？", pinyin: "nǐ hē shénme", en: "What are you drinking?" },
      { tokens: ["你", "吃", "什么"], punct: "？", pinyin: "nǐ chī shénme", en: "What are you eating?" },
      { tokens: ["他们", "也", "很", "好"], punct: "。", pinyin: "tāmen yě hěn hǎo", en: "They are also very well." },
    ],
  },
  {
    id: 6,
    title: "Friends and home",
    chars: [
      {
        char: "朋",
        pinyin: "péng",
        meaning: "friend (in 朋友)",
        note: "Two 月 side by side, like companions.",
        example: { word: "朋友", pinyin: "péngyou", meaning: "friend" },
      },
      {
        char: "友",
        pinyin: "yǒu",
        meaning: "friend",
        example: { word: "朋友", pinyin: "péngyou", meaning: "friend" },
      },
      {
        char: "家",
        pinyin: "jiā",
        meaning: "home; family",
        note: "宀 a roof over 豕 a pig: a home with livestock.",
      },
      { char: "在", pinyin: "zài", meaning: "at / in; to be at" },
      { char: "哪", pinyin: "nǎ", meaning: "which / where" },
      {
        char: "的",
        pinyin: "de",
        meaning: "’s (possession)",
        example: { word: "我的", pinyin: "wǒ de", meaning: "my / mine" },
      },
    ],
    sentences: [
      { tokens: ["他", "是", "我", "的", "朋友"], punct: "。", pinyin: "tā shì wǒ de péngyou", en: "He is my friend." },
      { tokens: ["你", "家", "在", "哪"], punct: "？", pinyin: "nǐ jiā zài nǎ", en: "Where is your home?" },
      { tokens: ["我", "在", "家"], punct: "。", pinyin: "wǒ zài jiā", en: "I am at home." },
      { tokens: ["我", "的", "朋友", "在", "中国"], punct: "。", pinyin: "wǒ de péngyou zài Zhōngguó", en: "My friend is in China." },
      { tokens: ["你们", "在", "哪"], punct: "？", pinyin: "nǐmen zài nǎ", en: "Where are you all?" },
      { tokens: ["她", "是", "我", "的", "好", "朋友"], punct: "。", pinyin: "tā shì wǒ de hǎo péngyou", en: "She is my good friend." },
    ],
  },
];

/** Every character taught up to and including the given lesson index. */
export function charsThrough(lessonIndex: number): Hanzi[] {
  return lessons.slice(0, lessonIndex + 1).flatMap((l) => l.chars);
}
