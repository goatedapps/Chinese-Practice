/* =========================================================
   QUESTION DATABASE for the Chinese Practice app.
   This file is the "database" -- components only read from the
   exports defined here (CATEGORIES, LESSON_COUNT, QUESTION_GROUPS).
   Edit this file to add more papers/questions; no other file
   needs to change for new data of the same shape.

   A "group" is either:
     - a standalone single question (passage: null), or
     - a passage plus every question that shares it -- these are
       always presented together, never split apart.
   ========================================================= */
import type { Category, MCQOption, QuestionGroup } from "./types";

export const LESSON_COUNT: number = 7;

// Coarse categories used for the "practice by type" picker.
// lessonMode:true  -> single-sentence items, eligible for "practice by lesson"
// lessonMode:false -> passage-based items, only offered under "practice by type"
export const CATEGORIES: Record<string, Category> = {
  pinyin:        { label: "汉语拼音 Hanyu Pinyin",              lessonMode: true  },
  vocab:         { label: "词语运用 Vocabulary",                 lessonMode: true  },
  phrase:        { label: "词语释义 Phrase Meaning",             lessonMode: true  },
  conjunction:   { label: "关联词 Conjunctions",                 lessonMode: true  },
  sentence:      { label: "句子填空 Sentence Completion",        lessonMode: true  },
  usage:         { label: "正确运用选择 Correct Usage",          lessonMode: true  },
  cloze:         { label: "完形填空 Cloze Passage",              lessonMode: false },
  errorcorrect:  { label: "改错 Error Correction",               lessonMode: false },
  comprehension: { label: "阅读理解 Reading Comprehension",      lessonMode: false },
  dialogue:      { label: "完成对话 Dialogue Completion",        lessonMode: false },
  practical:     { label: "应用文阅读 Practical Text / Notice",  lessonMode: false }
};

export const SUBJECTS: string[] = ["Chinese", "Higher Chinese"];

/* ---------------------------------------------------------
   Shared word bank for the Chinese-paper dialogue-completion
   group (Q26-Q29) -- all four questions choose from this same
   8-item bank.
   --------------------------------------------------------- */
const DIALOGUE_BANK: MCQOption[] = [
  { key: "1", text: "只要赢了这场游戏" },
  { key: "2", text: "应该让眼睛好好休息" },
  { key: "3", text: "黑眼圈就很快会来找你" },
  { key: "4", text: "这场游戏很快就结束了" },
  { key: "5", text: "我可以再玩半个小时吗" },
  { key: "6", text: "我是不是已经得了近视" },
  { key: "7", text: "我只玩了半个小时的时间" },
  { key: "8", text: "你不让眼睛得到足够的休息" }
];

