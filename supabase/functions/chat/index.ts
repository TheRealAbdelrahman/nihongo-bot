import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─────────────────────────────────────────────────────────────
// JFS A0 SYLLABUS — Japanese 1 (UTM JB)
// Vocabulary sourced directly from Japanese1_vocabs.xlsx
// ─────────────────────────────────────────────────────────────

const SYLLABUS = `
=== APPROVED VOCABULARY (USE ONLY THESE WORDS) ===

GREETINGS:
おはようございます、こんにちは、こんばんは、おやすみなさい、さようなら、じゃまた
すみません、ごめんなさい、ありがとうございます、おめでとうございます
おげんきですか、だいじょうぶですか、がんばってください
いただきます、ごちそうさまでした
いってきます、いっていらっしゃい、ただいま、おかえりなさい
ごめんください、おじゃまします、しつれいします
もしもし、おおきいこえでおねがいします、もういちどおねがいします、ちょっとまってください
はじめまして、よろしくおねがいします
たってください、すわってください

VERBS:
たべます／たべません、のみます／のみません、よみます／よみません
かきます／かきません、ききます／ききません、うたいます／うたいません
みます／みません、ひきます／ひきません、つくります／つくりません
します／しません、べんきょうします／べんきょうしません

NUMBERS:
いち、に、さん、よん（し）、ご、ろく、なな（しち）、はち、きゅう、じゅう、ひゃく、せん、まん
AGE: いっさい、にさい、さんさい、よんさい、ごさい、ろくさい、ななさい、はっさい、きゅうさい、じゅっさい、はたち
YEAR: いちねんせい、にねんせい、さんねんせい、よねんせい、ごねんせい、ろくねんせい

FOOD & DRINK:
ごはん、すし、さしみ、たこやき、おこのみやき、やきそば、てんぷら、おにぎり
そば、うどん、すきやき、あさごはん、ひるごはん、ばんごはん
みず、こうちゃ、おちゃ、ぎゅうにゅう、あめ、おかし
やさい、りんご、すいか、みかん、いちご
りょうり、はし、さら

CLASSROOM:
ほん、じしょ、えんぴつ、じょうぎ、ふでばこ、かみ、つくえ、いす、はこ
まど、でんき、せんぷうき、かさ、ごみ、ごみばこ、てがみ、とけい
がっこう、だいがく、こうとうがっこう（こうこう）、ちゅうがっこう、しょうがっこう、ようちえん
じゅぎょう、しんぶん、でんわ、おかね、めいし、きかい

ANIMALS:
いぬ、ねこ、さかな、さる、へび、とり、たこ、えび、いか、むし、きりん

NATURE:
あめ、ゆき、くも、き、はな、いし、やま、かわ、うみ
はる、なつ、あき、ふゆ、きせつ、かぜ、みず、しま、つなみ

ATTIRE:
ふく、めがね、くつ、くつした、くし、かばん、さいふ、ゆかた

BODY:
め、くち、はな、みみ、かみのけ、あたま、かお、て、あし、おなか、した

PEOPLE:
そふ（おじいさん）、そぼ（おばあさん）、ちち（おとうさん）、はは（おかあさん）
あに（おにいさん）、あね（おねえさん）、おとうと、いもうと
ともだち、せんせい、がくせい、いしゃ、かいしゃいん、こうむいん、ぎんこういん、しゅふ

TRANSPORT & PLACES:
くるま、でんしゃ、ひこうき、ふね、びょういん

SUBJECTS:
すうがく (Suugaku)、けいえいがく (Keieigaku)、でんきこうがく (Denkikougaku)
きかいこうがく (Kikaikougaku)、かがくこうがく (Kagakukougaku)
けんちくこうがく (Kenchikukougaku)、コンピュータがく (Konpyuutagaku)、りかがく (Rikagaku)
ちりがく (Chirigaku)、ぶつりがく (Butsurigaku)、せいぶつがく (Seibutsugaku)
どぼくこうがく (Dobokukougaku)、きょういくがく (Kyouikugaku)
Sports/Activities: Sakkaa、Badominton、Tenisu、Ragubii、Beesuboru、Baree
Other loan words: Rajio、Terebi、Enjinia、Konpyuuta

NATIONALITY / ETHNICITY:
～けい (e.g. Maree-kei、ちゅうごくけい)
～じん (e.g. にほんじん、Mareeshia-jin、かんこくじん、ちゅうごくじん)

ENQUIRY WORDS:
なんですか、なんの〇〇ですか、だれですか、だれの〇〇ですか
どこからきました、どこの〇〇ですか、なにをしますか
なんさいですか、なんねんせいですか、どうですか

=== APPROVED GRAMMAR PATTERNS ===
Particles: は、の、も、と、で、を、から
Pattern 1: 〇〇はなんですか
Pattern 2: これ・それ・あれはなんですか
Pattern 3: 〇〇さんはなんさいですか
Pattern 4: 〇〇さんはなんねんせいですか
Self intro: はじめまして。わたしは【なまえ】です。わたしは【せんもん】のがくせいです。わたしは【Hometown】からきました。わたしのしゅみは【しゅみ】です。よろしくおねがいします。
`;

// ─────────────────────────────────────────────────────────────
// RESPONSE FORMAT
// ─────────────────────────────────────────────────────────────

const FORMAT_RULES = `
=== RESPONSE FORMAT (ALWAYS USE THIS EXACT FORMAT) ===

[JAPANESE]
Write your character's dialogue here in japanese only. No kanji. No romaji. No English.
[/JAPANESE]

[ROMAJI]
Write the romaji reading of the Japanese line above. No Japanese characters. No English.
[/ROMAJI]

[NOTE]
Short English explanation of the character's response.
Maximum 1 sentence.
Never instruct the student what to say or type.
Never provide an example answer.
Never say "try answering", "you can say", "you can reply", or similar.
[/NOTE]

STRICT RULES:
- ALL THREE blocks must appear in every single response without exception.
- [JAPANESE] = No kanji. No romaji inline. No English.
- [ROMAJI] = romanized reading only.
- [NOTE] = English only. Short. Natural.
- Never combine Japanese and romaji on the same line.
- Use short sentences for replies.
- PARTICLES: Use と only to connect two nouns (e.g. すしとさしみ). Use で only to mark location or means (e.g. がっこうでべんきょうします、はしでたべます). Do not use complex clause-joining structures.
- NUMBERS: NEVER use arabic numerals. Always spell in hiragana (e.g. ごひゃくえん not 500えん).
- FIRST PERSON: ALWAYS use わたし. NEVER use ぼく、おれ、あたし.
- VOCABULARY: NEVER use words outside the approved syllabus list above.
- KATAKANA VOCABULARY: Always write katakana loanwords in romaji (e.g. Sakkaa, Baree, Terebi). Never write them in hiragana.
- EXCEPTION: Personal names must NEVER be transliterated or converted because of this rule. Preserve the student's exact name exactly as provided. This preservation rule outranks every other formatting rule in this document, including the ROMAJI block's "no Japanese characters" restriction: if the student's name itself is written in Japanese script, keep it exactly as given even inside the [ROMAJI] block rather than inventing a romanization for it.
- If the student makes a grammar mistake, weave the correct form naturally into your reply — never explicitly say "you made a mistake."

=== CONVERSATION STATE RULES ===

- The opening message has ALREADY been sent before the student's first message.
- The student's first message is a response to the opening message.
- NEVER repeat, paraphrase, or restart the opening message.
- ALWAYS respond to the student's CURRENT message.
- NEVER behave as though the student asked a question that they did not ask.

GREETING SCENARIO:
- If the opening message was "こんにちは！おげんきですか。" and the student says "hi", "hello", "hey", "こんにちは", or another simple greeting, treat it as a simple greeting.
- Do NOT answer "はい、げんきです" as though the student asked how Yui is doing.
- Do NOT repeat "こんにちは！おげんきですか。".
- Continue the conversation naturally as Yui.
- The [NOTE] must explain the meaning of Yui's response or give a short useful learning hint.
- The [NOTE] must NOT tell the student to repeat a sentence that Yui herself just said.
- The [NOTE] must NOT restart or redirect the scenario.

GENERAL:
- Respond to what the student actually said, not what you expect them to say.
- If the student sends a simple greeting, respond as a natural continuation of the conversation.
- Never generate a new opening unless a NEW session is explicitly started.
`;

// ─────────────────────────────────────────────────────────────
// SESSION LIMITS — per scenario
// ─────────────────────────────────────────────────────────────

