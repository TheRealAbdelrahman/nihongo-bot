import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────

const GROQ_MODEL = "openai/gpt-oss-120b";

const MAX_CONVERSATION_MESSAGES = 4;
const MAX_GROQ_COMPLETION_TOKENS = 384;
const ENABLE_BACKGROUND_FEEDBACK = false;
const GROQ_TIMEOUT_MS = 8000;

const MAX_FEEDBACK_COMPLETION_TOKENS = 256;
const FEEDBACK_TIMEOUT_MS = 7000;

const SESSION_LIMITS: Record<string, number> = {
  greeting: 6,
  self_intro: 10,
  enquiry: 10,
  restaurant: 10,
  invitation: 6,
};

const VALID_LESSON_MODES = [
  "greeting",
  "self_intro",
  "enquiry",
  "restaurant",
  "invitation",
];

// ─────────────────────────────────────────────────────────────
// JFS A0 SYLLABUS
// ─────────────────────────────────────────────────────────────

const SYLLABUS = `
=== APPROVED JFS A0 VOCABULARY ===

GREETINGS:
おはようございます、こんにちは、こんばんは、おやすみなさい、
さようなら、じゃまた、すみません、ごめんなさい、
ありがとうございます、おめでとうございます、おげんきですか、
だいじょうぶですか、がんばってください、いただきます、
ごちそうさまでした、いってきます、いっていらっしゃい、
ただいま、おかえりなさい、ごめんください、おじゃまします、
しつれいします、もしもし、もういちどおねがいします、
ちょっとまってください、はじめまして、よろしくおねがいします

VERBS:
たべます、たべません、のみます、のみません、
よみます、よみません、かきます、かきません、
ききます、ききません、うたいます、うたいません、
みます、みません、ひきます、ひきません、
つくります、つくりません、します、しません、
べんきょうします、べんきょうしません

NUMBERS:
いち、に、さん、よん、し、ご、ろく、なな、しち、
はち、きゅう、じゅう、ひゃく、せん、まん

AGE:
いっさい、にさい、さんさい、よんさい、ごさい、
ろくさい、ななさい、はっさい、きゅうさい、
じゅっさい、はたち

YEAR:
いちねんせい、にねんせい、さんねんせい、
よねんせい、ごねんせい、ろくねんせい

FOOD AND DRINK:
ごはん、すし、さしみ、たこやき、おこのみやき、
やきそば、てんぷら、おにぎり、そば、うどん、すきやき、
あさごはん、ひるごはん、ばんごはん、みず、こうちゃ、
おちゃ、ぎゅうにゅう、あめ、おかし、やさい、りんご、
すいか、みかん、いちご、りょうり、はし、さら

CLASSROOM:
ほん、じしょ、えんぴつ、じょうぎ、ふでばこ、かみ、
つくえ、いす、はこ、まど、でんき、せんぷうき、かさ、
ごみ、ごみばこ、てがみ、とけい、がっこう、だいがく、
こうとうがっこう、こうこう、ちゅうがっこう、
しょうがっこう、ようちえん、じゅぎょう、しんぶん、
でんわ、おかね、めいし、きかい

ANIMALS:
いぬ、ねこ、さかな、さる、へび、とり、たこ、えび、
いか、むし、きりん

NATURE:
あめ、ゆき、くも、き、はな、いし、やま、かわ、うみ、
はる、なつ、あき、ふゆ、きせつ、かぜ、みず、しま、つなみ

ATTIRE:
ふく、めがね、くつ、くつした、くし、かばん、さいふ、ゆかた

BODY:
め、くち、はな、みみ、かみのけ、あたま、かお、て、
あし、おなか、した

PEOPLE:
そふ、おじいさん、そぼ、おばあさん、ちち、おとうさん、
はは、おかあさん、あに、おにいさん、あね、おねえさん、
おとうと、いもうと、ともだち、せんせい、がくせい、
いしゃ、かいしゃいん、こうむいん、ぎんこういん、しゅふ

TRANSPORT AND PLACES:
くるま、でんしゃ、ひこうき、ふね、びょういん

SUBJECTS:
すうがく、けいえいがく、でんきこうがく、きかいこうがく、
かがくこうがく、けんちくこうがく、コンピュータがく、
りかがく、ちりがく、ぶつりがく、せいぶつがく、
どぼくこうがく、きょういくがく

SPORTS / ACTIVITIES:
Sakkaa、Badominton、Tenisu、Ragubii、Beesuboru、Baree

OTHER LOAN WORDS:
Rajio、Terebi、Enjinia、Konpyuuta

NATIONALITY:
～けい、～じん

ENQUIRY PATTERNS:
なんですか、なんの〇〇ですか、だれですか、
だれの〇〇ですか、どこからきました、
どこの〇〇ですか、なにをしますか、
なんさいですか、なんねんせいですか、どうですか

=== APPROVED GRAMMAR ===

Particles:
は、の、も、と、で、を、から

Patterns:
〇〇はなんですか
これ・それ・あれはなんですか
〇〇さんはなんさいですか
〇〇さんはなんねんせいですか

Self introduction:
はじめまして。
わたしは【なまえ】です。
わたしは【せんもん】のがくせいです。
わたしは【Hometown】からきました。
わたしのしゅみは【しゅみ】です。
よろしくおねがいします。
`;

// ─────────────────────────────────────────────────────────────
// OPENING MESSAGES
// ─────────────────────────────────────────────────────────────

const OPENING_MESSAGES: Record<
  string,
  { japanese: string; romaji: string; note: string }
> = {
  greeting: {
    japanese: "こんにちは！おげんきですか。",
    romaji: "Konnichiwa! Ogenki desu ka?",
    note: "Yui greets you and asks how you are doing.",
  },

  self_intro: {
    japanese:
      "はじめまして。わたしはたなかけんじです。おなまえはなんですか。",
    romaji:
      "Hajimemashite. Watashi wa Tanaka Kenji desu. Onamae wa nan desu ka?",
    note: "Kenji introduces himself and asks for your name.",
  },

  enquiry: {
    japanese: "いらっしゃいませ。なにかございますか。",
    romaji: "Irasshaimase. Nanika gozaimasu ka?",
    note: "Hana welcomes you to the store and offers to help.",
  },

  restaurant: {
    japanese: "いらっしゃいませ。おきまりですか。",
    romaji: "Irasshaimase. Okimari desu ka?",
    note: "Ryo welcomes you and asks if you are ready to order.",
  },

  invitation: {
    japanese: "もしもし、あおいです。",
    romaji: "Moshi moshi, Aoi desu.",
    note: "Aoi has called you on the phone to say hello.",
  },
};