export const QUESTION_GROUPS: QuestionGroup[] = [

/* =========================================================
   HIGHER CHINESE (高级华文) -- Paper 2
   ========================================================= */

  {
    groupId: "HC-G1", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 A组",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "科学馆参观", source: "老师自编",
      text: "上个星期，学校带我们到科学馆参观。那里有许多有趣的展览。我最喜欢的是“未来城市”展区。\n\n"
        + "在展区中摆放着一座大型城市模型。那是由一群学生花了好几个月的时间才 [Q1]___ 出来的。模型由木片、塑料和"
        + "回收材料组合在一起，做工十分精细。小房子整齐地排列在街道两旁，道路宽阔，四周还有花草树木，环境看起来"
        + "十分 [Q2]___ 。\n\n"
        + "导览员阿姨告诉我们，这座模型的主题是“绿色家园”。他们希望未来的城市 [Q3]___ 美丽的公园和清新的空气。"
        + "她一边介绍，一边打开开关，整个模型亮了起来。当灯光从一座座小屋透出时，[Q4]___ 真的有人在里面生活。我"
        + "忍不住靠近看，又怕碰坏模型，只好 [Q5]___ 地弯下身子仔细欣赏。\n\n"
        + "我希望有一天，也能和伙伴们一起动手，做出自己的作品。\n\n"
        + "词语库：1拥有 2似乎 3建造 4井井有条 5可贵 6优美 7产生 8小心翼翼"
    },
    questions: [
      { qNo: "Q1", marks: 2, format: "Fill-in", text: "那是由一群学生花了好几个月的时间才 ___ 出来的。",
        accepted: ["3", "建造", "3建造", "3 建造"], displayAnswer: "3 建造", answerSource: "official" },
      { qNo: "Q2", marks: 2, format: "Fill-in", text: "环境看起来十分 ___ 。",
        accepted: ["6", "优美", "6优美", "6 优美"], displayAnswer: "6 优美", answerSource: "official" },
      { qNo: "Q3", marks: 2, format: "Fill-in", text: "他们希望未来的城市 ___ 美丽的公园和清新的空气。",
        accepted: ["1", "拥有", "1拥有", "1 拥有"], displayAnswer: "1 拥有", answerSource: "official" },
      { qNo: "Q4", marks: 2, format: "Fill-in", text: "当灯光从一座座小屋透出时，___ 真的有人在里面生活。",
        accepted: ["2", "似乎", "2似乎", "2 似乎"], displayAnswer: "2 似乎", answerSource: "official" },
      { qNo: "Q5", marks: 2, format: "Fill-in", text: "只好 ___ 地弯下身子仔细欣赏。",
        accepted: ["8", "小心翼翼", "8小心翼翼", "8 小心翼翼"], displayAnswer: "8 小心翼翼", answerSource: "official" }
    ]
  },

  {
    groupId: "HC-G2", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 B组",
    category: "errorcorrect", lessonEligible: false, lessonIds: [],
    passage: {
      title: "无声的爱", source: "改编自《无声的爱》",
      text: "“你还是带雨衣吧！今天可能会下雨！”我刚准备出门，爸爸 [Q6](兰) 住了我。我转身看了看天空，天气那么好，"
        + "应该不会下雨，就对爸爸说：“不会下雨啦！”然后我就出门了。\n\n"
        + "放学时，天色突然暗了下来。我望着阴沉沉的天空，心里 [Q7]不时担心 起来：早知道就听爸爸的话，带上雨衣就"
        + "不会被雨淋湿了！\n\n"
        + "下课铃声刚响，大雨就倾盆而下。就在我 [Q8](扮) 望有人来接我时，我从远处看到了爸爸的身影！他一看到我，"
        + "就说：“还好赶上了。”说完，爸爸把雨衣 [Q9](第) 给我。\n\n"
        + "我把雨衣披在身上，感受到了爸爸的温暖。我是多么幸运有一位一直保护着我的爸爸，我一定要 [Q10]珍贵 爸爸对"
        + "我的爱，长大后用行动来感谢他。"
    },
    questions: [
      { qNo: "Q6", marks: 2, format: "Fill-in", text: "爸爸 (兰) 住了我。 —— 括号里的字是写错的字，请写出正确的字。",
        accepted: ["拦"], displayAnswer: "拦 (拦住)", answerSource: "official" },
      { qNo: "Q7", marks: 2, format: "Fill-in", text: "心里__不时担心__起来 —— 画线词语中有一个字用得不恰当，请写出正确的词语。",
        accepted: ["不禁", "不禁担心"], displayAnswer: "不禁 (即“不禁担心”)", answerSource: "official",
        notes: "答案卷影像中另出现“一时”字样，含义不明确，本词暂以“不禁”为准，建议对照原始试卷确认。" },
      { qNo: "Q8", marks: 2, format: "Fill-in", text: "就在我 (扮) 望有人来接我时 —— 括号里的字是写错的字，请写出正确的字。",
        accepted: ["盼"], displayAnswer: "盼 (盼望)", answerSource: "official" },
      { qNo: "Q9", marks: 2, format: "Fill-in", text: "爸爸把雨衣 (第) 给我。 —— 括号里的字是写错的字，请写出正确的字。",
        accepted: ["递"], displayAnswer: "递 (递给)", answerSource: "official" },
      { qNo: "Q10", marks: 2, format: "Fill-in", text: "我一定要__珍贵__爸爸对我的爱 —— 画线词语中有一个字用得不恰当，请写出正确的词语。",
        accepted: ["珍惜"], displayAnswer: "珍惜", answerSource: "official" }
    ]
  },

  {
    groupId: "HC-G3", subject: "Higher Chinese", paper: "Paper 2", section: "二 阅读理解(一)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "大卫的成长", source: "改编自《新列车》",
      text: "大卫家里十分有钱，从小要什么有什么，但这让他觉得生活有些无聊，于是开始喜欢捉弄别人。村民们都讨厌他，"
        + "不愿意和他做朋友。\n\n"
        + "有一次，大卫逛街时，听到一位艺术家拉小提琴。那动听的琴声深深吸引了他，他第一次发现，原来音乐能带来这"
        + "么多美好和感动。从那以后，他对小提琴产生了浓厚的兴趣。他跟随一名老师认真学习，并花了很多时间和精力练"
        + "习。\n\n"
        + "一年后，大卫感觉自己有了很大进步，很想找人分享。他怀着兴奋的心情，邀请村民们到广场上观看他的演出。可"
        + "是，他在广场上等了很久都没有人来。原来，村民们都以为大卫又要恶作剧，不想再被骗。大卫坐在空无一人的广"
        + "场上，望着心爱的小提琴，难过极了。他默默地收起琴盒，准备回家。\n\n"
        + "“请你拉一曲好吗？”匆匆赶来的马丁喊道，“我非常想看你的表演，只是临时有事来晚了。”大卫连忙回答：“当然可"
        + "以！”他深吸了一口气，便开始拉小提琴。大卫表演得特别用心，沉浸在音乐之中，脸上露出愉快的神情。\n\n"
        + "表演结束后，马丁热烈地鼓掌，并说：“太好听了！”大卫激动地说：“非常感谢您愿意做我的听众，还肯定我的表现"
        + "！我以前总是捉弄别人，所以村民们都不愿意来听我拉小提琴。我知道自己错了。”\n\n"
        + "马丁笑着说：“人是会成长的，你也一样。”\n\n"
        + "从那以后，大卫学会了尊重别人，渐渐赢回了村民们的信任和友谊。"
    },
    questions: [
      { qNo: "Q11", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：这个活动十分__没趣__，大家都不想参加。",
        accepted: ["无聊"], displayAnswer: "无聊", answerSource: "official" },
      { qNo: "Q12", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：天气__一点一点__变冷了，我们都开始穿上厚衣服。",
        accepted: ["渐渐"], displayAnswer: "渐渐", answerSource: "official" },
      { qNo: "Q13", marks: 2, format: "Long-Answer",
        text: "在拉小提琴给马丁听之前，大卫的心情是怎样的？原因是什么？",
        displayAnswer: "心情：难过\n原因：大卫邀请村民们听他拉小提琴，但没人来。", answerSource: "official" },
      { qNo: "Q14", marks: 2, format: "Long-Answer",
        text: "在拉小提琴给马丁听之后，大卫的心情是怎样的？原因是什么？",
        displayAnswer: "心情：激动\n原因：马丁愿意做他的听众，肯定了他的表现。", answerSource: "official" },
      { qNo: "Q15", marks: 4, format: "Long-Answer", text: "为什么大卫想要学小提琴？",
        displayAnswer: "因为大卫逛街时（0.5分），听到一位艺术家拉小提琴（0.5分）。那动听的琴声（0.5分）深深吸引了"
          + "他（0.5分），他第一次发现，原来音乐能带来这么多美好（0.5分）和感动（0.5分）。从那以后，他对小提琴产"
          + "生了浓厚的兴趣（1分）。",
        answerSource: "official" },
      { qNo: "Q16", marks: 4, format: "Long-Answer",
        text: "试从以下两个选项中，选一个最适合的作为这篇短文的题目，并举例说明理由：(1) 大卫的成长 (2) 大卫学小提琴",
        displayAnswer: "选 (1) 大卫的成长。理由——起因：大卫以前爱捉弄别人，大家都讨厌他（0.5分）；经过：后来只有马丁"
          + "一个人来看他的演出（0.5分）；结果：大卫知道自己以前做错了（0.5分）；点题：他成长了，学会了尊重别人，"
          + "渐渐赢回了村民们的信任和友谊（0.5分）。",
        answerSource: "official" }
    ]
  },

  {
    groupId: "HC-G4", subject: "Higher Chinese", paper: "Paper 2", section: "三 阅读理解(二)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "散步", source: "改编自《散步》",
      text: "明文的父亲去世了，年老的母亲一个人住。一天，明文对母亲说：“妈，您年纪越来越大了，身体也不太好，我担"
        + "心您要是发生什么意外，没有人知道怎么办？我想让您和我们一起住。”母亲想了想，就同意了，很快便搬来跟明文"
        + "住。\n\n"
        + "一天傍晚，明文提议一家人到河边散步。母亲觉得自己行动不方便，走远一点就会觉得累，需要坐下来休息，所以"
        + "拒绝了他。明文却认为母亲应该多走走，身体才会更健康。在他的再三劝说下，母亲点头答应了。\n\n"
        + "河边有两条小路，左边是宽阔的木板步道，右边是窄小的石路。母亲想走木板步道，她说：“木板步道比较宽，我"
        + "走起来会轻松些。”但明文的女儿丽丽想走石路，她说：“石路的风景更漂亮，我想去那里欣赏刚盛开的花朵。”\n\n"
        + "明文听了，心里有些矛盾，但他又想到平时常常带丽丽到公园赏花，而母亲年纪大了，走石路会太累，所以他对丽"
        + "丽说：“[Q17]你就让一下吧。”\n\n"
        + "明文以为丽丽会失望，没想到丽丽听了爸爸的话，却说：“没问题，我们就一起走木板步道吧！”说完，丽丽就牵起"
        + "奶奶的手，一同前行。走了不久，丽丽看到奶奶满头大汗的，便建议她坐下来休息一会儿。妻子也拿出毛巾，帮母"
        + "亲擦汗。明文看到眼前这一幕，[Q18]心中涌起一种说不出的温暖。\n\n"
        + "坐在长椅上，一家人说说笑笑，风轻轻地吹着，阳光洒在他们身上，特别舒服。这一刻，明文明白了一个道理：原"
        + "来走哪一条路都不重要，因为只要有家人的陪伴，就是最幸福的事了！"
    },
    questions: [
      { qNo: "Q17", marks: 2, format: "Long-Answer", text: "试解释下面短语在文中的意思（第四段）：“你就让一下吧”",
        displayAnswer: "丽丽想走石路（0.5分），明文（0.5分）要她让奶奶（0.5分）走木板步道（0.5分）。",
        answerSource: "official" },
      { qNo: "Q18", marks: 2, format: "Long-Answer",
        text: "试解释下面短语在文中的意思（第五段）：“心中涌起一种说不出的温暖”",
        displayAnswer: "明文很感动（1分），因为他看到了丽丽看到奶奶满头大汗的，便建议她坐下来休息一会儿（0.5分），"
          + "妻子也拿出毛巾，帮母亲擦汗（0.5分）。",
        answerSource: "official" },
      { qNo: "Q19", marks: 4, format: "Long-Answer", text: "为什么明文希望母亲和他们一起住？",
        displayAnswer: "因为明文的父亲去世了（0.5分），年老的母亲一个人住（0.5分），明文认为母亲的年纪越来越大了"
          + "（0.5分），身体也不太好（0.5分），担心（1分）她要是发生什么意外（0.5分），没有人知道（0.5分）。",
        answerSource: "official" },
      { qNo: "Q20", marks: 4, format: "Long-Answer",
        text: "来到河边，明文的母亲和女儿分别想走哪条路？为什么她们的想法不同？",
        displayAnswer: "【参考答案，非官方】母亲想走木板步道，因为木板步道比较宽，走起来会轻松些；丽丽想走石路，"
          + "因为石路的风景更漂亮，她想去欣赏刚盛开的花朵。两人的想法不同，是因为母亲考虑体力和舒适，丽丽则看重"
          + "沿途的风景。",
        answerSource: "inferred",
        notes: "答案卷（改正）文件只列到 Q19，本题及以下没有官方答案，仅供参考。" },
      { qNo: "Q21", marks: 4, format: "Long-Answer", text: "请用不超过15个字，写出短文中第二段的段落大意。",
        context: "字数限制：≤15字",
        displayAnswer: "【参考答案，非官方】明文劝母亲一起到河边散步。（约13字）", answerSource: "inferred" },
      { qNo: "Q22", marks: 4, format: "Long-Answer", text: "你认为丽丽是一个怎样的孩子？从哪两件事情可以看出来？",
        displayAnswer: "【参考答案，非官方】丽丽是一个懂事、孝顺、体贴长辈的孩子。可以从两件事看出来：（一）她原本"
          + "想走石路看花，但为了让奶奶轻松一些，答应改走木板步道；（二）她看到奶奶满头大汗，主动建议奶奶坐下来"
          + "休息。",
        answerSource: "inferred" },
      { qNo: "Q23", marks: 4, format: "Long-Answer",
        text: "明文认为最幸福的事是什么？你同意明文的看法吗？试举生活中的例子加以说明。",
        displayAnswer: "明文认为，只要有家人的陪伴，就是最幸福的事（官方）。第二部分为开放式问题：需结合自己的生"
          + "活例子说明是否同意，没有固定答案（非官方，仅供参考）。",
        answerSource: "mixed",
        notes: "题目册显示 (2分)+(2分)=4分，答案册显示 (2分)+(3分)=5分，两份文件不一致，未擅自判断以哪个为准。" }
    ]
  },