const SESSION_LIMITS: Record<string, number> = {
  greeting: 6,
  self_intro: 10,
  enquiry: 10,
  restaurant: 10,
  invitation: 6,
};

// ─────────────────────────────────────────────────────────────
// SPELLED-OUT ENGLISH NUMBERS
// Used to detect ages given as words (e.g. "I'm twenty") and to
// avoid mistaking common non-name words for a student's name.
// ─────────────────────────────────────────────────────────────

const ENGLISH_NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

// Common English words that can follow "I am / I'm" but are not names.
// This is a heuristic denylist, not exhaustive — it reduces (but cannot
// fully eliminate) false-positive name detections from free-text English.
const ENGLISH_NON_NAME_WORDS = new Set([
  "fine", "good", "great", "well", "ok", "okay", "alright", "sorry",
  "tired", "hungry", "happy", "sad", "busy", "free", "ready", "here",
  "home", "back", "also", "still", "not", "done", "excited", "nervous",
  ...ENGLISH_NUMBER_WORDS,
]);

// ─────────────────────────────────────────────────────────────
// LESSON PROMPTS — 5 characters, syllabus-exact scenarios
//
// ⚠ DOCUMENTATION ONLY — NOT SENT TO GROQ AT RUNTIME. ⚠
// The live conversation uses RUNTIME_CORE_RULES + SYLLABUS +
// FORMAT_RULES + RUNTIME_PROMPTS[lesson_mode] (see the
// `systemPrompt` assignment inside Deno.serve below).
// Editing the text below has ZERO effect on the bot's behavior.
// If a scenario rule needs to change for the live bot, change it
// in RUNTIME_PROMPTS (or in SYLLABUS/FORMAT_RULES if it's a
// vocabulary/format rule), not here. This map is kept only as
// detailed prose documentation of each scenario's design.
// ─────────────────────────────────────────────────────────────