// ─────────────────────────────────────────────────────────────
// CHARACTER META
// ─────────────────────────────────────────────────────────────

const CHARACTER_META: Record<
  string,
  {
    name: string;
    nameEn: string;
    initial: string;
    age: string;
    role: string;
    traits: string;
    color: string;
  }
> = {
  greeting: {
    name: "やまだ ゆい",
    nameEn: "Yamada Yui",
    initial: "ゆ",
    age: "はたち",
    role: "おちゃのみずじょしだいがく にねんせい",
    traits: "あにめ · ばれーぼーる · らーめん",
    color: "d4697a",
  },

  self_intro: {
    name: "たなか けんじ",
    nameEn: "Tanaka Kenji",
    initial: "け",
    age: "にじゅうにさい",
    role: "とうきょうだいがく よねんせい",
    traits: "おんがく · えいが · おおさかしゅっしん",
    color: "4a7ab0",
  },

  enquiry: {
    name: "すずき はな",
    nameEn: "Suzuki Hana",
    initial: "は",
    age: "さんじゅうごさい",
    role: "コンビニ てんいん",
    traits: "よこはましゅっしん",
    color: "4a9090",
  },

  restaurant: {
    name: "さとう りょう",
    nameEn: "Sato Ryo",
    initial: "り",
    age: "にじゅうはっさい",
    role: "にほんりょうりレストラン てんいん",
    traits: "ふくおかしゅっしん · りょうりずき",
    color: "c09050",
  },

  invitation: {
    name: "きむら あおい",
    nameEn: "Kimura Aoi",
    initial: "あ",
    age: "じゅうきゅうさい",
    role: "わせだだいがく いちねんせい",
    traits: "ながのしゅっしん · はずかしがりや · まじめ",
    color: "7a7abf",
  },
};

// ─────────────────────────────────────────────────────────────
// RUNTIME LESSON PROMPTS
// ─────────────────────────────────────────────────────────────

const RUNTIME_PROMPTS: Record<string, string> = {
  greeting: `
CHARACTER:
You are やまだ ゆい, a friendly university student.

SCENARIO:
Greetings and health are the primary scenario.

ALLOWED:
- greetings
- asking how someone is
- げんきです
- げんきではありません
- そうですか
- おだいじに
- ありがとうございます
- ひさしぶり
- a brief simple question about Yui when the student directly asks one

The opening message was already sent:
こんにちは！おげんきですか。

Never repeat the opening.

If the student says they are well, acknowledge it.

If the student says they are not well, respond sympathetically.

If the student asks a simple direct question about Yui, answer that
question briefly before continuing or concluding the greeting scenario.

For example, if the student says:
"I am fine. What's your name?"

acknowledge that the student is fine and answer Yui's name.

Do not start a full self-introduction unless the student specifically
asks for information about Yui.

Do not introduce school, hobbies, food, family, work, studying, location,
or other unrelated topics.
`,

  self_intro: `
CHARACTER:
You are たなか けんじ, a friendly senior university student.

SCENARIO:
Basic self-introduction.

ALLOWED TOPICS:
- name
- hometown
- hobby
- likes
- university
- year of study
- course / major
- age

OPENING:
はじめまして。わたしはたなかけんじです。おなまえはなんですか。

The opening was already sent. Never repeat it.

NAME:
The student's name is personal data.
Preserve it exactly as provided.
Never transliterate it.
Never change its script.
Never abbreviate it.
Never invent it.
You may append さん.

ENGLISH STUDENT INPUT:
The student may answer in English.

If the student gives an English answer to the previous question,
treat the answer as valid student information.

Do not translate the student's English answer into Japanese Kanji.

Do not copy an English place name into the Japanese dialogue
unless that exact form is explicitly approved by the syllabus.

When acknowledging an English answer, use approved beginner Japanese
such as そうですか, and continue with the next unanswered topic.

Do not invent a Japanese translation of an English place, university,
major, hobby, or other student-provided information.

PROGRESSION:
When relevant, use:
university → year → major

Once a topic has been answered, do not ask it again.

If multiple topics are answered in one student message, record all of them
and ask only about an unanswered topic.

Possible unanswered topics:
hometown, university, year, major, age, hobby, likes.

Ask exactly ONE question.

Stay inside self-introduction.
Do not introduce health, restaurants, invitations, work,
or unrelated topics.
`,

  enquiry: `
CHARACTER:
You are すずき はな, a cheerful convenience-store worker.

SCENARIO:
The student is asking about objects, food, drinks, or people in the store.

STORE ITEMS:
じしょ、ほん、えんぴつ、とけい、かばん、
おちゃ、みず、おにぎり、さしみ、おかし

ALLOWED QUESTION TYPES:
これはなんですか。
それはなんですか。
これはだれの〇〇ですか。
こちらはだれですか。

IMPORTANT:
Do not invent prices.
Do not invent discounts.
Do not invent availability.
Do not invent products.
Do not invent product properties.
Do not recommend products unless the scenario explicitly provides that information.

Only describe information that is present in the scenario or directly required
by the approved beginner patterns.

Start with object enquiries and move naturally to food or person enquiries.

Ask at most ONE question.

Always answer the student's current question before considering a conclusion.
`,

  restaurant: `
CHARACTER:
You are さとう りょう, a Japanese restaurant waiter.

SCENARIO:
Ordering food and drinks.

ALLOWED FOOD:
ごはん、すし、さしみ、たこやき、おこのみやき、
やきそば、てんぷら、おにぎり、そば、うどん、すきやき

ALLOWED DRINKS:
みず、こうちゃ、おちゃ、ぎゅうにゅう

USEFUL PATTERNS:
いらっしゃいませ。
おきまりですか。
〇〇をください。
のみものはどうですか。
〇〇と〇〇ですね。
いただきます。
ごちそうさまでした。
ごゆっくりどうぞ。
ありがとうございました。

Stay focused on ordering food and drinks.

Ask at most ONE question.

Always answer the student's current message before concluding.
`,

  invitation: `
CHARACTER:
You are きむら あおい, a shy but sweet first-year university student.

SCENARIO:
Simple phone invitation conversation.

OPENING:
もしもし、あおいです。

The opening was already sent.
Never repeat it.

ALLOWED ACTIVITIES:
えいがをみます
おんがくをききます
Sakkaaをします
Badomintonをします

USEFUL EXPRESSIONS:
もしもし
〇〇さん
どうしましたか
あした
みませんか
しませんか
はい、いいですよ
すみません、ちょっと
しけんです
がんばってください
じゃまた
またこんど

INVITATION FORMAT:
When inviting the student, use only one of the approved activities.

If using あした, use it directly with the approved activity.

Examples of valid activity structures:
あした えいがをみませんか。
あした おんがくをききませんか。
あした Sakkaaをしませんか。
あした Badomintonをしませんか。

Do not insert an unsupported location, object, person, reason,
or other noun between あした and the activity.

Do not invent activities, locations, dates, reasons,
or other personal information.

IMPORTANT:
"あした" means tomorrow.

Keep the conversation focused on invitations.

Ask at most ONE question.

Always respond to the student's current message.
`,
};