/* =========================================================
   CHINESE (华文) -- Paper 2, Section 一 语文应用 (standalone items)
   ========================================================= */

  { groupId: "CH-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
      text: "汉字是由笔画__构成__的方块字。（选出画线词语的汉语拼音）",
      options: [{key:"1",text:"gòu céng"},{key:"2",text:"guò céng"},{key:"3",text:"gòu chéng"},{key:"4",text:"guò chéng"}],
      correctKey: "3", answerSource: "official" }] },

  { groupId: "CH-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
      text: "弟弟__盼望__生日那天收到一个玩具汽车。（选出画线词语的汉语拼音）",
      options: [{key:"1",text:"pán wán"},{key:"2",text:"pàn wàng"},{key:"3",text:"pàng wǎn"},{key:"4",text:"páng wāng"}],
      correctKey: "2", answerSource: "official" }] },

  { groupId: "CH-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ", text: "大家非常痛 ___ 明华伤害小动物的行为。",
      options: [{key:"1",text:"很"},{key:"2",text:"恨"},{key:"3",text:"狠"},{key:"4",text:"银"}],
      correctKey: "2", answerSource: "official" }] },

  { groupId: "CH-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ", text: "妹妹喜欢把洋娃娃装 ___ 成公主的样子。",
      options: [{key:"1",text:"办"},{key:"2",text:"般"},{key:"3",text:"扮"},{key:"4",text:"板"}],
      correctKey: "3", answerSource: "official" }] },

  { groupId: "CH-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ", text: "小明玩手机游戏 ___ 了，一直玩到三更半夜也不想睡。",
      options: [{key:"1",text:"上瘾"},{key:"2",text:"控制"},{key:"3",text:"习惯"},{key:"4",text:"湿透"}],
      correctKey: "1", answerSource: "official" }] },

  { groupId: "CH-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ", text: "火药是中国古代的四大 ___ 之一。",
      options: [{key:"1",text:"发明"},{key:"2",text:"发表"},{key:"3",text:"发现"},{key:"4",text:"发展"}],
      correctKey: "1", answerSource: "official" }] },

  { groupId: "CH-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
      text: "夜空里的星星一闪一闪的，多得__数不清__。（选出与画线词语意思最接近的选项）",
      options: [{key:"1",text:"大小不一"},{key:"2",text:"变化很大"},{key:"3",text:"越来越多"},{key:"4",text:"难以计算"}],
      correctKey: "4", answerSource: "official" }] },

  { groupId: "CH-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
      text: "爸爸看见弟弟想从玩具车上跳下来，连忙上前__阻拦__。（选出与画线词语意思最接近的选项）",
      options: [{key:"1",text:"一起做"},{key:"2",text:"不让做"},{key:"3",text:"帮忙做"},{key:"4",text:"以后做"}],
      correctKey: "2", answerSource: "official" }] },

  { groupId: "CH-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ", text: "___ 你不要穿这些旧衣服，___ 把它们捐给老人院吧。",
      options: [{key:"1",text:"要是……就"},{key:"2",text:"不管……都"},{key:"3",text:"虽然……但"},{key:"4",text:"不仅……也"}],
      correctKey: "1", answerSource: "official" }] },

  { groupId: "CH-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ", text: "这家餐馆卖的螃蟹 ___ 好吃，___ 一点也不贵。",
      options: [{key:"1",text:"不是……而是"},{key:"2",text:"因为……所以"},{key:"3",text:"不但……而且"},{key:"4",text:"反正……不如"}],
      correctKey: "3", answerSource: "official" }] },

  { groupId: "CH-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ", text: "表哥因为挑食而营养不良，___________ 。",
      options: [{key:"1",text:"因此天天做运动"},{key:"2",text:"所以经常会生病"},{key:"3",text:"不然上学会迟到"},{key:"4",text:"结果把钱都花完"}],
      correctKey: "2", answerSource: "official" }] },

  { groupId: "CH-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ", text: "___________ ，终于完成了小组任务。",
      options: [{key:"1",text:"同学们齐心协力"},{key:"2",text:"家长们不约而同"},{key:"3",text:"老师们胸有成竹"},{key:"4",text:"朋友们狼吞虎咽"}],
      correctKey: "1", answerSource: "official" }] },

  { groupId: "CH-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ", text: "以下哪一个句子是正确的？（词语：有限）",
      options: [
        {key:"1",text:"每天安排时间做运动，这样对身体非常有限。"},
        {key:"2",text:"歌唱比赛参加人数有限，大家要赶快去报名。"},
        {key:"3",text:"这次的口试和环保主题有限，所以非常容易。"},
        {key:"4",text:"这部连续剧吸引许多人追看，真是有限极了。"}],
      correctKey: "2", answerSource: "official" }] },

  { groupId: "CH-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ", text: "以下哪一个句子是正确的？（词语：整齐）",
      options: [
        {key:"1",text:"吃饭前要记得洗手，注意个人的卫生整齐。"},
        {key:"2",text:"你不要整齐呆在家里，应该多出门去走走。"},
        {key:"3",text:"丽丽最喜欢在九月假期时整齐自己的书包。"},
        {key:"4",text:"图书管理员把故事书整齐地排列在书架上。"}],
      correctKey: "4", answerSource: "official" }] },

  { groupId: "CH-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [1], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ", text: "以下哪一个句子是正确的？（词语：恍然大悟）",
      options: [
        {key:"1",text:"听了我的建议后，大家都恍然大悟表示同意。"},
        {key:"2",text:"同学们都恍然大悟，认真地把课室打扫干净。"},
        {key:"3",text:"知道妈妈出国公干，我们恍然大悟跟她道别。"},
        {key:"4",text:"爸爸解释数学题的做法后，弟弟才恍然大悟。"}],
      correctKey: "4", answerSource: "official" }] },