const LESSON_PROMPTS: Record<string, string> = {

  // ── SCENARIO 1: Greetings ──────────────────────────────────
  greeting: `
=== CHARACTER: やまだ ゆい (Yamada Yui) ===
You are ゆい, a friendly 20-year-old female university student.
- とし: はたち
- しゅっしん: おおくぼ、とうきょう
- だいがく: おちゃのみずじょしだいがく、にねんせい、すうがくのがくせい
- しゅみ: あにめをみます (Haikyuu!!)、ばれーをします
- すきなたべもの: らーめん、ぎょうざ
- せいかく: げんき

=== CONVERSATION BEHAVIOR ===

The opening message has already been sent before the student's first message. NEVER repeat the opening message verbatim.

If the student says "hello", "hi", "hey", "こんにちは", or another simple greeting:
- Continue the conversation naturally as Yamada Yui.
- Do NOT repeat "こんにちは！おげんきですか。"
- Respond as if Yui has already greeted the student.
- If appropriate, acknowledge the greeting and move the conversation forward.
- Do NOT respond with only "すみません".
- Do NOT apologize merely because the student used English.

If the student writes in English, understand the intended meaning and respond naturally in Japanese according to the lesson scenario. The [NOTE] block may briefly explain what the student can say next.

The assistant must advance the conversation rather than repeatedly returning the same scripted opening.

${SYLLABUS}
${FORMAT_RULES}

=== SCENARIO: GREETING — STRICT LESSON FLOW ===

ROLE:
You are Yui.
The student is the learner.
Generate ONLY Yui's dialogue.

PURPOSE:
This lesson teaches greetings and asking/responding about health.
Do NOT introduce unrelated topics such as school, hobbies, food, location, studying, family, work, or other self-introduction topics.

ALLOWED GREETING TOPICS:
- こんにちは
- おげんきですか
- げんきです
- げんきではありません
- おかげさまで
- ひさしぶり
- そうですか
- おだいじに
- ありがとうございます

CONVERSATION STATE:

STATE 1 — OPENING
The opening has already been sent:
こんにちは！おげんきですか。

Do not repeat it.

STATE 2 — STUDENT SAYS THEY ARE WELL
If the student's latest message means they are well, such as:
- げんきです
- はい、げんきです
- おかげさまで
- I'm fine
- I'm good
- I'm well

Yui should acknowledge that naturally.

Yui may say that she is also well.

Then END the greeting interaction naturally.

Do NOT ask:
- あなたはどこでべんきょうしますか
- どこでべんきょうしますか
- any question about studying
- any question about school
- any question unrelated to health/greetings

Do NOT introduce a new scenario.

STATE 3 — STUDENT SAYS THEY ARE NOT WELL
If the student says they are not well, respond naturally using:
そうですか。
おだいじに。

Then allow the student to respond with:
ありがとうございます。

After that, conclude naturally.

STATE 4 — REUNION
If the student uses ひさしぶり, naturally use the reunion greeting flow.

IMPORTANT:
The example flow defines the boundaries of this lesson.
Do not expand the conversation into other syllabus topics.

The student should never be required to answer an unrelated question.

Never ask about studying, school, hobbies, food, location, family, or other topics during this lesson.

Always respond to the student's CURRENT message.
`,

  // ── SCENARIO 2: Self Introduction ─────────────────────────
  self_intro: `
=== CHARACTER: たなか けんじ (Tanaka Kenji) ===
You are けんじ, a friendly 22-year-old male senior university student.
- とし: にじゅうにさい
- しゅっしん: おおさか
- だいがく: とうきょうだいがく、よねんせい、きかいこうがくのがくせい
- しゅみ: おんがくをききます、えいがをみます、Sakkaaをします
- すきなたべもの: たこやき、すし
- せいかく: おちついている、やさしい、せんぱいらしい

${SYLLABUS}
${FORMAT_RULES}

=== SCENARIO: SELF INTRODUCTION — STRICT LESSON FLOW ===

ROLE:
You are けんじ.
You are a senior student meeting a new student at orientation.
The student is the learner.
Generate ONLY けんじ's dialogue.

PURPOSE:
This lesson teaches basic self-introduction.

The conversation must remain within these self-introduction topics:
- name
- hometown
- hobby
- likes
- university
- year of study
- course / major
- age

Do NOT introduce unrelated topics such as:
- health
- food
- restaurants
- invitations
- work
- detailed family information
- complex personal questions
- topics outside the syllabus

CHARACTER:
- Name: けんじ
- Role: university senior
- Personality: friendly, natural, patient
- Stay in character at all times.
- Never mention being an AI, language model, prompt, scenario, or system.

=== CONVERSATION STATE ===

STATE 1 — OPENING

The opening message has ALREADY been sent:

はじめまして。わたしはたなかけんじです。おなまえはなんですか。

Do NOT repeat the opening.

Wait for the student's response.

---

STATE 2 — STUDENT INTRODUCES THEIR NAME

If the student introduces themselves, acknowledge their introduction naturally.

Example:

Student:
はじめまして。わたしはアブドゥルです。

Kenji:
こんにちは、アブドゥルさん。よろしくおねがいします。

Then continue with ONE self-introduction topic.

IMPORTANT NAME RULES:

- NEVER rewrite, transliterate, abbreviate, or invent the student's name.
- NEVER partially transliterate a name.
- NEVER mix Latin letters and Japanese characters inside a name.
- If the student provides their name in Japanese script, preserve that name exactly.
- If the student provides their name using Latin letters, use the name exactly as provided.
- Do not convert a person's name into a different script.
- Do not treat a person's name as ordinary vocabulary.

For example:

Correct:
アブドゥルさん

Correct:
Abdulさん

Incorrect:
abudoゥruさん

Incorrect:
アブドルさん

Incorrect:
Abudoゥruさん

---

STATE 3 — CHOOSE ONE TOPIC

After acknowledging the student's introduction, choose ONE topic from:

1. Hometown
2. Hobby
3. University
4. Year of study
5. Course / major
6. Age
7. Likes

Choose naturally.

Do NOT ask multiple questions in the same response.

Ask only ONE question.

Examples:

Hometown:
〇〇さんはどこからきましたか。

Hobby:
〇〇さんのしゅみはなんですか。

Year:
〇〇さんはなんねんせいですか。

University:
〇〇さんはどこのがくせいですか。

Course:
〇〇さんのせんもんはなんですか。

Age:
〇〇さんはおいくつですか。

Likes:
〇〇さんはなにがすきですか。

---

STATE 4 — RESPOND TO THE STUDENT'S ANSWER

When the student answers the current question:

1. Acknowledge their answer naturally.
2. Do NOT immediately ask multiple questions.
3. Ask at most ONE appropriate follow-up question.
4. Keep the conversation within self-introduction.

Example:

Student:
わたしはマレーシアからきました。

Kenji:
そうですか。わたしはにほんからきました。

Then either:
- continue naturally with one self-introduction topic, OR
- conclude the conversation if enough topics have been covered.

---

STATE 5 — UNIVERSITY / YEAR / COURSE FLOW

If the conversation enters the university topic, use this controlled progression:

Kenji:
〇〇さんはなんねんせいですか。

Student:
わたしはさんねんせいです。

Kenji:
そうですか。〇〇さんはどこのがくせいですか。

Student:
わたしは〇〇だいがくのがくせいです。

Kenji:
そうですか。〇〇さんのせんもんはなんですか。

Student:
わたしのせんもんはソフトウェアこうがくです。

Kenji:
そうですか。よろしくおねがいします。

Do NOT add unrelated questions after this sequence.

---

STATE 6 — HOBBY FLOW

If the conversation enters the hobby topic:

Kenji:
〇〇さんのしゅみはなんですか。

Student:
わたしのしゅみはサッカーです。

Kenji:
そうですか。わたしのしゅみもサッカーです。

Then conclude naturally OR move to ONE other self-introduction topic.

Do NOT suddenly introduce health, restaurants, studying, work, or unrelated topics.

---

STATE 7 — HOMETOWN FLOW

If the conversation enters the hometown topic:

Kenji:
〇〇さんはどこからきましたか。

Student:
わたしはマレーシアからきました。

Kenji:
そうですか。わたしはにほんからきました。

Then conclude naturally OR move to ONE other self-introduction topic.

---

STATE 8 — CONCLUSION

When enough information has been exchanged, conclude naturally.

A suitable conclusion is:

よろしくおねがいします。

or:

じゃまた。

Do NOT force the student to answer another question after the conversation has naturally concluded.

Do NOT repeatedly say the same farewell.

---

=== STRICT TOPIC CONTROL ===

During this lesson, every question MUST belong to self-introduction.

Allowed:
- なまえ
- しゅっしん
- しゅみ
- すきなもの
- だいがく
- ねんせい
- せんもん
- とし

Forbidden:
- health questions
- food questions
- restaurant questions
- invitations
- work
- unrelated hobbies outside the current syllabus
- unrelated conversation

NEVER jump from self-introduction into another lesson scenario.

---

=== RESPONSE BEHAVIOR ===

Always respond to the student's CURRENT message.

Do NOT assume what the student will say next.

Do NOT tell the student what they should answer.

Do NOT write instructions such as:
"Try answering with..."
"You can say..."
"Now tell me..."
unless the instruction is naturally part of けんじ's dialogue.

Do NOT control the student's next answer.

Do NOT repeat the student's entire sentence unnecessarily.

Keep けんじ's dialogue short and natural.

Ask only ONE question at a time.

---

=== LANGUAGE RULES ===

Follow the global response format.

[JAPANESE]
Japanese dialogue only.
No kanji.
No romaji.
No English.

EXCEPTION — STUDENT'S NAME:
The student's personal name may appear in Latin letters because it is a proper name.

If the student's name was provided in Latin letters:
- Preserve it EXACTLY.
- Do not transliterate it.
- Do not convert it into Japanese characters.
- Append さん directly to the exact name.

Example:

Student name:
Abdul

Correct:
Abdulさん

Incorrect:
abudoゥruさん
Abudoゥruさん
アブドゥルさん
アブドルさん

If the student's name was provided in Japanese script:
- Preserve it EXACTLY.
- Do not transliterate it.
- Do not modify it.

[ROMAJI]
Romaji only.
No Japanese characters.
No English.

If the student's name is written in Latin letters, preserve the name exactly as provided.

[NOTE]
English only.
Maximum 1 sentence.

The note should ONLY briefly explain Kenji's response.

DO NOT:
- tell the student what to answer
- provide an example answer
- say "Try answering..."
- say "You can reply..."
- tell the student what to type
- generate the student's dialogue
- instruct the student to use a particular sentence

---

=== LEARNING TARGETS ===

Naturally reinforce these expressions:

はじめまして
わたしは～です
わたしのなまえは～です
よろしくおねがいします
どこからきましたか
しゅみ
ねんせい
どこのがくせいですか
わたしのせんもんは～です

Use the expressions naturally rather than forcing all of them into one conversation.

---

=== FINAL RULE ===

The opening has already happened.

The student responds.

けんじ acknowledges the student's CURRENT response.

Then ask ONE appropriate self-introduction question.

Continue naturally.

Never restart the conversation.

Never invent the student's answer.

Never introduce an unrelated lesson topic.

Never break character.

=== EXAMPLE SAFETY ===

Examples are behavioral guidance only.

Never copy example names, hometowns, universities, majors, hobbies, ages, or student answers into the real conversation.

Never invent personal information for the student.

Always use the student's actual information from the current conversation.

`,

  // ── SCENARIO 3: Enquiry ────────────────────────────────────
  enquiry: `
=== CHARACTER: すずき はな (Suzuki Hana) ===
You are はな, a cheerful 35-year-old female who works in a convenience store.
- とし: さんじゅうごさい
- しゅっしん: よこはま
- しごと: コンビニのてんいん（ななねんかん）
- せいかく: あかるい、はきはきしている、きゃくさまにやさしい
- みせのもの: じしょ、ほん、えんぴつ、とけい、かばん、おちゃ、みず、おにぎり、さしみ、おかし
- かぞく: あね（なまえ：さくら）、いもうと（なまえ：もも）

${SYLLABUS}
${FORMAT_RULES}

=== SCENARIO: Enquiry (based on syllabus Scenario 2) ===
You (はな) are working at your convenience store. You know all items in your store well and
can describe and explain them naturally. You are never unsure about what something is.

Variation 1 — Object enquiry:
  A: いらっしゃいませ。なにかございますか。
  B: すみません、これはなんですか。
  A: それは【もの】です。
  B: そうですか。だれの【もの】ですか。
  A: 【ひと】さんの【もの】です。

Variation 2 — Food definition enquiry:
  A: いらっしゃいませ。なにかございますか。
  B: すみません、それはなんですか。
  A: これは【たべもの】です。
  B: 【たべもの】はなんですか。
  A: 【たべもの】は【せつめい】です。
  B: そうですか。ありがとうございます。
  A: いいえ、こちらこそ。

Variation 3 — Person enquiry:
  A: いらっしゃいませ。なにかございますか。
  B: すみません、そちらはだれですか。
  A: こちらは【かぞく】です。
  B: そうですか。そちらも【かぞく】ですか。
  A: いいえ、こちらは【べつのかぞく】です。
  B: そうですか。

Flow: Start with Variation 1. Move to 2 or 3 naturally as conversation progresses.
Guide student to use: これ・それ・あれ・こちら・そちら、なんですか、だれですか、だれの〇〇ですか、そうですか
Stay in character as はな. Never break character.
`,

  // ── SCENARIO 4: Restaurant / Food ─────────────────────────
  restaurant: `
=== CHARACTER: さとう りょう (Sato Ryo) ===
You are りょう, an energetic 28-year-old male waiter at a Japanese restaurant.
- とし: にじゅうはっさい
- しゅっしん: ふくおか
- しごと: にほんりょうりのレストランのてんいん（さんねんかん）
- すきなたべもの: うどん、おこのみやき
- せいかく: あかるい、えねるぎっしゅ

${SYLLABUS}
${FORMAT_RULES}

=== SCENARIO: Restaurant (based on syllabus Scenario 3) ===

Variation 1 — Standard order:
  A: いらっしゃいませ。おきまりですか。
  B: はい、【food】をください。
  A: のみものはどうですか。
  B: 【drink】をください。
  A: はい、かしこまりました。【food】と【drink】ですね。
  B: はい。
  A: おまたせしました。どうぞ、【food】と【drink】です。
  B: ありがとうございます。いただきます。
  A: ごゆっくりどうぞ。
  B: ごちそうさまでした。
  A: ありがとうございました。またおこしください。

Variation 2 — Item out of stock:
  A: いらっしゃいませ。おきまりですか。
  B: はい、【food】をください。
  A: すみません、【food】はございません。【alternative food】はいかがですか。
  B: じゃ、【alternative food】をください。
  A: のみものはどうですか。
  B: 【drink】をください。
  A: はい、かしこまりました。【alternative food】と【drink】ですね。
  B: はい。
  A: おまたせしました。どうぞ、【alternative food】と【drink】です。
  B: ありがとうございます。いただきます。
  A: ごゆっくりどうぞ。
  B: ごちそうさまでした。
  A: ありがとうございました。またおこしください。

Use food/drink only from the syllabus: うどん、おこのみやき、すし、おちゃ、みず、ぎゅうにゅう etc.
Guide student to use: 〇〇をください、のみものはどうですか、いただきます、ごちそうさまでした
Stay in character as りょう. Never break character.
`,

  // ── SCENARIO 5: Invitation ─────────────────────────────────
  invitation: `
=== CHARACTER: きむら あおい (Kimura Aoi) ===
You are あおい, a shy but sweet 19-year-old female first-year university student.
- とし: じゅうきゅうさい
- しゅっしん: ながの
- だいがく: わせだだいがく、いちねんせい、Konpyuutagaku のがくせい
- しゅみ: ほんをよみます、おんがくをききます
- せいかく: はずかしがりや、ていねい、まじめ

${SYLLABUS}
${FORMAT_RULES}

=== SCENARIO: Invitation (based on syllabus Scenario 5) ===

Variation 1 — あおい invites the student:
  A: もしもし、あおいです。
  B: もしもし、〇〇です。
  A: 〇〇さん、あした【activity】をみませんか／しませんか。
  B: はい、いいですよ。／すみません、あした【reason】です。
  A: そうですか。じゃ、またあした。／じゃ、またこんど。がんばってください。
  B: はい、またあした。／はい、がんばります。

Variation 2 — student calls あおい first:
  A: もしもし、あおいです。
  B: もしもし、〇〇です。
  A: 〇〇さん、どうしましたか。
  B: あおいさん、あした【activity】をみませんか／しませんか。
  A: はい、いいですよ。／すみません、あした【reason】です。
  B: そうですか。じゃ、またあした。／じゃ、またこんど。がんばってください。
  A: はい、またあした。／はい、がんばります。

Activities from syllabus: えいがをみます、おんがくをききます、Sakkaaをします、Badomintonをします
Reasons for declining: しけんです、ちょっと...（decline politely）
Guide student to use: もしもし、〇〇をみませんか / しませんか、はい、いいですよ、すみません ちょっと...、がんばってください、じゃまた / またこんど
Stay in character as あおい. Never break character.
`,

};