// ─────────────────────────────────────────────────────────────
// GROQ STRUCTURED OUTPUT SCHEMA
// ─────────────────────────────────────────────────────────────

const GROQ_REPLY_SCHEMA = {
  type: "object",
  properties: {
    japanese: {
      type: "string",
      description:
        "The character's Japanese dialogue only. Beginner Japanese, hiragana/approved katakana only, absolutely no kanji.",
    },

    romaji: {
      type: "string",
      description:
        "The romaji reading of the Japanese dialogue. It must communicate exactly the same content.",
    },

    note: {
      type: "string",
      description:
        "One short English sentence explaining the character's response. Never instruct the student.",
    },
  },

  required: ["japanese", "romaji", "note"],
  additionalProperties: false,
};

// ─────────────────────────────────────────────────────────────
// ENGLISH NUMBER / NAME DETECTION
// ─────────────────────────────────────────────────────────────

const ENGLISH_NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const ENGLISH_NON_NAME_WORDS = new Set([
  "fine",
  "good",
  "great",
  "well",
  "ok",
  "okay",
  "alright",
  "sorry",
  "tired",
  "hungry",
  "happy",
  "sad",
  "busy",
  "free",
  "ready",
  "here",
  "home",
  "back",
  "also",
  "still",
  "not",
  "done",
  "excited",
  "nervous",
  ...ENGLISH_NUMBER_WORDS,
]);

// ─────────────────────────────────────────────────────────────
// SELF-INTRO TOPIC DETECTION
// ─────────────────────────────────────────────────────────────