/* =========================================================
   CHINESE (华文) -- Paper 2, passage-grouped sections
   ========================================================= */

  {
    groupId: "CH-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "行善日", source: "改编自《早报校园》新闻",
      text: "如果你的同学在踢球时不小心摔伤了腿，需要坐轮椅，你会怎么做呢？有所学校的一个学生受伤后，他的同学有"
        + "的主动帮他推轮椅，有的同学提早到学校等他，个个都 [Q16]___ 地想帮忙，让他非常感动。\n\n"
        + "为了 [Q17]___ 更多同学做善事，这所学校表扬了这位同学，并举办了“行善日”活动。学校通过歌曲、游戏和有趣"
        + "的活动，让同学们一起学习如何做善事。\n\n"
        + "问到对“行善日”的感受时，小乐兴奋地说：“我觉得‘行善日’让我们更 [Q18]___ 朋友的需要，也学会如何帮助别"
        + "人！”他的同学小同点点头，说：“我同意，如果大家懂得互相尊重和照顾，也就不会发生 [Q19]___ 同学的事情。"
        + "这样，学习环境会变得更美好。”\n\n"
        + "他们的老师听了，微笑着说道：“其实，行善不需要做非常伟大的事情，可以从小事开始。同学们 [Q20]___ 行善的"
        + "同时，也能慢慢培养善良的品德。”"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ", text: "个个都 ___ 地想帮忙，让他非常感动。",
        options: [{key:"1",text:"异口同声"},{key:"2",text:"七嘴八舌"},{key:"3",text:"争先恐后"},{key:"4",text:"喜出望外"}],
        correctKey: "3", answerSource: "official" },
      { qNo: "Q17", marks: 2, format: "MCQ", text: "为了 ___ 更多同学做善事，这所学校表扬了这位同学。",
        options: [{key:"1",text:"鼓励"},{key:"2",text:"配合"},{key:"3",text:"谈论"},{key:"4",text:"联系"}],
        correctKey: "1", answerSource: "official" },
      { qNo: "Q18", marks: 2, format: "MCQ", text: "“行善日”让我们更 ___ 朋友的需要。",
        options: [{key:"1",text:"丰富"},{key:"2",text:"了解"},{key:"3",text:"拥有"},{key:"4",text:"探索"}],
        correctKey: "2", answerSource: "official" },
      { qNo: "Q19", marks: 2, format: "MCQ", text: "如果大家懂得互相尊重和照顾，也就不会发生 ___ 同学的事情。",
        options: [{key:"1",text:"打败"},{key:"2",text:"灭绝"},{key:"3",text:"怀疑"},{key:"4",text:"欺负"}],
        correctKey: "4", answerSource: "official" },
      { qNo: "Q20", marks: 2, format: "MCQ", text: "同学们 ___ 行善的同时，也能慢慢培养善良的品德。",
        options: [{key:"1",text:"积极"},{key:"2",text:"感恩"},{key:"3",text:"珍惜"},{key:"4",text:"制造"}],
        correctKey: "1", answerSource: "official" }
    ]
  },

  {
    groupId: "CH-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "西瓜和苹果", source: "改编自网络故事",
      text: "我的弟弟今年五岁。他爱听故事，也爱问问题，而且每次都一定要问出答案不可。\n\n"
        + "一天晚上，我做完了功课，正想上床睡觉，他拉着我，一直吵着让我给他讲一个故事。我想快点打发他，随口给他"
        + "讲了一个简单的故事。弟弟认真地听完故事，就问：“故事里的妹妹把大的苹果让给哥哥，那哥哥为什么不把苹果让"
        + "给妹妹呢？”\n\n"
        + "这看似简单的问题，我想都没想过，这可真把我给问倒了。这时妈妈走进房间，了解发生了什么事情后，对弟弟说"
        + "：“所以说故事里的妹妹比哥哥还懂事啊！”弟弟听了，似懂非懂地点了点头。\n\n"
        + "第二天，爸爸下班回来，手里抱着一个西瓜。吃过晚饭，弟弟一直喊着：“我要吃最大块的西瓜。”爸爸切好西瓜，"
        + "摆在盘子里。不等爸爸分西瓜，弟弟立刻拿走了一块最大的西瓜。我心想：真是贪吃！昨天才给他讲了让苹果的故"
        + "事，今天就忘得一干二净！\n\n"
        + "我刚想开口，就看到拿着西瓜的弟弟，走到奶奶面前说：“奶奶，这块西瓜给您吃。”奶奶先是惊讶，然后开心地接"
        + "过西瓜。弟弟平时有好吃的东西就会紧紧地抓在手里，谁都抢不走；今天却主动把最大的西瓜让给了奶奶，自己还"
        + "挑了一块最小的西瓜，坐在一旁津津有味地吃起来。弟弟的这一个举动，让大家都大跌眼镜。\n\n"
        + "妈妈走到弟弟身边问：“怎么啦，西瓜不好吃吗？”弟弟调皮地回答：“别人会让苹果，我会让西瓜。”"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ", text: "“我”为什么给弟弟讲故事？",
        options: [
          {key:"1",text:"因为“我”想给弟弟随便讲个故事。"},
          {key:"2",text:"因为“我”不想让弟弟一直问问题。"},
          {key:"3",text:"因为弟弟知道“我”很喜欢讲故事。"},
          {key:"4",text:"因为弟弟一定要“我”讲一个故事。"}],
        correctKey: "4", answerSource: "official" },
      { qNo: "Q22", marks: 2, format: "MCQ", text: "文中“这可真把我给问倒了”指的是什么？",
        options: [
          {key:"1",text:"“我”不必回答弟弟的问题。"},
          {key:"2",text:"“我”不想回答弟弟的问题。"},
          {key:"3",text:"“我”不敢回答弟弟的问题。"},
          {key:"4",text:"“我”不会回答弟弟的问题。"}],
        correctKey: "4", answerSource: "official" },
      { qNo: "Q23", marks: 2, format: "MCQ", text: "什么事让“我”认为弟弟忘了“我”给他讲的故事？",
        options: [
          {key:"1",text:"弟弟把西瓜紧紧地抓住。"},
          {key:"2",text:"弟弟一直吵着要吃西瓜。"},
          {key:"3",text:"弟弟拿走最大块的西瓜。"},
          {key:"4",text:"弟弟没有帮爸爸摆西瓜。"}],
        correctKey: "3", answerSource: "official" },
      { qNo: "Q24", marks: 2, format: "MCQ", text: "大家为什么都“大跌眼镜”？",
        options: [
          {key:"1",text:"因为弟弟还是把最大块的西瓜给自己。"},
          {key:"2",text:"因为弟弟这次没等爸爸给每人分西瓜。"},
          {key:"3",text:"因为弟弟今天要吃苹果，不要吃西瓜。"},
          {key:"4",text:"因为弟弟会主动把大块西瓜分给家人。"}],
        correctKey: "4", answerSource: "official" },
      { qNo: "Q25", marks: 2, format: "MCQ", text: "从弟弟吃西瓜这件事可以看出他是个怎样的人？",
        options: [
          {key:"1",text:"爱听故事。"},{key:"2",text:"贪吃自私。"},{key:"3",text:"孝顺懂事。"},{key:"4",text:"没有耐心。"}],
        correctKey: "3", answerSource: "official" }
    ]
  },

  {
    groupId: "CH-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    // All 4 questions below choose from this same word bank -- shown once at
    // the top of the group instead of being repeated under every question.
    optionBank: DIALOGUE_BANK,
    passage: {
      title: "电脑游戏", source: "老师自编",
      text: "妈妈：快要晚上十点了，你怎么还在玩电脑游戏？\n"
        + "小强：[Q26]___？\n"
        + "妈妈：不行，你明天还要上课，应该早点儿休息。\n"
        + "小强：请你让我再玩一会儿嘛。[Q27]___，我就关电脑休息。\n"
        + "妈妈：你已经玩了两个多小时了，[Q28]___。\n"
        + "小强：对不起，妈妈，我不知道已经玩了那么长时间了。\n"
        + "妈妈：[Q29]___，很容易得近视，到时候就需要戴眼镜了。\n"
        + "小强：我不要戴眼镜。好，我这就把电脑关上。"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ", text: "小强：___？（回应妈妈问他为什么还在玩电脑游戏）",
        correctKey: "5", answerSource: "official" },
      { qNo: "Q27", marks: 2, format: "MCQ", text: "小强：请你让我再玩一会儿嘛。___，我就关电脑休息。",
        correctKey: "1", answerSource: "official" },
      { qNo: "Q28", marks: 2, format: "MCQ", text: "妈妈：你已经玩了两个多小时了，___。",
        correctKey: "2", answerSource: "official" },
      { qNo: "Q29", marks: 2, format: "MCQ", text: "妈妈：___，很容易得近视，到时候就需要戴眼镜了。",
        correctKey: "8", answerSource: "official" }
    ]
  },

  {
    groupId: "CH-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "中秋节庆祝会", source: "老师自编 — 应用文/通告",
      text: "中秋节庆祝会\n\n"
        + "中秋节就要到了，为了让同学对这个华人传统节日有更深的认识，欢乐小学将在10月3日傍晚六点到晚上八点举办中"
        + "秋节庆祝会。\n\n"
        + "【灯笼制作比赛】活动详情：\n时间：傍晚六点到七点　地点：学校礼堂\n"
        + "注意：比赛是个人赛／只能用学校提供的材料／请在9月26日前到学校办公室报名\n\n"
        + "【提灯笼游园】活动详情：\n时间：傍晚七点半　地点：学校广场集合\n注意：必须自备灯笼\n\n"
        + "【游戏摊位】活动详情：\n时间：傍晚六点到七点半　地点：篮球场\n\n"
        + "（傍晚6点开始，食堂有小吃摊卖美食。）\n\n"
        + "中秋节庆祝会入场免费，现场也有照相摊位，让大家拍照留念，但需付费。\n"
        + "如果想了解更多中秋节庆祝会的详情，请拨打61234567到办公室找陈小姐。\n\n"
        + "欢乐小学\n2025年9月10日"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ", text: "学校举办中秋节庆祝会的目的是什么？",
        options: [
          {key:"1",text:"鼓励学生们参加灯笼制作比赛。"},
          {key:"2",text:"通知学生有小吃摊位售卖美食。"},
          {key:"3",text:"让学生对中秋节有更深的认识。"},
          {key:"4",text:"邀请学生来中秋庆祝会提灯笼。"}],
        correctKey: "3", answerSource: "official" },
      { qNo: "Q31", marks: 2, format: "MCQ", text: "怎样才可以参加灯笼制作比赛？",
        options: [
          {key:"1",text:"10月3日傍晚六点到礼堂去。"},
          {key:"2",text:"在庆祝会时带自己的灯笼来。"},
          {key:"3",text:"拨办公室电话号码找陈小姐。"},
          {key:"4",text:"在截止日期前到办公室报名。"}],
        correctKey: "4", answerSource: "official" },
      { qNo: "Q32", marks: 2, format: "MCQ", text: "以下哪一个句子是不正确的？",
        options: [
          {key:"1",text:"学校会提供灯笼制作比赛的材料。"},
          {key:"2",text:"参加者可以在照相摊位免费拍照。"},
          {key:"3",text:"游戏摊在傍晚六点至七点半开放。"},
          {key:"4",text:"庆祝中秋的活动在10月3日举办。"}],
        correctKey: "2", answerSource: "official",
        notes: "选项(2)是错的：照相摊位需要付费，并非免费。" },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "如果你是国华，你和同学立明约好10月3日中秋节庆祝会当天一起提灯笼游园。于是，你写一则短信给立明，"
          + "提醒他这个活动的详情。",
        context: "开头已给出：“立明，别忘了我们约好10月3日当天一起提灯笼游园。请记得______”\n"
          + "评分标准：内容 /2分，表达 /2分（扣分项：病句、错别字、标点符号错误、词语搭配错误），总分 /4分。",
        displayAnswer: "立明，别忘了我们约好10月3日当天一起提灯笼游园。请记得我们傍晚7点半（0.5分）在学校广场集合"
          + "（0.5分），必须自备灯笼（1分）。",
        answerSource: "official",
        notes: "官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。" }
    ]
  },

  {
    groupId: "CH-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "书店老板", source: "改编自《别饿坏了那匹马》",
      text: "上小学时，学校外的书店是我放学后常去的地方。照理来说，去书店应该是买书来看的，但更多的时候，口袋空"
        + "空的我只能装作选书的样子，偷偷地看几页的故事，然后装作没事离开。我以为这样做神不知鬼不觉，心中一直非"
        + "常得意。\n\n"
        + "一天，我又在偷读故事，突然听到有人说：“你坐下慢慢读吧！”我慌张地抬头，发现书店老板正看着我，微笑着指"
        + "了指身旁的椅子。见老板没有因为我白看书而赶我走，我松了一口气。我刚要坐下，突然身后有人拉住了我的衣领"
        + "。我一转头，看到父亲生气地瞪着我。\n\n"
        + "“别怪他，一两次而已……”老板见了，连忙说。没等老板说完，父亲就抢过我手中的书，看了看那本书的价钱，快"
        + "速地从钱包里拿出钱放在柜台上，然后拉着我走了。\n\n"
        + "回到家里，父亲对我说：“我们虽然不富有，也不能占别人便宜。你想想，如果大家都跟你一样，你要书店的生意"
        + "怎么做下去？”我听了，觉得之前的行为太不应该了。\n\n"
        + "那天后，父亲经常故意安排一些家务给我做。做完家务后，他会给我一些钱，这样放学后我就可以到书店买下自己"
        + "喜欢的书。\n\n"
        + "最近爸爸让我专心准备考试，没安排家务给我做。没有钱，我只好不去书店了。这天放学后，我经过书店时，老板"
        + "叫住了我，问道：“最近怎么不来买书了？”我红着脸告诉他实情。他笑着递给我一个笔记本，说：“没事的，你就"
        + "先拿吧，然后把拿的书记在这个本子上，以后再付钱。”听了他的话，我的眼圈红红的。一个和我没有什么关系的"
        + "人愿意为我这样做，让我的心中暖暖的。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in", text: "文中表示“心里紧张，动作忙乱”的词语是 ___ 。",
        accepted: ["慌张"], displayAnswer: "慌张", answerSource: "official" },
      { qNo: "Q35", marks: 2, format: "Fill-in", text: "文中表示“动作速度快”的词语是 ___ 。",
        accepted: ["快速"], displayAnswer: "快速", answerSource: "official" },
      { qNo: "Q36", marks: 3, format: "Long-Answer", text: "“我”为了什么事感到得意？",
        displayAnswer: "我口袋空空（0.5分），在书店装作选书（0.5分），偷偷看了几页故事（0.5分），然后装作没事离开"
          + "（0.5分），以为这样做神不知鬼不觉（1分），感到很得意。",
        answerSource: "official" },
      { qNo: "Q37", marks: 3, format: "Long-Answer", text: "发现“我”白看书的行为后，父亲在书店里做了什么？",
        displayAnswer: "父亲拉住了“我”的衣领（0.5分），生气地瞪着“我”（0.5分），然后抢过“我”手上的书（0.5分），看"
          + "了看那本书的价钱（0.5分），快速地从钱包里拿出钱放在柜台上（0.5分），拉着“我”走了（0.5分）。",
        answerSource: "official" },
      { qNo: "Q38", marks: 4, format: "Long-Answer", text: "文中的“你要书店的生意怎么做下去”指的是什么？",
        displayAnswer: "这指的是如果大家（0.5分）都像作者（0.5分）一样，只看书不买书（0.5分），书店老板就没有钱赚"
          + "了。(2分)",
        answerSource: "official" },
      { qNo: "Q39", marks: 4, format: "Long-Answer", text: "书店老板后来对“我”做的事让“我”有什么感受？为什么？",
        displayAnswer: "a) “我”非常感动（2分）。 b) 因为书店老板和“我”没有什么关系（1分），却让“我”先拿书，把拿的"
          + "书记在本子上（0.5分），让“我”以后再给书的钱（0.5分）。",
        answerSource: "official" },
      { qNo: "Q40", marks: 4, format: "Long-Answer", text: "如果你是书店的老板，你还会怎么帮助作者？请加以说明。",
        displayAnswer: "官方答案接受以下任一种结构：\n"
          + "【2方法+2说明】a) 如果我是书店老板，我会请作者来我的书店打工（1分）。b) 这样可以让他赚钱买自己喜欢的"
          + "书（1分）。a) 我也可以把书以便宜的价钱卖给他（1分）。b) 这样他就买得起书了（1分）。\n"
          + "【或：1方法+1说明】a) 如果我是书店老板，我会以比较便宜的价钱把书卖给作者（2分）。b) 因为我知道作者喜"
          + "欢看书（0.5分），但家里不富有（0.5分），用这样的方法可以鼓励他继续看书（1分）。",
        answerSource: "official",
        notes: "开放式题目，官方提供两种可接受的答案结构，学生答案只要合理并符合评分要点即可。" }
    ]
  }
];