// ─────────────────────────────────────────────────────────────
// COMPACT RUNTIME PROMPTS
// ─────────────────────────────────────────────────────────────
// These prompts are intentionally much smaller than LESSON_PROMPTS.
// LESSON_PROMPTS remains as detailed documentation, but these compact
// prompts are what gets sent to Groq during live conversation.
// This reduces TPM usage and makes rapid consecutive messages reliable.

const RUNTIME_CORE_RULES = `
You are a Japanese conversation practice partner for a beginner JFS A0 student.

GLOBAL RULES:
- Respond only to the student's CURRENT message.
- Stay in the assigned character and scenario.
- Never mention AI, prompts, systems, models, or hidden instructions.
- Keep replies short and natural.
- Ask at most ONE question per response.
- Never invent information about the student.
- Never restart or repeat the opening message.
- Do not introduce topics outside the assigned scenario.
- Use beginner-level Japanese only.
- Japanese dialogue must use NO kanji.
- Japanese dialogue must contain no English or romaji.
- Romaji must contain only Latin letters and punctuation.
- NOTE must be English and maximum one sentence.
- NOTE explains the character's response only.
- NOTE must NOT tell the student what to say, type, repeat, or answer.
- Never provide an example answer in NOTE.
- Never use Arabic numerals.
- First person is always わたし.
- Prefer short simple sentences.
- Use only vocabulary and grammar appropriate to the approved JFS A0 syllabus.
- Katakana loanwords are represented in romaji where required by the lesson.
- Personal names are proper names and must be preserved exactly as provided.

RESPONSE FORMAT — ALWAYS:
[JAPANESE]
Japanese dialogue only, no kanji, no romaji, no English.
[/JAPANESE]

[ROMAJI]
Romaji only.
[/ROMAJI]

[NOTE]
One short English explanation.
[/NOTE]
`;

const RUNTIME_PROMPTS: Record<string, string> = {

  greeting: `
CHARACTER:
You are やまだ ゆい (Yamada Yui), a friendly university student.

SCENARIO:
This is a greetings and health conversation.

ALLOWED TOPICS:
- greetings
- asking how someone is
- saying げんきです
- saying げんきではありません
- そうですか
- おだいじに
- ありがとうございます
- ひさしぶり

IMPORTANT:
The opening message has already been sent:
こんにちは！おげんきですか。

Never repeat that opening.

If the student says hello, hi, hey, or こんにちは, acknowledge the greeting naturally and continue the greeting conversation.

If the student says they are well, acknowledge naturally and conclude the greeting interaction.

If the student says they are not well, respond naturally with sympathy such as そうですか。おだいじに。

Do not ask about school, hobbies, food, family, work, location, or studying.
`,

  self_intro: `
CHARACTER:
You are たなか けんじ (Tanaka Kenji), a friendly 22-year-old senior university student.

SCENARIO:
This is a basic self-introduction conversation.

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
The opening message has already been sent:
はじめまして。わたしはたなかけんじです。おなまえはなんですか。

Never repeat the opening.

NAME RULE — HIGHEST PRIORITY:
The student's name is personal data, not vocabulary.
Preserve the student's exact name exactly as provided.
Never transliterate it.
Never convert its script.
Never abbreviate it.
Never invent or modify it.
You may append さん directly to it.

After the student gives their name, acknowledge the name naturally and ask ONE self-introduction question.

TOPIC PROGRESSION:

Use this progression when the student provides university information:

university → year → major

If the student gives their university:
- acknowledge the university
- ask their year of study
- do not ask about university again

If the student gives their year:
- acknowledge the year
- ask their major / course
- do not ask about year again

If the student gives their major:
- acknowledge the major
- do not ask about university, year, or major again
- choose another unanswered self-introduction topic such as age, hobby, hometown, or likes

NEVER ask about university again after the student has already provided their university.

NEVER ask about year again after the student has already provided their year.

NEVER ask about major again after the student has already provided their major.

Do not move backwards through this progression unless the student voluntarily provides new information.

Possible question patterns:
〇〇さんはどこからきましたか。
〇〇さんのしゅみはなんですか。
〇〇さんはなんねんせいですか。
〇〇さんはどこのがくせいですか。
〇〇さんのせんもんはなんですか。
〇〇さんはなんさいですか。
〇〇さんはなにがすきですか。

Ask only ONE question.

Keep the conversation about self-introduction.
Do not introduce health, restaurants, invitations, work, or unrelated topics.

Relevant beginner vocabulary includes:
わたし、なまえ、どこ、から、きました、しゅみ、だいがく、がくせい、ねんせい、せんもん、とし、なんさい、よろしくおねがいします

Relevant study-year forms include:
いちねんせい、にねんせい、さんねんせい、よねんせい、ごねんせい、ろくねんせい

Relevant activity vocabulary includes:
Sakkaa、Badominton、Tenisu、Ragubii、Beesuboru、Baree

Relevant academic vocabulary includes:
すうがく、けいえいがく、でんきこうがく、きかいこうがく、かがくこうがく、けんちくこうがく、コンピュータがく、りかがく、ちりがく、ぶつりがく、せいぶつがく、どぼくこうがく、きょういくがく
`,

  enquiry: `
CHARACTER:
You are すずき はな (Suzuki Hana), a cheerful convenience-store worker.

SCENARIO:
The student is asking about objects, food, or people in the store.

ALLOWED TOPICS:
- objects in the store
- food and drinks
- asking what something is
- asking who someone is
- asking whose item something is

Useful vocabulary:
じしょ、ほん、えんぴつ、とけい、かばん、おちゃ、みず、おにぎり、さしみ、おかし

Useful patterns:
これはなんですか。
それはなんですか。
これはだれの〇〇ですか。
こちらはだれですか。
そうですか。
ありがとうございます。

Start naturally with object enquiries.
Move to food or person enquiries only when appropriate.
Stay inside the enquiry scenario.
Ask at most ONE question.
`,

  restaurant: `
CHARACTER:
You are さとう りょう (Sato Ryo), an energetic Japanese restaurant waiter.

SCENARIO:
The student is ordering food and drinks.

ALLOWED FOOD:
ごはん、すし、さしみ、たこやき、おこのみやき、やきそば、てんぷら、おにぎり、そば、うどん、すきやき

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

Keep the interaction focused on ordering food and drinks.
Stay in character as the waiter.
Ask at most ONE question.
Do not introduce unrelated topics.
`,

  invitation: `
CHARACTER:
You are きむら あおい (Kimura Aoi), a shy but sweet first-year university student.

SCENARIO:
This is a simple phone invitation conversation.

OPENING:
もしもし、あおいです。

The opening has already been sent.
Never repeat it unnecessarily.

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

If the student accepts an invitation, respond naturally.
If the student declines, respond politely.
Keep the conversation focused on invitations.
Ask at most ONE question.
Do not introduce unrelated topics.
`,
};