function detectCoveredTopics(
  messages: Array<{ role: string; content: string }>,
  studentName: string | null,
): Set<string> {
  const coveredTopics = new Set<string>();

  const studentMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => String(m.content))
    .join("\n")
    .toLowerCase();

  if (studentName) {
    coveredTopics.add("name");
  }

  if (
    /\b(?:i'm|i am)\s+from\b/i.test(studentMessages) ||
    /\bmy hometown is\b/i.test(studentMessages) ||
    /\bi come from\b/i.test(studentMessages) ||
    /\bfrom\s+[a-z][a-z\s'-]*/i.test(studentMessages) ||
    /からきました/.test(studentMessages)
  ) {
    coveredTopics.add("hometown");
  }

  if (
    /\b(?:university|college)\b/i.test(studentMessages) ||
    /\butm\b/i.test(studentMessages) ||
    /だいがく/.test(studentMessages)
  ) {
    coveredTopics.add("university");
  }

  if (
    /\b(?:first|second|third|fourth|fifth|sixth)\s+year\b/i.test(
      studentMessages,
    ) ||
    /\b(?:1st|2nd|3rd|4th|5th|6th)\s+year\b/i.test(studentMessages) ||
    /\byear\s+[1-6]\b/i.test(studentMessages) ||
    /いちねんせい|にねんせい|さんねんせい|よねんせい|ごねんせい|ろくねんせい/.test(
      studentMessages,
    )
  ) {
    coveredTopics.add("year");
  }

  if (
    /\bmy major\b/i.test(studentMessages) ||
    /\bmy course\b/i.test(studentMessages) ||
    /\bmy degree\b/i.test(studentMessages) ||
    /\bi study\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bi'm studying\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bi am studying\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bsoftware engineering\b/i.test(studentMessages) ||
    /\bcomputer science\b/i.test(studentMessages) ||
    /せんもん/.test(studentMessages)
  ) {
    coveredTopics.add("major");
  }

  const spelledOutAgePattern = new RegExp(
    `\\b(?:i am|i'm|my age is)\\s+(?:${ENGLISH_NUMBER_WORDS.join(
      "|",
    )})(?:[-\\s](?:one|two|three|four|five|six|seven|eight|nine))?\\s*(?:years?\\s*old)?\\b`,
    "i",
  );

  if (
    /\b\d+\s*(?:years?\s*old|yo)\b/i.test(studentMessages) ||
    /\b(?:i am|i'm)\s+\d+\s*(?:years?)?\b/i.test(studentMessages) ||
    /\bmy age is\s+\d+\b/i.test(studentMessages) ||
    spelledOutAgePattern.test(studentMessages) ||
    /さい/.test(studentMessages)
  ) {
    coveredTopics.add("age");
  }

  if (
    /\bmy hobbies?\b/i.test(studentMessages) ||
    /\bmy hobby\b/i.test(studentMessages) ||
    /しゅみ/.test(studentMessages)
  ) {
    coveredTopics.add("hobby");
  }

  if (
    /\bi like\b/i.test(studentMessages) ||
    /\bi love\b/i.test(studentMessages) ||
    /\bmy favorite\b/i.test(studentMessages) ||
    /すき/.test(studentMessages)
  ) {
    coveredTopics.add("likes");
  }

  return coveredTopics;
}

// ─────────────────────────────────────────────────────────────
// LAST ASKED TOPIC
// ─────────────────────────────────────────────────────────────

function detectLastAskedTopic(
  messages: Array<{ role: string; content: string }>,
): string | null {
  const TOPIC_CUES: Array<[string, RegExp]> = [
    ["hometown", /どこからきましたか/],
    [
      "university",
      /(?:どこのがくせいですか|どこのだいがくにいっていますか|だいがくはどこですか)/,
    ],
    ["year", /なんねんせいですか/],
    ["major", /せんもん.*なんですか/],
    ["age", /なんさいですか/],
    ["hobby", /しゅみ.*なんですか/],
    ["likes", /なにがすきですか/],
  ];

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  if (!lastAssistantMessage) {
    return null;
  }

  const content = String(
    lastAssistantMessage.content,
  );

  const found = TOPIC_CUES.find(([, pattern]) =>
    pattern.test(content),
  );

  return found ? found[0] : null;
}

// ─────────────────────────────────────────────────────────────
// STUDENT NAME DETECTION
// ─────────────────────────────────────────────────────────────

function detectStudentName(message: string): string | null {
  const trimmedMessage = message.trim();

  const japaneseExplicitNameMatch =
    trimmedMessage.match(
      /(?:^|[。！？?!])\s*(?:わたしは|わたしのなまえは)\s*([^。！？?!、,\s]+?)\s*です(?:[。！？?!、,]|$)/,
    );

  if (japaneseExplicitNameMatch?.[1]) {
    const candidate =
      japaneseExplicitNameMatch[1].trim();

    if (
      candidate &&
      !SYLLABUS.includes(candidate)
    ) {
      return candidate;
    }
  }

  const shortJapaneseNameMatch =
    trimmedMessage.match(
      /(?:^|[。！？?!])\s*([^。！？?!、,\s]+?)\s*です(?:[。！？?!、,]|$)/,
    );

  if (shortJapaneseNameMatch?.[1]) {
    const candidate =
      shortJapaneseNameMatch[1].trim();

    const invalidCandidates = new Set([
      "こんにちは",
      "こんばんは",
      "おはようございます",
      "はじめまして",
      "だいじょうぶ",
      "げんき",
    ]);

    const isKnownVocabulary =
      SYLLABUS.includes(candidate);

    if (
      !invalidCandidates.has(candidate) &&
      !isKnownVocabulary
    ) {
      return candidate;
    }
  }

  const romajiNameMatch =
    trimmedMessage.match(
      /(?:watashi wa|watashi no namae wa)\s+([A-Za-z][A-Za-z'-]*)\s+desu\b/i,
    );

  if (romajiNameMatch?.[1]) {
    return romajiNameMatch[1].trim();
  }

  const startsWithFrom =
    /^\s*(?:i'm|i am)\s+from\b/i.test(
      trimmedMessage,
    );

  if (!startsWithFrom) {
    const englishNameMatch =
      trimmedMessage.match(
        /(?:my name is|i am|i'm)\s+([A-Za-z][A-Za-z'-]*)(?:[.!?,]|$)/i,
      );

    if (englishNameMatch?.[1]) {
      const candidate =
        englishNameMatch[1].trim();

      if (
        !ENGLISH_NON_NAME_WORDS.has(
          candidate.toLowerCase(),
        )
      ) {
        return candidate;
      }
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// OUTPUT BUILDING
// ─────────────────────────────────────────────────────────────

function buildReply(
  japanese: string,
  romaji: string,
  note: string,
): string {
  return `[JAPANESE]
${japanese.trim()}
[/JAPANESE]

[ROMAJI]
${romaji.trim()}
[/ROMAJI]

[NOTE]
${note.trim()}
[/NOTE]`;
}

// ─────────────────────────────────────────────────────────────
// GROQ HISTORY PREPARATION
// ─────────────────────────────────────────────────────────────
//
// Stored assistant messages intentionally remain in the legacy
// tagged format because the frontend/database currently use that
// format.
//
// Before sending history to Groq, convert those assistant messages
// into the same JSON-shaped structure expected by the current
// structured-output contract.
//
// This prevents historical tagged responses from conflicting with
// the current "JSON only" system instruction.
//

function prepareHistoryForGroq(
  messages: Array<{ role: string; content: string }>,
): Array<{ role: string; content: string }> {
  return messages.map((message) => {
    if (message.role !== "assistant") {
      return {
        role: message.role,
        content: String(message.content).trim(),
      };
    }

    const content = String(message.content);

    const japaneseMatch = content.match(
      /\[JAPANESE\]\s*([\s\S]*?)\s*\[\/JAPANESE\]/i,
    );

    if (japaneseMatch?.[1]) {
      return {
        role: "assistant",
        content: japaneseMatch[1].trim(),
      };
    }

    return {
      role: "assistant",
      content: content.trim(),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// GROQ REQUEST WITH TIMEOUT
// ─────────────────────────────────────────────────────────────

async function callGroq(
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Response> {
  const controller =
    new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get(
            "GROQ_API_KEY",
          )}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─────────────────────────────────────────────────────────────
// OUTPUT VALIDATION
// ─────────────────────────────────────────────────────────────

function validateStructuredReply(
  value: unknown,
): {
  japanese: string;
  romaji: string;
  note: string;
} {
  if (!value || typeof value !== "object") {
    throw new Error(
      "Groq returned an invalid response object.",
    );
  }

  const candidate =
    value as Record<string, unknown>;

  if (
    typeof candidate.japanese !==
      "string" ||
    typeof candidate.romaji !==
      "string" ||
    typeof candidate.note !==
      "string"
  ) {
    throw new Error(
      "Groq returned incomplete response fields.",
    );
  }

  const japanese =
    candidate.japanese.trim();

  const romaji =
    candidate.romaji.trim();

  const note =
    candidate.note.trim();

  if (!japanese || !romaji || !note) {
    throw new Error(
      "Groq returned an empty response field.",
    );
  }

  if (/[\u4E00-\u9FFF]/.test(japanese)) {
    throw new Error(
      "Groq returned kanji in the Japanese dialogue.",
    );
  }

  if (/[\u3040-\u30FF]/.test(note)) {
    throw new Error(
      "Groq returned Japanese characters in the NOTE.",
    );
  }

  if (
    /\[(?:\/)?(?:JAPANESE|ROMAJI|NOTE)\]/i.test(
      `${japanese}\n${romaji}\n${note}`,
    )
  ) {
    throw new Error(
      "Groq returned response-format tags inside a field.",
    );
  }

  return {
    japanese,
    romaji,
    note,
  };
}

// ─────────────────────────────────────────────────────────────
// BACKGROUND FEEDBACK
// ─────────────────────────────────────────────────────────────

async function generateAndSaveFeedback(params: {
  adminClient: ReturnType<
    typeof createClient
  >;
  sessionId: string;
  studentId: string;
  lessonMode: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}): Promise<void> {
  const {
    adminClient,
    sessionId,
    studentId,
    lessonMode,
    messages,
  } = params;

  try {
    const transcript = messages
      .filter(
        (m) => m.role === "user",
      )
      .map(
        (m, index) =>
          `${index + 1}. ${m.content}`,
      )
      .join("\n");

    const feedbackPrompt = `
You are a Japanese language teacher evaluating
a beginner JFS A0 conversation.

Lesson:
${lessonMode}

Student messages:
${transcript}

Return only the requested JSON.

Focus on:
- particles
- sentence patterns
- important spelling mistakes
- vocabulary usage
- incorrect verb forms

Do not discuss advanced Japanese.

Katakana loanwords should be represented in romaji.

Return:
{
  "vocabulary_notes": "1-2 short sentences",
  "grammar_notes": "2-4 short sentences",
  "effort_notes": "1 short sentence",
  "corrections": [
    {
      "original": "student form",
      "corrected": "correct form",
      "explanation": "short explanation"
    }
  ],
  "encouragement": "1 short sentence"
}

Return no Markdown and no extra text.
`;

    const feedbackBody = {
      model: GROQ_MODEL,

      messages: [
        {
          role: "system",
          content:
            "Return only the requested JSON object.",
        },
        {
          role: "user",
          content:
            feedbackPrompt,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name:
            "nihongo_bot_feedback",
          strict: true,
          schema: {
            type: "object",
            properties: {
              vocabulary_notes: {
                type: "string",
              },
              grammar_notes: {
                type: "string",
              },
              effort_notes: {
                type: "string",
              },
              corrections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    original: {
                      type: "string",
                    },
                    corrected: {
                      type: "string",
                    },
                    explanation: {
                      type: "string",
                    },
                  },
                  required: [
                    "original",
                    "corrected",
                    "explanation",
                  ],
                  additionalProperties:
                    false,
                },
              },
              encouragement: {
                type: "string",
              },
            },
            required: [
              "vocabulary_notes",
              "grammar_notes",
              "effort_notes",
              "corrections",
              "encouragement",
            ],
            additionalProperties:
              false,
          },
        },
      },

      max_completion_tokens:
        MAX_FEEDBACK_COMPLETION_TOKENS,

      reasoning_effort:
        "low",

      reasoning_format:
        "hidden",

      temperature: 0.4,
    };

    const feedbackRes =
      await callGroq(
        feedbackBody,
        FEEDBACK_TIMEOUT_MS,
      );

    if (!feedbackRes.ok) {
      const feedbackErrorText =
        await feedbackRes.text();

      let feedbackErrorBody: unknown =
        feedbackErrorText;

      try {
        feedbackErrorBody =
          JSON.parse(
            feedbackErrorText,
          );
      } catch {
        // Keep original text when the response is not JSON.
      }

      console.error(
        "[FEEDBACK GROQ ERROR]",
        {
          status:
            feedbackRes.status,
          requestId:
            feedbackRes.headers.get(
              "x-request-id",
            ),
          groqRegion:
            feedbackRes.headers.get(
              "x-groq-region",
            ),
          body:
            feedbackErrorBody,
        },
      );

      return;
    }

    const feedbackData =
      await feedbackRes.json();

    const feedbackRaw =
      feedbackData?.choices?.[0]
        ?.message?.content;

    if (
      typeof feedbackRaw !==
        "string" ||
      !feedbackRaw.trim()
    ) {
      console.error(
        "[FEEDBACK ERROR] Empty feedback response.",
      );
      return;
    }

    const feedback =
      JSON.parse(feedbackRaw);

    const {
      error: feedbackInsertError,
    } = await adminClient
      .from("session_feedback")
      .insert({
        session_id:
          sessionId,
        student_id:
          studentId,
        lesson_mode:
          lessonMode,
        vocabulary_notes:
          feedback.vocabulary_notes,
        grammar_notes:
          feedback.grammar_notes,
        effort_notes:
          feedback.effort_notes,
        corrections:
          feedback.corrections,
        encouragement:
          feedback.encouragement,
      });

    if (feedbackInsertError) {
      console.error(
        "Failed to save session feedback:",
        feedbackInsertError.message,
      );
    }
  } catch (feedbackError) {
    console.error(
      "BACKGROUND FEEDBACK ERROR:",
      feedbackError,
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DENO SERVE
// ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const requestStartedAt =
    Date.now();

  console.log(
    "[CHAT TIMING] request_start",
    requestStartedAt,
  );

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const adminClient =
      createClient(
        Deno.env.get(
          "SUPABASE_URL",
        )!,
        Deno.env.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        )!,
        {
          auth: {
            autoRefreshToken:
              false,
            persistSession:
              false,
          },
        },
      );

    // ─────────────────────────────────────────────────────────
    // AUTHENTICATION
    // ─────────────────────────────────────────────────────────

    const authHeader =
      req.headers.get(
        "Authorization",
      );

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    const jwt =
      authHeader.replace(
        "Bearer ",
        "",
      );

    console.log(
      "[CHAT TIMING] auth_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      data: { user },
      error: userError,
    } =
      await adminClient.auth.getUser(
        jwt,
      );

    console.log(
      "[CHAT TIMING] auth_complete",
      Date.now() -
        requestStartedAt,
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // REQUEST VALIDATION
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] request_parse_start",
      Date.now() -
        requestStartedAt,
    );

    const body =
      await req.json();

    const {
      message,
      lesson_mode,
      session_id,
      start_session,
    } = body;

    console.log(
      "[CHAT TIMING] request_parse_complete",
      Date.now() -
        requestStartedAt,
    );

    if (
      !VALID_LESSON_MODES.includes(
        lesson_mode,
      )
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid lesson_mode.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (
      typeof message !==
        "undefined" &&
      typeof message !==
        "string"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid message.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (
      typeof session_id !==
        "undefined" &&
      session_id !== null &&
      typeof session_id !==
        "string"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid session_id.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // START SESSION
    // ─────────────────────────────────────────────────────────

    if (start_session) {
      const opening =
        OPENING_MESSAGES[
          lesson_mode
        ] ||
        OPENING_MESSAGES.greeting;

      const {
        data: session,
        error:
          sessionError,
      } =
        await adminClient
          .from(
            "chat_sessions",
          )
          .insert({
            student_id:
              user.id,
            lesson_mode,
          })
          .select("id")
          .single();

      if (sessionError) {
        throw new Error(
          "Failed to create session: " +
            sessionError.message,
        );
      }

      const openingText =
        buildReply(
          opening.japanese,
          opening.romaji,
          opening.note,
        );

      const {
        error:
          openingInsertError,
      } =
        await adminClient
          .from(
            "chat_messages",
          )
          .insert({
            session_id:
              session.id,
            role: "assistant",
            content:
              openingText,
          });

      if (
        openingInsertError
      ) {
        throw new Error(
          "Failed to save opening message: " +
            openingInsertError.message,
        );
      }

      return new Response(
        JSON.stringify({
          reply:
            openingText,
          session_id:
            session.id,
          character:
            CHARACTER_META[
              lesson_mode
            ] ||
            CHARACTER_META
              .greeting,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // REGULAR MESSAGE VALIDATION
    // ─────────────────────────────────────────────────────────

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({
          error:
            "Missing message.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    let sessionId =
      session_id;

    // ─────────────────────────────────────────────────────────
    // CREATE SESSION IF NECESSARY
    // ─────────────────────────────────────────────────────────

    if (!sessionId) {
      const {
        data: session,
        error:
          sessionError,
      } =
        await adminClient
          .from(
            "chat_sessions",
          )
          .insert({
            student_id:
              user.id,
            lesson_mode,
          })
          .select(
            "id, student_name",
          )
          .single();

      if (sessionError) {
        throw new Error(
          "Failed to create session: " +
            sessionError.message,
        );
      }

      sessionId =
        session.id;
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY SESSION OWNERSHIP
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] session_verify_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      data:
        existingSession,
      error:
        existingSessionError,
    } =
      await adminClient
        .from(
          "chat_sessions",
        )
        .select(
          "id, student_id, lesson_mode, student_name",
        )
        .eq(
          "id",
          sessionId,
        )
        .maybeSingle();

    console.log(
      "[CHAT TIMING] session_verify_complete",
      Date.now() -
        requestStartedAt,
    );

    if (
      existingSessionError
    ) {
      throw new Error(
        "Failed to verify session: " +
          existingSessionError.message,
      );
    }

    if (!existingSession) {
      return new Response(
        JSON.stringify({
          error:
            "Session not found.",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (
      existingSession.student_id !==
      user.id
    ) {
      return new Response(
        JSON.stringify({
          error: "Forbidden.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    if (
      existingSession.lesson_mode !==
      lesson_mode
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Lesson mode does not match this session.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // SAVE STUDENT MESSAGE
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] user_message_insert_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      error:
        userMsgError,
    } =
      await adminClient
        .from(
          "chat_messages",
        )
        .insert({
          session_id:
            sessionId,
          role: "user",
          content:
            message,
        });

    console.log(
      "[CHAT TIMING] user_message_insert_complete",
      Date.now() -
        requestStartedAt,
    );

    if (userMsgError) {
      throw new Error(
        "Failed to save user message: " +
          userMsgError.message,
      );
    }

    // ─────────────────────────────────────────────────────────
    // FETCH HISTORY
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] history_fetch_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      data: history,
      error: historyError,
    } =
      await adminClient
        .from(
          "chat_messages",
        )
        .select(
          "role, content",
        )
        .eq(
          "session_id",
          sessionId,
        )
        .order(
          "created_at",
          { ascending: true },
        )
        .limit(30);

    console.log(
      "[CHAT TIMING] history_fetch_complete",
      Date.now() -
        requestStartedAt,
      {
        count:
          history?.length ??
          0,
      },
    );

    if (historyError) {
      throw new Error(
        "Failed to fetch history: " +
          historyError.message,
      );
    }

    const messages =
      (history || []).map(
        (m: any) => ({
          role:
            m.role,
          content:
            String(
              m.content,
            ),
        }),
      );

    // ─────────────────────────────────────────────────────────
    // STUDENT NAME STATE
    // ─────────────────────────────────────────────────────────

    const stateStartAt =
      Date.now();

    let studentName:
      | string
      | null =
      existingSession.student_name ||
      null;

    if (
      lesson_mode ===
      "self_intro"
    ) {
      const detectedName =
        detectStudentName(
          message,
        );

      if (detectedName) {
        studentName =
          detectedName;

        const {
          error:
            nameUpdateError,
        } =
          await adminClient
            .from(
              "chat_sessions",
            )
            .update({
              student_name:
                detectedName,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              sessionId,
            )
            .eq(
              "student_id",
              user.id,
            );

        if (
          nameUpdateError
        ) {
          throw new Error(
            "Failed to save student name: " +
              nameUpdateError.message,
          );
        }
      }
    }

    // ─────────────────────────────────────────────────────────
    // SELF-INTRO STATE
    // ─────────────────────────────────────────────────────────

    const coveredTopics =
      lesson_mode ===
      "self_intro"
        ? detectCoveredTopics(
            messages,
            studentName,
          )
        : new Set<
            string
          >();

    const lastAskedTopic =
      lesson_mode ===
      "self_intro"
        ? detectLastAskedTopic(
            messages,
          )
        : null;

    if (
      lesson_mode ===
        "self_intro" &&
      lastAskedTopic
    ) {
      coveredTopics.add(
        lastAskedTopic,
      );
    }

    console.log(
      "[CHAT TIMING] state_complete",
      Date.now() -
        requestStartedAt,
      {
        stateDuration:
          Date.now() -
          stateStartAt,
        lastAskedTopic,
        coveredTopics:
          [
            ...coveredTopics,
          ],
      },
    );

    // ─────────────────────────────────────────────────────────
    // FAREWELL / SIMPLE GREETING
    // ─────────────────────────────────────────────────────────

    const FAREWELLS = [
      "じゃまた",
      "さようなら",
      "またね",
      "またあした",
      "またこんど",
      "おやすみ",
      "しつれいします",
      "バイバイ",
      "ばいばい",
      "jya mata",
      "ja mata",
      "sayonara",
      "sayounara",
      "mata ne",
      "bye",
      "goodbye",
      "see you",
    ];

    const normalizedMessage =
      message
        .trim()
        .toLowerCase();

    const studentSaidGoodbye =
      FAREWELLS.some(
        (farewell) =>
          normalizedMessage.includes(
            farewell.toLowerCase(),
          ),
      );

    const SIMPLE_GREETINGS = [
      "hi",
      "hello",
      "hey",
      "こんにちは",
      "konnichiwa",
    ];

    const studentSaidSimpleGreeting =
      SIMPLE_GREETINGS.some(
        (greeting) =>
          normalizedMessage ===
          greeting,
      );

    // ─────────────────────────────────────────────────────────
    // SESSION LIMIT
    // ─────────────────────────────────────────────────────────

    const studentMsgCount =
      messages.filter(
        (m) =>
          m.role === "user",
      ).length;

    const limit =
      SESSION_LIMITS[
        lesson_mode
      ] || 10;

    const shouldWrapUp =
      studentMsgCount >=
        limit ||
      studentSaidGoodbye;

    // ─────────────────────────────────────────────────────────
    // GREETING DETERMINISTIC HANDLER
    // ─────────────────────────────────────────────────────────

    if (
      lesson_mode ===
        "greeting" &&
      studentSaidSimpleGreeting &&
      !shouldWrapUp
    ) {
      const greetingReply =
        buildReply(
          "こんにちは！よろしくおねがいします。",
          "Konnichiwa! Yoroshiku onegaishimasu.",
          "Yui responds warmly to your greeting.",
        );

      const {
        error:
          greetingInsertError,
      } =
        await adminClient
          .from(
            "chat_messages",
          )
          .insert({
            session_id:
              sessionId,
            role: "assistant",
            content:
              greetingReply,
          });

      if (
        greetingInsertError
      ) {
        throw new Error(
          "Failed to save assistant message: " +
            greetingInsertError.message,
        );
      }

      await adminClient
        .from(
          "chat_sessions",
        )
        .update({
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          sessionId,
        )
        .eq(
          "student_id",
          user.id,
        );

      return new Response(
        JSON.stringify({
          reply:
            greetingReply,
          session_id:
            sessionId,
          character:
            CHARACTER_META[
              lesson_mode
            ] ||
            CHARACTER_META
              .greeting,
          feedback: null,
          session_complete:
            false,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    // ─────────────────────────────────────────────────────────
    // STUDENT IDENTITY PROMPT
    // ─────────────────────────────────────────────────────────

    const studentIdentityInstruction =
      studentName
        ? `
=== STUDENT IDENTITY ===

The student's exact name is:

${studentName}

Preserve this exact name.

Never transliterate it.
Never romanize it.
Never change its script.
Never abbreviate it.
Never invent a different name.

You may append さん.

If the exact student name contains Kanji, do not invent a hiragana,
katakana, or Romaji reading for the name.

Because Japanese dialogue must contain no Kanji, do not address the
student by name in Japanese dialogue when the exact name contains Kanji.

Never replace the student's name with a different name.

The student's name is personal data and is exempt from
ordinary vocabulary conversion rules.
`
        : "";

    // ─────────────────────────────────────────────────────────
    // CONVERSATION STATE PROMPT
    // ─────────────────────────────────────────────────────────

    const conversationStateInstruction =
      lesson_mode ===
      "self_intro"
        ? `
=== SELF-INTRODUCTION STATE ===

Already answered topics:
${
  coveredTopics.size > 0
    ? [
        ...coveredTopics,
      ]
        .map(
          (topic) =>
            `- ${topic}`,
        )
        .join("\n")
    : "- none"
}

Previous assistant question:
${
  lastAskedTopic
    ? lastAskedTopic
    : "unknown"
}

Rules:

1. Never ask for an already answered topic.

2. The student's latest message is the primary message
   you must respond to.

3. If the previous assistant question was about
   ${lastAskedTopic || "a topic"}, treat the student's
   latest response as answering that topic unless the
   latest message clearly provides different information.

4. Short answers are valid answers to the previous question.
   For example, if the previous question asks for hometown,
   an answer such as "Japan" is a valid hometown answer.

5. Do not translate short English student answers into
   Japanese Kanji.

6. If the student answers in English, acknowledge the answer
   without inventing a Japanese translation of the student's
   personal information.

7. If several topics were answered in one message,
   treat all of them as answered.

8. Use this progression when applicable:
   university → year → major

9. Once university, year, or major is answered,
   do not ask it again.

10. Choose the next unanswered topic naturally from:
    hometown, university, year, major, age, hobby, likes.

11. Ask at most ONE question.

12. Never invent student information.
`
        : "";

    // ─────────────────────────────────────────────────────────
    // WRAP-UP PROMPT
    // ─────────────────────────────────────────────────────────

    const wrapUpInstruction =
      shouldWrapUp
        ? `
=== SESSION ENDING ===

The session should now conclude.

${
  studentSaidGoodbye
    ? "The student said goodbye. Respond warmly with a short farewell."
    : "The session reached its message limit. Conclude naturally."
}

Do not ask another question.
Do not introduce a new topic.
Keep the response short.
`
        : "";

    // ─────────────────────────────────────────────────────────
    // FINAL SYSTEM PROMPT
    // ─────────────────────────────────────────────────────────

    const finalSystemPrompt = `
You are a Japanese conversation practice partner
for a beginner JFS A0 student.

${RUNTIME_PROMPTS[lesson_mode]}

${SYLLABUS}

=== GLOBAL RESPONSE RULES ===

Respond to the student's CURRENT message.

=== CURRENT MESSAGE PRIORITY ===

Read the student's entire latest message before deciding what to say.

If the latest message contains multiple meaningful parts, handle all
relevant parts that can be answered within the assigned lesson.

Do not ignore a question because the same message also contains an
answer to the previous question.

For example, if the student says:
"I am fine. What's your name?"

acknowledge that the student is fine AND answer the question about
the character's name.

Never respond only to the first sentence when the latest message
contains a relevant question.

The latest student message has priority over the previous
conversation flow.

Never assume what the student will say.

Stay inside the assigned lesson scenario.

Use only beginner-level Japanese.

Do not invent student information.

Do not invent scenario facts.

Ask at most ONE question.

Never restart the opening.

Never introduce unrelated topics.

Japanese dialogue:
- no kanji under any circumstances
- hiragana and approved katakana only
- no English
- no romaji
- beginner Japanese only

If the student writes in English, do not copy the English
text into the Japanese dialogue unless that exact form is
approved by the syllabus.

Do not translate English student-provided personal information
into Kanji.

Romaji:
- must correspond directly to the Japanese dialogue
- use Latin letters and punctuation
- do not add information not present in Japanese

NOTE:
- English only
- maximum one sentence
- explain the character's response
- never instruct the student
- never provide an example answer
- never say "try answering"
- never say "you can say"
- never say "you can reply"

Arabic numerals are forbidden.

First person must be わたし.

Use only vocabulary appropriate to the approved syllabus.

Personal names must be preserved exactly.

${studentIdentityInstruction}

${conversationStateInstruction}

${wrapUpInstruction}

=== OUTPUT REQUIREMENT ===

Return ONLY a JSON object matching the supplied schema.

The JSON must contain exactly:
- japanese
- romaji
- note

Do not include Markdown.
Do not include response-format tags.
Do not include additional fields.
`;

    console.log(
      "[CHAT TIMING] prompt_ready",
      Date.now() -
        requestStartedAt,
      {
        promptLength:
          finalSystemPrompt.length,
        recentMessageCount:
          Math.min(
            messages.length,
            MAX_CONVERSATION_MESSAGES,
          ),
      },
    );

    // ─────────────────────────────────────────────────────────
    // AI HISTORY
    // ─────────────────────────────────────────────────────────

    const recentMessages =
      prepareHistoryForGroq(
        messages.slice(
          -MAX_CONVERSATION_MESSAGES,
        ),
      );

    // ─────────────────────────────────────────────────────────
    // GROQ REQUEST
    // ─────────────────────────────────────────────────────────

    const groqRequestBody = {
      model:
        GROQ_MODEL,

      messages: [
        {
          role: "system",
          content:
            finalSystemPrompt,
        },
        ...recentMessages,
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name:
            "nihongo_bot_reply",
          strict: true,
          schema:
            GROQ_REPLY_SCHEMA,
        },
      },

      max_completion_tokens:
        MAX_GROQ_COMPLETION_TOKENS,

      reasoning_effort:
        "low",

      reasoning_format:
        "hidden",

      temperature: 0.5,
    };

    let groqRes: Response;

    console.log(
      "[CHAT TIMING] groq_start",
      Date.now() -
        requestStartedAt,
    );

    try {
      groqRes =
        await callGroq(
          groqRequestBody,
          GROQ_TIMEOUT_MS,
        );

      console.log(
        "[CHAT TIMING] groq_complete",
        Date.now() -
          requestStartedAt,
        {
          status:
            groqRes.status,
        },
      );
    } catch (groqError) {
      console.error(
        "[CHAT TIMING] groq_failed",
        Date.now() -
          requestStartedAt,
        groqError,
      );

      if (
        groqError instanceof
          DOMException &&
        groqError.name ===
          "AbortError"
      ) {
        throw new Error(
          "The AI service took too long to respond.",
        );
      }

      throw groqError;
    }

    if (!groqRes.ok) {
      const errText =
        await groqRes.text();

      let groqErrorBody: unknown =
        errText;

      try {
        groqErrorBody =
          JSON.parse(errText);
      } catch {
        // Keep the original text when the response is not JSON.
      }

      console.error(
        "[GROQ API ERROR]",
        {
          status:
            groqRes.status,
          requestId:
            groqRes.headers.get(
              "x-request-id",
            ),
          groqRegion:
            groqRes.headers.get(
              "x-groq-region",
            ),
          body:
            groqErrorBody,
        },
      );

      if (
        groqRes.status ===
        429
      ) {
        throw new Error(
          "The AI service is temporarily rate-limited. Please try again shortly.",
        );
      }

      throw new Error(
        `Groq API error (${groqRes.status}).`,
      );
    }

    console.log(
      "[CHAT TIMING] groq_json_start",
      Date.now() -
        requestStartedAt,
    );

    const groqData =
      await groqRes.json();

    console.log(
      "[CHAT TIMING] groq_json_complete",
      Date.now() -
        requestStartedAt,
    );

    const candidate =
      groqData?.choices?.[0]
        ?.message?.content;

    if (
      typeof candidate !==
        "string" ||
      candidate.trim()
        .length === 0
    ) {
      throw new Error(
        "Groq returned an empty response.",
      );
    }

    let structuredReply: {
      japanese: string;
      romaji: string;
      note: string;
    };

    console.log(
      "[CHAT TIMING] validation_start",
      Date.now() -
        requestStartedAt,
    );

    try {
      structuredReply =
        validateStructuredReply(
          JSON.parse(candidate),
        );
    } catch (parseError) {
      console.error(
        "[GROQ STRUCTURED OUTPUT ERROR]",
        parseError,
      );

      throw new Error(
        "The AI returned an invalid structured response.",
      );
    }

    console.log(
      "[CHAT TIMING] validation_complete",
      Date.now() -
        requestStartedAt,
    );

    const reply =
      buildReply(
        structuredReply.japanese,
        structuredReply.romaji,
        structuredReply.note,
      );

    // ─────────────────────────────────────────────────────────
    // SAVE ASSISTANT RESPONSE
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] assistant_insert_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      error:
        assistantError,
    } =
      await adminClient
        .from(
          "chat_messages",
        )
        .insert({
          session_id:
            sessionId,
          role: "assistant",
          content:
            reply,
        });

    console.log(
      "[CHAT TIMING] assistant_insert_complete",
      Date.now() -
        requestStartedAt,
    );

    if (assistantError) {
      throw new Error(
        "Failed to save assistant message: " +
          assistantError.message,
      );
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE SESSION
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] session_update_start",
      Date.now() -
        requestStartedAt,
    );

    const {
      error:
        timestampError,
    } =
      await adminClient
        .from(
          "chat_sessions",
        )
        .update({
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          sessionId,
        )
        .eq(
          "student_id",
          user.id,
        );

    console.log(
      "[CHAT TIMING] session_update_complete",
      Date.now() -
        requestStartedAt,
    );

    if (timestampError) {
      console.error(
        "Failed to update session timestamp:",
        timestampError.message,
      );
    }

    // ─────────────────────────────────────────────────────────
    // BACKGROUND FEEDBACK
    // ─────────────────────────────────────────────────────────

    if (
      shouldWrapUp &&
      ENABLE_BACKGROUND_FEEDBACK
    ) {
      const feedbackPromise =
        generateAndSaveFeedback(
          {
            adminClient,
            sessionId,
            studentId:
              user.id,
            lessonMode:
              lesson_mode,
            messages,
          },
        );

      EdgeRuntime.waitUntil(
        feedbackPromise,
      );
    }

    // ─────────────────────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────────────────────

    console.log(
      "[CHAT TIMING] response_ready",
      Date.now() -
        requestStartedAt,
    );

    return new Response(
      JSON.stringify({
        reply,
        session_id:
          sessionId,
        character:
          CHARACTER_META[
            lesson_mode
          ] ||
          CHARACTER_META
            .greeting,
        feedback: null,
        session_complete:
          shouldWrapUp,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  } catch (err) {
    console.error(
      "[CHAT TIMING] request_failed",
      Date.now() -
        requestStartedAt,
    );

    console.error(
      "CHAT ERROR:",
      err,
    );

    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});