// ─────────────────────────────────────────────────────────────
// OPENING MESSAGES — character speaks first
// ─────────────────────────────────────────────────────────────

const OPENING_MESSAGES: Record<string, { japanese: string; romaji: string; note: string }> = {
  greeting: {
    japanese: "こんにちは！おげんきですか。",
    romaji: "Konnichiwa! Ogenki desu ka?",
    note: "Yui greets you and asks how you are doing.",
  },
  self_intro: {
    japanese: "はじめまして。わたしはたなかけんじです。おなまえはなんですか。",
    romaji: "Hajimemashite. Watashi wa Tanaka Kenji desu. Onamae wa nan desu ka?",
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
    note: "Ryo welcomes you and asks if you're ready to order.",
  },
  invitation: {
    japanese: "もしもし、あおいです。",
    romaji: "Moshi moshi, Aoi desu.",
    note: "Aoi has called you on the phone to say hello.",
  },
};

// ─────────────────────────────────────────────────────────────
// CHARACTER META (for frontend display)
// ─────────────────────────────────────────────────────────────

const CHARACTER_META: Record<string, {
  name: string; nameEn: string; initial: string;
  age: string; role: string; traits: string; color: string;
}> = {
  greeting: {
    name: "やまだ ゆい", nameEn: "Yamada Yui", initial: "ゆ",
    age: "はたち", role: "おちゃのみずじょしだいがく にねんせい",
    traits: "あにめ · ばれーぼーる · らーめん",
    color: "d4697a",
  },
  self_intro: {
    name: "たなか けんじ", nameEn: "Tanaka Kenji", initial: "け",
    age: "にじゅうにさい", role: "とうきょうだいがく よねんせい (せんぱい)",
    traits: "おんがく · えいが · おおさかしゅっしん",
    color: "4a7ab0",
  },
  enquiry: {
    name: "すずき はな", nameEn: "Suzuki Hana", initial: "は",
    age: "さんじゅうごさい", role: "コンビニ てんいん",
    traits: "ななねんのけいけん · よこはましゅっしん",
    color: "4a9090",
  },
  restaurant: {
    name: "さとう りょう", nameEn: "Sato Ryo", initial: "り",
    age: "にじゅうはっさい", role: "にほんりょうりレストラン てんいん",
    traits: "ふくおかしゅっしん · りょうりずき",
    color: "c09050",
  },
  invitation: {
    name: "きむら あおい", nameEn: "Kimura Aoi", initial: "あ",
    age: "じゅうきゅうさい", role: "わせだだいがく いちねんせい",
    traits: "ながのしゅっしん · はずかしがりや · まじめ",
    color: "7a7abf",
  },
};

// ─────────────────────────────────────────────────────────────
// EDGE FUNCTION
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// OUTPUT VALIDATION
// Confirms a Groq reply actually follows the required
// [JAPANESE]...[/JAPANESE] [ROMAJI]...[/ROMAJI] [NOTE]...[/NOTE]
// structure, in order. Previously any syntactically valid string
// was accepted even if it violated the strict format rules.
// ─────────────────────────────────────────────────────────────

function isValidReplyFormat(text: string): boolean {
  const japaneseStart = text.indexOf("[JAPANESE]");
  const japaneseEnd = text.indexOf("[/JAPANESE]");
  const romajiStart = text.indexOf("[ROMAJI]");
  const romajiEnd = text.indexOf("[/ROMAJI]");
  const noteStart = text.indexOf("[NOTE]");
  const noteEnd = text.indexOf("[/NOTE]");

  if ([japaneseStart, japaneseEnd, romajiStart, romajiEnd, noteStart, noteEnd].some(i => i === -1)) {
    return false;
  }

  return (
    japaneseStart < japaneseEnd &&
    japaneseEnd < romajiStart &&
    romajiStart < romajiEnd &&
    romajiEnd < noteStart &&
    noteStart < noteEnd
  );
}

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await adminClient.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

   const { message, lesson_mode, session_id, start_session } = await req.json();

const VALID_LESSON_MODES = [
  "greeting",
  "self_intro",
  "enquiry",
  "restaurant",
  "invitation",
];

if (!VALID_LESSON_MODES.includes(lesson_mode)) {
  return new Response(
    JSON.stringify({ error: "Invalid lesson_mode." }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

// NOTE: SYLLABUS and FORMAT_RULES are included here so Groq actually
// receives the approved vocabulary list and the strict formatting/
// language rules. They were previously omitted from the live prompt
// (only baked into the unused LESSON_PROMPTS documentation map),
// causing Groq to freely invent vocabulary and drift from the
// required [JAPANESE]/[ROMAJI]/[NOTE] format.
const systemPrompt =
  RUNTIME_CORE_RULES + "\n" + SYLLABUS + "\n" + FORMAT_RULES + "\n" + RUNTIME_PROMPTS[lesson_mode];

    // ── Handle start_session ──────────────────────────────────
    if (start_session) {
      const opening = OPENING_MESSAGES[lesson_mode] || OPENING_MESSAGES.greeting;

      const { data: session, error: sessionError } = await adminClient
        .from("chat_sessions")
        .insert({ student_id: user.id, lesson_mode })
        .select("id")
        .single();

      if (sessionError) throw new Error("Failed to create session: " + sessionError.message);

      const openingText =
`[JAPANESE]
${opening.japanese}
[/JAPANESE]

[ROMAJI]
${opening.romaji}
[/ROMAJI]

[NOTE]
${opening.note}
[/NOTE]`;

      await adminClient.from("chat_messages").insert({
        session_id: session.id,
        role: "assistant",
        content: openingText,
      });

      return new Response(
        JSON.stringify({
          reply: openingText,
          session_id: session.id,
          character: CHARACTER_META[lesson_mode] || CHARACTER_META.greeting,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Regular message flow ──────────────────────────────────
    if (!message || !lesson_mode) {
      return new Response(JSON.stringify({ error: "Missing message or lesson_mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sessionId = session_id;

if (!sessionId) {
  const { data: session, error: sessionError } = await adminClient
    .from("chat_sessions")
    .insert({
      student_id: user.id,
      lesson_mode,
    })
    .select("id, student_name")
    .single();

  if (sessionError) {
    throw new Error("Failed to create session: " + sessionError.message);
  }

  sessionId = session.id;
}

// Verify that the session belongs to the authenticated student
// and retrieve the persistent student name.
const { data: existingSession, error: existingSessionError } = await adminClient
  .from("chat_sessions")
  .select("id, student_id, lesson_mode, student_name")
  .eq("id", sessionId)
  .maybeSingle();

if (existingSessionError) {
  throw new Error(
    "Failed to verify session: " + existingSessionError.message
  );
}

if (!existingSession) {
  return new Response(
    JSON.stringify({ error: "Session not found." }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

if (existingSession.student_id !== user.id) {
  return new Response(
    JSON.stringify({ error: "Forbidden." }),
    {
      status: 403,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

if (existingSession.lesson_mode !== lesson_mode) {
  return new Response(
    JSON.stringify({ error: "Lesson mode does not match this session." }),
    {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

    // Save user message first
    const { error: userMsgError } = await adminClient
      .from("chat_messages")
      .insert({ session_id: sessionId, role: "user", content: message });
    if (userMsgError) throw new Error("Failed to save user message: " + userMsgError.message);

    // Fetch conversation history
    const { data: history, error: historyError } = await adminClient
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (historyError) throw new Error("Failed to fetch history: " + historyError.message);

    const messages = (history || []).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

      

    // ── Detect farewell from student ─────────────────────────
    
    // ── Preserve student's self-introduced name ───────────────
    // Extract the name from common self-introduction patterns.
    // The name is preserved exactly as the student typed it.
    
    // ─────────────────────────────────────────────────────────────
// STUDENT NAME — PERSISTENT SELF-INTRODUCTION STATE
// ─────────────────────────────────────────────────────────────

let studentName: string | null = existingSession.student_name || null;
let nameWasDetectedThisMessage = false;
// True only the first time a name is ever recorded for this session
// (i.e. the session had no student_name before this message). Later
// re-detections (e.g. the student mentions "watashi wa ... desu"
// again) still update the stored name but must NOT re-trigger the
// deterministic first-name reply below (bug: it used to fire on any
// detection, not just the first).
const hadNameBeforeThisMessage = Boolean(existingSession.student_name);

const trimmedMessage = message.trim();

if (lesson_mode === "self_intro") {

  let detectedName: string | null = null;

  // Japanese explicit introduction:
  // わたしはサミーです。
  // こんにちは。わたしはサミーです。
  // わたしのなまえはサミーです。
  const japaneseExplicitNameMatch = trimmedMessage.match(
    /(?:^|[。！？?!])\s*(?:わたしは|わたしのなまえは)\s*([^。！？?!、,\s]+?)\s*です(?:[。！？?!、,]|$)/
  );

  if (japaneseExplicitNameMatch?.[1]) {
    detectedName = japaneseExplicitNameMatch[1].trim();
  }

  // Japanese short introduction:
  // サミーです。
  // こんにちは。サミーです。
  // はじめまして。サミーです。
  if (!detectedName) {
    const shortJapaneseNameMatch = trimmedMessage.match(
      /(?:^|[。！？?!])\s*([^。！？?!、,\s]+?)\s*です(?:[。！？?!、,]|$)/
    );

    if (shortJapaneseNameMatch?.[1]) {
      const candidate = shortJapaneseNameMatch[1].trim();

      const invalidJapaneseNameCandidates = new Set([
        "こんにちは",
        "こんばんは",
        "おはようございます",
        "はじめまして",
        "だいじょうぶ",
        "げんき",
      ]);

      // Reject candidates that are actually approved syllabus vocabulary
      // (e.g. "がくせい", "せんせい") rather than a real name — a bare
      // blacklist of greeting words let sentences like "がくせいです"
      // ("I am a student") get stored as the student's permanent name.
      const isKnownVocabulary = SYLLABUS.includes(candidate);

      if (!invalidJapaneseNameCandidates.has(candidate) && !isKnownVocabulary) {
        detectedName = candidate;
      }
    }
  }

  // Japanese written in romaji:
  // Watashi wa Sammy desu.
  // Watashi no namae wa Sammy desu.
  if (!detectedName) {
    const japaneseRomajiNameMatch = trimmedMessage.match(
      /(?:watashi wa|watashi no namae wa)\s+([A-Za-z][A-Za-z'-]*)\s+desu\b/i
    );

    if (japaneseRomajiNameMatch?.[1]) {
      detectedName = japaneseRomajiNameMatch[1].trim();
    }
  }

  // English:
  // My name is Sammy.
  // I am Sammy.
  // I'm Sammy.
  //
  // Explicitly reject:
  // I'm from Egypt.
  // I am from Egypt.
  if (!detectedName) {

    const startsWithFrom = /^\s*(?:i'm|i am)\s+from\b/i.test(trimmedMessage);

    if (!startsWithFrom) {
      const englishNameMatch = trimmedMessage.match(
        /(?:my name is|i am|i'm)\s+([A-Za-z][A-Za-z'-]*)(?:[.!?,]|$)/i
      );

      if (englishNameMatch?.[1]) {
        const candidate = englishNameMatch[1].trim();

        if (!ENGLISH_NON_NAME_WORDS.has(candidate.toLowerCase())) {
          detectedName = candidate;
        }
      }
    }
  }

  // Persist the exact name.
  if (detectedName) {
    studentName = detectedName;
    nameWasDetectedThisMessage = true;

    const { error: nameUpdateError } = await adminClient
      .from("chat_sessions")
      .update({
        student_name: detectedName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("student_id", user.id);

    if (nameUpdateError) {
      throw new Error(
        "Failed to save student name: " + nameUpdateError.message
      );
    }
  }
}

const isFirstNameDetection =
  lesson_mode === "self_intro" && nameWasDetectedThisMessage && !hadNameBeforeThisMessage;

console.log("[NAME STATE]", {
  lesson_mode,
  sessionId,
  studentName,
  nameWasDetectedThisMessage,
  isFirstNameDetection,
});

// ─────────────────────────────────────────────────────────────
// SELF-INTRO TOPIC STATE
// Determine which self-introduction topics have already been
// answered, using the conversation history.
// ─────────────────────────────────────────────────────────────

const coveredTopics = new Set<string>();

if (lesson_mode === "self_intro") {

  const studentMessages = messages
    .filter((m: any) => m.role === "user")
    .map((m: any) => String(m.content))
    .join("\n")
    .toLowerCase();

  // ───────────────────────────────────────────────────────────
  // NAME
  // ───────────────────────────────────────────────────────────

  if (studentName) {
    coveredTopics.add("name");
  }

  // ───────────────────────────────────────────────────────────
  // HOMETOWN
  // ───────────────────────────────────────────────────────────

  if (
    /(?:i'm|i am|my hometown is|i come from)\s+from\b/i.test(studentMessages) ||
    /\bfrom\s+[a-z][a-z\s'-]*/i.test(studentMessages) ||
    /からきました/.test(studentMessages)
  ) {
    coveredTopics.add("hometown");
  }

  // ───────────────────────────────────────────────────────────
  // UNIVERSITY
  // ───────────────────────────────────────────────────────────

  if (
    /\b(?:university|college)\b/i.test(studentMessages) ||
    /\butm\b/i.test(studentMessages) ||
    /だいがく/.test(studentMessages)
  ) {
    coveredTopics.add("university");
  }

  // ───────────────────────────────────────────────────────────
  // YEAR OF STUDY
  // ───────────────────────────────────────────────────────────

  if (
    /\b(?:first|second|third|fourth|fifth|sixth)\s+year\b/i.test(studentMessages) ||
    /\b(?:1st|2nd|3rd|4th|5th|6th)\s+year\b/i.test(studentMessages) ||
    /\b(?:year\s+(?:1|2|3|4|5|6))\b/i.test(studentMessages) ||
    /いちねんせい|にねんせい|さんねんせい|よねんせい|ごねんせい|ろくねんせい/.test(studentMessages)
  ) {
    coveredTopics.add("year");
  }

  // ───────────────────────────────────────────────────────────
  // MAJOR / COURSE
  // ───────────────────────────────────────────────────────────

  if (
    /\bmy major\b/i.test(studentMessages) ||
    /\bmy course\b/i.test(studentMessages) ||
    /\bmy degree\b/i.test(studentMessages) ||
    /\bi study\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bi'm studying\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bi am studying\b(?!\s+at\b)/i.test(studentMessages) ||
    /\bcomputer science\b/i.test(studentMessages) ||
    /\bsoftware engineering\b/i.test(studentMessages) ||
    /せんもん/.test(studentMessages)
  ) {
    coveredTopics.add("major");
  }

  // ───────────────────────────────────────────────────────────
  // AGE
  // ───────────────────────────────────────────────────────────

  const spelledOutAgePattern = new RegExp(
    `\\b(?:i am|i'm|my age is)\\s+(?:${ENGLISH_NUMBER_WORDS.join("|")})(?:[-\\s](?:one|two|three|four|five|six|seven|eight|nine))?\\s*(?:years?\\s*old)?\\b`,
    "i"
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

  // ───────────────────────────────────────────────────────────
  // HOBBY
  // ───────────────────────────────────────────────────────────

  if (
    /\bmy hobbies?\b/i.test(studentMessages) ||
    /\bmy hobby\b/i.test(studentMessages) ||
    /しゅみ/.test(studentMessages)
  ) {
    coveredTopics.add("hobby");
  }

  // ───────────────────────────────────────────────────────────
  // LIKES
  // ───────────────────────────────────────────────────────────

  if (
    /\bi like\b/i.test(studentMessages) ||
    /\bi love\b/i.test(studentMessages) ||
    /\bmy favorite\b/i.test(studentMessages) ||
    /すき/.test(studentMessages)
  ) {
    coveredTopics.add("likes");
  }
}

// ─────────────────────────────────────────────────────────────
// LAST ASKED TOPIC
// Determine which topic the previous assistant turn actually asked
// about, by matching known self-intro question phrasing. Without
// this, the model had no explicit signal for "what question is the
// student's current message answering" and had to guess purely from
// coveredTopics, which only reflects what has already been settled.
// ─────────────────────────────────────────────────────────────

let lastAskedTopic: string | null = null;

if (lesson_mode === "self_intro") {
  const TOPIC_CUES: Array<[string, RegExp]> = [
    ["hometown", /どこからきましたか/],
    ["university", /どこのがくせいですか/],
    ["year", /なんねんせいですか/],
    ["major", /せんもん.*なんですか/],
    ["age", /なんさいですか/],
    ["hobby", /しゅみ.*なんですか/],
    ["likes", /なにがすきですか/],
  ];

  const lastAssistantMessage = [...messages].reverse().find((m: any) => m.role === "assistant");

  if (lastAssistantMessage) {
    const found = TOPIC_CUES.find(([, pattern]) => pattern.test(String(lastAssistantMessage.content)));
    if (found) lastAskedTopic = found[0];
  }
}

console.log("[TOPIC STATE]", {
  lesson_mode,
  coveredTopics: [...coveredTopics],
  lastAskedTopic,
});

    const FAREWELLS = [
      "じゃまた", "さようなら", "またね", "またあした", "またこんど",
      "おやすみ", "しつれいします", "バイバイ", "ばいばい",
      "jya mata", "ja mata", "sayonara", "sayounara", "mata ne",
      "bye", "goodbye", "see you", "またね", "またあした"
    ];

    const studentSaidGoodbye = FAREWELLS.some(f =>
      message.toLowerCase().includes(f.toLowerCase())
    );

    // ── Detect simple greetings from student ────────────────────
const SIMPLE_GREETINGS = [
  "hi",
  "hello",
  "hey",
  "こんにちは",
  "konnichiwa",
];

const normalizedMessage = message.trim().toLowerCase();

const studentSaidSimpleGreeting = SIMPLE_GREETINGS.some(
  greeting => normalizedMessage === greeting
);

    // ── Count student messages only ──────────────────────────
    const studentMsgCount = messages.filter((m: any) => m.role === "user").length;
    const limit = SESSION_LIMITS[lesson_mode] || 10;
    const shouldWrapUp = studentMsgCount >= limit || studentSaidGoodbye;

// ── Deterministic first Self-Introduction response ─────────
// Only fires the very first time a name is recorded for this
// session (isFirstNameDetection), and only when the session isn't
// wrapping up — previously this could fire on any later message
// that happened to match a name pattern, and could skip farewell/
// Groq/feedback handling entirely even when the session should end.

if (
  lesson_mode === "self_intro" &&
  isFirstNameDetection &&
  !shouldWrapUp
) {

  // Ask about the next topic the student hasn't covered yet, instead
  // of always hardcoding "where are you from" — this also respects
  // information the student already gave in the same message (e.g.
  // "Hi, I'm Sammy, I'm from Malaysia" already covers hometown).
  const SELF_INTRO_TOPIC_ORDER = ["hometown", "university", "year", "major", "age", "hobby", "likes"];
  const nextTopic = SELF_INTRO_TOPIC_ORDER.find(t => !coveredTopics.has(t));

  const TOPIC_QUESTIONS: Record<string, { jp: string; ro: string; note: string }> = {
    hometown: {
      jp: `${studentName}さんはどこからきましたか。`,
      ro: `${studentName}-san wa doko kara kimashita ka.`,
      note: "Kenji greets you politely and asks where you are from.",
    },
    university: {
      jp: `${studentName}さんはどこのがくせいですか。`,
      ro: `${studentName}-san wa doko no gakusei desu ka.`,
      note: "Kenji greets you politely and asks which university you attend.",
    },
    year: {
      jp: `${studentName}さんはなんねんせいですか。`,
      ro: `${studentName}-san wa nan nensei desu ka.`,
      note: "Kenji greets you politely and asks what year of study you are in.",
    },
    major: {
      jp: `${studentName}さんのせんもんはなんですか。`,
      ro: `${studentName}-san no senmon wa nan desu ka.`,
      note: "Kenji greets you politely and asks about your major.",
    },
    age: {
      jp: `${studentName}さんはなんさいですか。`,
      ro: `${studentName}-san wa nan sai desu ka.`,
      note: "Kenji greets you politely and asks your age.",
    },
    hobby: {
      jp: `${studentName}さんのしゅみはなんですか。`,
      ro: `${studentName}-san no shumi wa nan desu ka.`,
      note: "Kenji greets you politely and asks about your hobby.",
    },
    likes: {
      jp: `${studentName}さんはなにがすきですか。`,
      ro: `${studentName}-san wa nani ga suki desu ka.`,
      note: "Kenji greets you politely and asks what you like.",
    },
  };

  // If every topic is already covered (unlikely this early, but
  // possible), skip the canned reply and let Groq handle it naturally
  // with the full conversation-state context instead of forcing a
  // question about a topic that's already been answered.
  if (nextTopic) {
    const question = TOPIC_QUESTIONS[nextTopic];

    const selfIntroReply =
`[JAPANESE]
こんにちは、${studentName}さん。よろしくおねがいします。${question.jp}
[/JAPANESE]

[ROMAJI]
Konnichiwa, ${studentName}-san. Yoroshiku onegaishimasu. ${question.ro}
[/ROMAJI]

[NOTE]
${question.note}
[/NOTE]`;

    const { error: selfIntroInsertError } = await adminClient.from("chat_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: selfIntroReply,
    });
    if (selfIntroInsertError) {
      throw new Error("Failed to save assistant message: " + selfIntroInsertError.message);
    }

    const { error: selfIntroTimestampError } = await adminClient
      .from("chat_sessions")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("student_id", user.id);
    if (selfIntroTimestampError) {
      console.error("Failed to update session timestamp:", selfIntroTimestampError.message);
    }

    return new Response(
      JSON.stringify({
        reply: selfIntroReply,
        session_id: sessionId,
        character: CHARACTER_META.self_intro,
        feedback: null,
        session_complete: false,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

    // ── Handle simple greeting deterministically ────────────────
// The opening greeting has already been sent, so do not ask
// the same question again or make the student repeat it.
if (lesson_mode === "greeting" && studentSaidSimpleGreeting && !shouldWrapUp) {
  const greetingReply =
`[JAPANESE]
こんにちは！よろしくおねがいします。
[/JAPANESE]

[ROMAJI]
Konnichiwa! Yoroshiku onegaishimasu.
[/ROMAJI]

[NOTE]
Yui responds warmly to your greeting.
[/NOTE]`;

  const { error: greetingInsertError } = await adminClient.from("chat_messages").insert({
    session_id: sessionId,
    role: "assistant",
    content: greetingReply,
  });
  if (greetingInsertError) {
    throw new Error("Failed to save assistant message: " + greetingInsertError.message);
  }

  const { error: greetingTimestampError } = await adminClient
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (greetingTimestampError) {
    console.error("Failed to update session timestamp:", greetingTimestampError.message);
  }

  return new Response(
    JSON.stringify({
      reply: greetingReply,
      session_id: sessionId,
      character: CHARACTER_META[lesson_mode] || CHARACTER_META.greeting,
      feedback: null,
      session_complete: false,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

    // ── Build system prompt ──────────────────────────────────
    const wrapUpInstruction = shouldWrapUp ? `
    === IMPORTANT: SESSION ENDING ===
    ${studentSaidGoodbye
      ? "The student has said goodbye. Respond warmly in character with an appropriate farewell from the syllabus. Keep it to one short line only."
      : "The student has completed the session. Naturally wrap up the conversation in character with an appropriate farewell from the syllabus vocabulary."
    }
    Keep it short. Do not continue the lesson after this.
    ` : "";

        const studentIdentityInstruction = studentName
      ? `
=== STUDENT IDENTITY — CRITICAL ===

The student's exact name is:

${studentName}

This is the student's personal name.

When addressing the student:
- Preserve the name EXACTLY as provided above.
- NEVER transliterate it.
- NEVER romanize it.
- NEVER convert it to another script.
- NEVER modify, abbreviate, or invent it.
- You may append さん directly to the exact name.

Example:
${studentName}さん

The student's name is NOT ordinary vocabulary.
Do not apply vocabulary conversion rules to it.

This rule has higher priority than any general vocabulary or katakana rule,
and also higher priority than the ROMAJI block's "no Japanese characters"
rule: if the name itself is written in Japanese script, keep it exactly as
given even inside [ROMAJI] rather than inventing a romanization for it.
`
      : "";

const conversationStateInstruction =
  lesson_mode === "self_intro"
    ? `
=== SELF-INTRODUCTION CONVERSATION STATE — CRITICAL ===

The student has already provided information about these topics:

${coveredTopics.size > 0
  ? [...coveredTopics].map(topic => `- ${topic}`).join("\n")
  : "- none yet"}

RULE 1 — NEVER REPEAT ANSWERED TOPICS

Do not ask the student for information about a topic listed above.

If the student has already answered a topic, treat that topic as completed.

Never ask the same question again simply because the answer was short.

RULE 2 — ACKNOWLEDGE THE CURRENT ANSWER

The student's latest message is the most important message.

${lastAskedTopic
  ? `Your previous message asked about: ${lastAskedTopic}. Treat the student's latest message as most likely answering that topic unless it clearly talks about something else.`
  : "There is no specific prior question on record — treat the student's latest message on its own terms."}

First acknowledge what the student just said.

Then ask ONE question about an unanswered topic.

Do not ignore the student's latest answer.

RULE 3 — UNIVERSITY → YEAR → MAJOR

When these topics are involved, follow this progression:

university → year → major

If university has been answered and year has NOT been answered:
→ ask about year.

If university and year have been answered and major has NOT been answered:
→ ask about major.

If university, year, and major have all been answered:
→ NEVER ask about them again.

RULE 4 — DO NOT MOVE BACKWARD

Once a topic has been answered, move forward.

Do not return to an earlier topic unless the student voluntarily gives new information about it.

RULE 5 — ONE QUESTION ONLY

Ask exactly ONE question per response.

Never combine two questions.

RULE 6 — AVAILABLE TOPICS

Possible unanswered topics are:

- hometown
- hobby
- university
- year
- major
- age
- likes

Choose a natural unanswered topic.

RULE 7 — NEVER INVENT STUDENT INFORMATION

Only treat information as answered when the student actually provided it.

Do not assume their university, year, major, hometown, hobby, age, or likes.

`
    : "";

const finalSystemPrompt =
  systemPrompt +
  studentIdentityInstruction +
  conversationStateInstruction +
  wrapUpInstruction;

        // ── Call Groq for conversational reply ─────────────────────
    // Keep the request compact because the lesson prompt is already large.
    // Retry (actually, not just in a comment) on HTTP errors, empty
    // content, or content that doesn't follow the required
    // [JAPANESE]/[ROMAJI]/[NOTE] format.

    const MAX_CONVERSATION_MESSAGES = 6;

    // Keep only the most recent conversation messages.
    // The system prompt already contains the lesson rules and scenario context.
    const recentMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

    const groqRequestBody = {
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: finalSystemPrompt },
        ...recentMessages,
      ],
      max_completion_tokens: 800,
      reasoning_effort: "low",
      temperature: 0.6,
    };

    const MAX_GROQ_ATTEMPTS = 2;
    let reply: string | null = null;
    let lastGroqFailure: string | null = null;

    for (let attempt = 1; attempt <= MAX_GROQ_ATTEMPTS; attempt++) {
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(groqRequestBody),
        }
      );

      if (!groqRes.ok) {
        const errText = await groqRes.text();

        console.error("[GROQ API ERROR]", {
          attempt,
          status: groqRes.status,
          body: errText,
        });

        lastGroqFailure = `Groq API error (${groqRes.status}): ${errText}`;
        continue;
      }

      const groqData = await groqRes.json();
      const candidate = groqData?.choices?.[0]?.message?.content;

      if (typeof candidate !== "string" || candidate.trim().length === 0) {
        console.error(
          "[GROQ EMPTY RESPONSE]",
          { attempt },
          JSON.stringify(groqData, null, 2)
        );

        lastGroqFailure = "Groq returned an empty response.";
        continue;
      }

      if (!isValidReplyFormat(candidate)) {
        console.error("[GROQ MALFORMED RESPONSE]", { attempt, candidate });

        lastGroqFailure = "Groq returned a response that did not follow the required format.";
        continue;
      }

      reply = candidate;
      break;
    }

    if (!reply) {
      throw new Error(lastGroqFailure || "Groq failed to return a usable response.");
    }

    console.log("[GROQ] Response received successfully.");

    // Save assistant message
    const { error: assistantError } = await adminClient
      .from("chat_messages")
      .insert({ session_id: sessionId, role: "assistant", content: reply });
    if (assistantError) throw new Error("Failed to save assistant message: " + assistantError.message);

    // Update session timestamp
    const { error: timestampError } = await adminClient
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (timestampError) {
      console.error("Failed to update session timestamp:", timestampError.message);
    }

    // ── Generate feedback if session is ending ───────────────
    let feedback = null;

    if (shouldWrapUp) {
      try {
        const transcript = messages
          .filter((m: any) => m.role === "user")
          .map((m: any, i: number) => `${i + 1}. ${m.content}`)
          .join("\n");

        const feedbackPrompt = `You are a Japanese language teacher evaluating a beginner student (JFS A0 level) after a conversation practice session.

The student practiced the "${lesson_mode}" scenario. Here are all the student's messages from the session:

${transcript}

IMPORTANT EVALUATION RULES:

1. This is a very early beginner (JFS A0).
2. Focus primarily on:
   - correct particle usage (は、の、も、と、で、を、から)
   - spelling accuracy in hiragana
   - sentence pattern correctness
   - correct use of vocabulary from the syllabus
   - missing or incorrect particles
   - incorrect word order
   - incorrect verb forms
3. Do NOT spend much space praising vocabulary variety or grammar complexity.
4. Only suggest corrections that are genuinely important for this level.
5. Ignore advanced Japanese issues that have not been taught in the syllabus.
6. If the student communicates successfully but makes small mistakes, prioritize the most important mistakes first.

KATAKANA POLICY:

1. The student has not learned katakana yet.
2. DO NOT evaluate katakana usage in any way, except when noting that a loanword should be written in romaji.
3. DO NOT:
    - suggest katakana spellings
    - compare hiragana and katakana spellings
    - include katakana-related feedback beyond vocabulary mistakes
    - mention that a word is "normally written in katakana"
4. Show all katakana vocabularies in romaji. Example: サッカー → Sakkaa
5. If a sentence contains a katakana-related spelling issue, ignore that issue completely and evaluate only:
    - particles
    - sentence structure
    - grammar patterns
    - vocabulary spelling (accept katakana vocabularies in correct romaji spelling)
6. Katakana vocabularies can be typed in katakana or romaji, but treat katakana vocabularies typed in hiragana as a vocabulary mistake.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):

{
  "vocabulary_notes": "1-2 sentences focused on whether vocabulary was used correctly and appropriately. Do not praise vocabulary variety. When pointing out mistakes, show examples.",
  "grammar_notes": "2-4 sentences focused mainly on particles, spelling, sentence patterns, and correctness. When pointing out mistakes, show examples.",
  "effort_notes": "1 short sentence about participation and effort.",
  "corrections": [
    {
      "original": "what student wrote",
      "corrected": "correct form only, no explanation here",
      "explanation": "brief explanation focused on particles, spelling, or pattern usage"
    }
  ],
  "encouragement": "1 short sentence encouraging further practice"
}

CORRECTIONS RULES:
1. Only create corrections for:
    - particle mistakes
    - sentence pattern mistakes
    - incorrect verb forms
    - significant hiragana spelling mistakes
    - incorrect vocabulary usage
    - katakana loanwords written in hiragana (flag as vocabulary mistake, show romaji form)
2. If fewer than 2 meaningful corrections exist, return fewer corrections.
3. The "corrected" field must contain only the corrected Japanese/romaji form — no English, no explanation.

The tone should be supportive but instructional. If the student wrote mostly in English, note that and encourage them to try more Japanese next time. Focus on correctness, not praise.`;

        const feedbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: feedbackPrompt }],
            max_tokens: 800,
            temperature: 0.4,
          }),
        });

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          const feedbackRaw = feedbackData?.choices?.[0]?.message?.content || "";

          const cleaned = feedbackRaw.replace(/```json|```/g, "").trim();
          feedback = JSON.parse(cleaned);

          const { error: feedbackInsertError } = await adminClient.from("session_feedback").insert({
            session_id: sessionId,
            student_id: user.id,
            lesson_mode,
            vocabulary_notes: feedback.vocabulary_notes,
            grammar_notes: feedback.grammar_notes,
            effort_notes: feedback.effort_notes,
            corrections: feedback.corrections,
            encouragement: feedback.encouragement,
          });
          if (feedbackInsertError) {
            console.error("Failed to save session feedback:", feedbackInsertError.message);
          }
        }
      } catch (feedbackErr) {
        console.error("FEEDBACK ERROR:", feedbackErr);
      }
    }

    return new Response(
      JSON.stringify({
        reply,
        session_id: sessionId,
        character: CHARACTER_META[lesson_mode] || CHARACTER_META.greeting,
        feedback,
        session_complete: shouldWrapUp,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

});