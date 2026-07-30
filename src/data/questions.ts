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

export const LESSON_COUNT: number = 9;

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
  },

/* =========================================================
   NAN HUA SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "NH-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "他穿了一件白色的__衬衫__去工作。（选出画线词语的汉语拼音）",
        options: [{ key: "1", text: "chèn sān" }, { key: "2", text: "chèn shān" }, { key: "3", text: "chèng sān" }, { key: "4", text: "chèng shān" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NH-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "妈妈在碗里打了两个鸡蛋，加入调味料后开始__搅拌__。（选出画线词语的汉语拼音）",
        options: [{ key: "1", text: "jué pàn" }, { key: "2", text: "jué bàn" }, { key: "3", text: "jiǎo pàn" }, { key: "4", text: "jiǎo bàn" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NH-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "一棵大树倒在路中间，压 ___ 了一辆汽车。",
        options: [{ key: "1", text: "扁" }, { key: "2", text: "过" }, { key: "3", text: "骗" }, { key: "4", text: "偏" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "NH-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "从前，人们会用野 ___ 的骨头做成工具来打猎。",
        options: [{ key: "1", text: "守" }, { key: "2", text: "首" }, { key: "3", text: "受" }, { key: "4", text: "兽" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NH-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "在光线 ___ 的地方看书会对眼睛造成伤害。",
        options: [{ key: "1", text: "明亮" }, { key: "2", text: "充足" }, { key: "3", text: "昏暗" }, { key: "4", text: "模糊" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NH-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "每周的升旗礼，同学们必须在七点半前到礼堂 ___。",
        options: [{ key: "1", text: "排列" }, { key: "2", text: "欣赏" }, { key: "3", text: "集合" }, { key: "4", text: "围观" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NH-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "他把事情的经过说得很__详细__。（选出与画线词语意思最接近的选项）",
        options: [{ key: "1", text: "十分清楚" }, { key: "2", text: "内容正确" }, { key: "3", text: "非常细心" }, { key: "4", text: "说话温柔" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "NH-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "文康突然生病了，欢欢__代替__他参加比赛。（选出与画线词语意思最接近的选项）",
        options: [{ key: "1", text: "做原本另一个人要做的事" }, { key: "2", text: "和另一个人一起做一件事" }, { key: "3", text: "把事情交给另一个人去做" }, { key: "4", text: "请另一个人帮忙自己做事" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "NH-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "他 ___ 会主动帮助邻居，___ 还会到老人院陪伴老人家。",
        options: [{ key: "1", text: "不是……而是" }, { key: "2", text: "不但……而且" }, { key: "3", text: "因为……所以" }, { key: "4", text: "虽然……但是" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NH-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "我常常说谎，这次 ___ 我怎么解释，他 ___ 不再相信我了。",
        options: [{ key: "1", text: "不管……都" }, { key: "2", text: "不仅……还" }, { key: "3", text: "假如……就" }, { key: "4", text: "只有……才" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "NH-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "___，不如留在家里看书吧。",
        options: [{ key: "1", text: "反正我们都喜欢画画" }, { key: "2", text: "反正外面正在下大雨" }, { key: "3", text: "反正这本书我刚看完" }, { key: "4", text: "反正朋友叫我下楼玩" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NH-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "他很自私，___。",
        options: [{ key: "1", text: "从来不会对别人说真话" }, { key: "2", text: "都会慢慢学会原谅他人" }, { key: "3", text: "总是尽力帮助其他同学" }, { key: "4", text: "邻居们都不想和他来往" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NH-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？（词语：增添）",
        options: [{ key: "1", text: "上五年级后，我们的各科作业都增添了不少。" }, { key: "2", text: "我喜欢看故事书，因此作文分数增添了许多。" }, { key: "3", text: "为了增添学习的乐趣，老师准备了很多游戏。" }, { key: "4", text: "多做运动能增添我们的身体，让我们更健康。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NH-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？（词语：宽阔）",
        options: [{ key: "1", text: "他们的衣服很宽阔，夏天穿起来一点也不热。" }, { key: "2", text: "这条马路很宽阔，能同时让六辆车并排行驶。" }, { key: "3", text: "我家沙发很宽阔，全家人坐在上面也不觉得挤。" }, { key: "4", text: "奶奶时常教育我凡事宽阔一点，不要斤斤计较。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NH-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [2], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？（词语：异口同声）",
        options: [{ key: "1", text: "老奶奶跌倒了，路人都异口同声地跑过去扶她。" }, { key: "2", text: "老师一提出问题，小明便异口同声地抢着回答。" }, { key: "3", text: "他提议今天去圣淘沙玩，我们异口同声地说好。" }, { key: "4", text: "考完试后，同学们异口同声地讨论题目的答案。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  {
    groupId: "NH-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "难忘的五年级", source: "老师自编",
      text: "五年级有丰富的活动，如：露营、学习之旅、观看国庆预演等。最让我难忘的是三天两夜的露营活动。那是我第一次离开家人，[Q16]___ 参加那么久的活动。虽然没有美味的食物，也没有舒服的床，但那一次的露营经历却让我更加 [Q17]___ 和同学在一起的时光。\n\n国庆前的一个周六傍晚，五年级学生在老师们的带领下，去大草场观看了国庆预演。跳伞表演、海陆空三军表演、大型歌舞节目、[Q18]___ 的烟花……当课本上写的场景真实地出现我面前时，我为新加坡感到 [Q19]___。\n\n五年级 [Q20]___ 就要过去了，这一年非常充实，父母都夸我长大了，更懂事了。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "那是我第一次离开家人，___ 参加那么久的活动。",
        options: [{ key: "1", text: "独自" }, { key: "2", text: "顺利" }, { key: "3", text: "坚持" }, { key: "4", text: "配合" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "那一次的露营经历却让我更加 ___ 和同学在一起的时光。",
        options: [{ key: "1", text: "满意" }, { key: "2", text: "习惯" }, { key: "3", text: "珍惜" }, { key: "4", text: "盼望" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "跳伞表演、海陆空三军表演、大型歌舞节目、___ 的烟花……",
        options: [{ key: "1", text: "精彩万分" }, { key: "2", text: "五彩缤纷" }, { key: "3", text: "兴高采烈" }, { key: "4", text: "整整齐齐" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "我为新加坡感到 ___。",
        options: [{ key: "1", text: "幸福" }, { key: "2", text: "激动" }, { key: "3", text: "惊奇" }, { key: "4", text: "骄傲" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "五年级 ___ 就要过去了，这一年非常充实。",
        options: [{ key: "1", text: "一转身" }, { key: "2", text: "一回头" }, { key: "3", text: "一抬手" }, { key: "4", text: "一眨眼" }],
        correctKey: "4",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "捐鞋子", source: "老师自编",
      text: "几天前，我放学回家时看到门上插着一张纸。我拿起来一看，原来是有人在回收旧物品，如衣服、书包，还有旧鞋子。\n\n我马上想到几天前妈妈说我有几双鞋子穿不下，又要买新的了！于是我赶紧跑去找妈妈：“妈妈，我们可以把旧鞋子捐出去，送给有需要的人。”妈妈点点头，笑着说：“太好了，我找个时间准备一下。”\n\n今天，我一放学回家就发现妈妈在弯腰刷鞋子。我走近一看，那不就是我们要捐出去的鞋子吗？我好奇地问：“妈妈，鞋子都要捐出去了，为什么还要洗呢？这样不是很麻烦吗？”\n\n妈妈语重心长地说：“如果别人送给我们的二手衣服很脏，你会开心吗？”\n\n我想了一下，然后摇摇头：“不会……我可能还会有点难过，会觉得他们在可怜我。”妈妈点点头说：“我希望别人拿到鞋子的时候开心，而不是觉得我们只是把不要的东西扔给他们。我们要用心帮助他人、尊重他人。”听完妈妈的话，我的脸有点红了。我原来只想着把鞋子送出去就好了，没想到这件事并没有那么简单。\n\n我想：以后我在帮助别人的时候，也要像妈妈一样，带着尊重和爱心去做每一件小事。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "作者为什么想要捐鞋子？",
        options: [{ key: "1", text: "想要再买一双新的鞋子" }, { key: "2", text: "去帮助那些有需要的人" }, { key: "3", text: "不想要再清洗旧鞋子了" }, { key: "4", text: "感谢别人送的二手衣服" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "什么事情让作者感到好奇？",
        options: [{ key: "1", text: "妈妈清洗将要捐出去的鞋子" }, { key: "2", text: "妈妈要找个时间准备旧鞋子" }, { key: "3", text: "妈妈不想收到不干净的衣服" }, { key: "4", text: "妈妈希望拿到鞋子的人开心" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "“没想到这件事并没有那么简单”，这句话是什么意思？",
        options: [{ key: "1", text: "觉得这样捐东西给别人太麻烦了" }, { key: "2", text: "认为可以把不要的东西直接扔掉" }, { key: "3", text: "不知道帮人时要注意别人的感受" }, { key: "4", text: "以为别人拿到旧鞋子时会很开心" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "你认为妈妈是一个怎样的人？",
        options: [{ key: "1", text: "喜欢干净" }, { key: "2", text: "不怕麻烦" }, { key: "3", text: "做事认真" }, { key: "4", text: "为人着想" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "这个故事告诉大家一个什么道理？",
        options: [{ key: "1", text: "把旧鞋子刷干净才能捐出去" }, { key: "2", text: "可以把不要的东西送给别人" }, { key: "3", text: "做好事也要带着尊重和爱心" }, { key: "4", text: "尽自己所能帮助有需要的人" }],
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "我想去日本看雪" }, { key: "2", text: "你什么时候出发" }, { key: "3", text: "想和家人一起去看花展" }, { key: "4", text: "只要你穿上保暖的衣物" }, { key: "5", text: "要是不习惯那里的天气" }, { key: "6", text: "那里的天气和新加坡一样热" }, { key: "7", text: "如果你没带平常生病时吃的药" }, { key: "8", text: "你买了哪一天回新加坡的机票" }],
    passage: {
      title: "去日本旅行", source: "老师自编",
      text: "文乐：伟玲，这次的学校假期你想去哪里游玩？\n伟玲：我喜欢冬天，[Q26]___。\n文乐：哇！你还可以去堆雪人，一定会玩得很开心。\n伟玲：是啊！不过冬天十分寒冷，特别是刮风的时候。[Q27]___，就容易生病。\n文乐：不用担心，[Q28]___，就没问题了。我也在冬天时去过日本，我可以借你一些保暖的衣物和用品。\n伟玲：真的吗？那太好了！谢谢你！\n文乐：不客气！[Q29]___？我把东西准备好，送到你家。\n伟玲：我买了十二月一号的机票。真的太感谢你了！"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "伟玲：我喜欢冬天，___。",
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "伟玲：不过冬天十分寒冷，特别是刮风的时候。___，就容易生病。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "文乐：不用担心，___，就没问题了。",
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "文乐：不客气！___？我把东西准备好，送到你家。",
        correctKey: "2",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "户外亲子游", source: "老师自编 — 应用文/通告",
      text: "户外亲子游\n\n为了加深居民们对新加坡的了解，欢乐民众俱乐部将举办户外亲子游活动。有兴趣的居民请在11月25日之前到欢乐民众俱乐部报名，报名免费。\n\n活动详情：\n日期：2025年12月6日\n时间：上午8:30-12:30\n\n路线一：爬山乐　呼吸新鲜空气，沿路看各种植物和动物。山路难走，一年级以上小朋友才能参加。\n\n路线二：动物园步道行　沿着动物园外围走，可以免费看各种动物，全程三公里。\n\n路线三：市中心街道行　参观城市建筑，了解历史，适合喜欢历史和市区文化的人。\n\n路线四：东海岸骑行　沿着海岸线骑行，一路欣赏海景，非常自由放松。参加者一定要会骑车，需自己付钱租车。\n\n注：一定要穿舒服的鞋子，要注意防蚊防晒，带雨伞以防下雨。\n\n2025年11月1日\n欢乐民众俱乐部"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "这则通告的主要目的是什么？",
        options: [{ key: "1", text: "告诉大家新加坡有很多好玩的地方" }, { key: "2", text: "提醒家长要多带孩子进行户外活动" }, { key: "3", text: "鼓励大家报名参加户外亲子游活动" }, { key: "4", text: "希望居民们对新加坡有更深的了解" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "以下哪一项是动物园步道行的特别之处？",
        options: [{ key: "1", text: "可以呼吸新鲜的空气" }, { key: "2", text: "能看到动物园的动物" }, { key: "3", text: "感受大海的美丽景色" }, { key: "4", text: "了解历史和市区文化" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪句话是正确的？",
        options: [{ key: "1", text: "参加东海岸骑行的人要自己付钱租车" }, { key: "2", text: "所有小朋友都可以参加爬山乐的活动" }, { key: "3", text: "民众俱乐部会准备防蚊防雨防晒用品" }, { key: "4", text: "只有参加爬山乐才可以看到各种动物" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "妈妈，我看到欢乐民众俱乐部的通告，他们将举办“户外亲子游”活动，我喜欢看各种建筑物，______",
        context: "开头已给出：“妈妈，我看到欢乐民众俱乐部的通告，他们将举办‘户外亲子游’活动，我喜欢看各种建筑物，______”",
        displayAnswer: "妈妈，我看到欢乐民众俱乐部的通告，他们将举办“户外亲子游”活动，我喜欢看各种建筑，我想让您带我参加“市中心街道行”。这个活动的日期是12月6日，时间是上午8:30到12:30。请您在11月25日之前到欢乐民众俱乐部报名。",
        answerSource: "official",
        notes: "官方示范答案只是其中一种合理写法，需包含路线选择及活动的日期/时间/报名截止日等细节。"
      }
    ]
  },

  {
    groupId: "NH-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "值日生", source: "老师自编",
      text: "休息铃声响起后，明伟和立成留在教室里，他们是今天的值日生。明伟在擦白板时，立成却偷偷跑出去打篮球了。\n\n过了一会儿，明伟发现立成溜走了，他皱了皱眉头，但什么也没说，继续打扫教室。\n\n不一会儿，老师来了。她看到教室很整洁，以为今天负责打扫的两位值日生分工合作，把教室打扫干净了，问道：“今天谁是值日生？”明伟说：“老师，是我和立成。”老师接着说：“教室很整洁，但垃圾桶旁还有些垃圾，下次记得更仔细一些。”明伟点点头。\n\n第二天，老师在班上表扬道：“昨天我看见教室很整洁，白板也很干净。有些同学就算没人提醒，也依然尽责，这是一种值得学习的精神。”立成听了老师的话，偷偷看了一眼明伟，心中有些惭愧，也有点感动。\n\n放学后，立成跑来找明伟：“你为什么不告诉老师我没做值日？”明伟淡淡地说：“我是值日生，我应该把我的部分做好。你是我的朋友，我不想因为一句话破坏我们的友情。但我也希望你以后不要把责任推给别人。”立成低下头，难为情地说：“对不起，我以后不会再这样了。”\n\n又到了做值日的时候，立成留在教室里打扫。明伟没有说话，只是递给他一块抹布，两人看着对方，不约而同地笑了。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中表示“做事认真”的词语是 ___。",
        accepted: ["仔细"],
        displayAnswer: "仔细",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中表示“事先没有约定，行动却完全一样”的词语是 ___。",
        accepted: ["不约而同"],
        displayAnswer: "不约而同",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 3, format: "Long-Answer",
        text: "发现立成偷偷跑出去打篮球后，明伟有什么反应？",
        displayAnswer: "明伟发现立成偷偷跑出去打篮球后，他皱了皱眉头，但什么也没说，继续打扫教室。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "立成听了老师的话，为什么有些惭愧，也有些感动？",
        displayAnswer: "a) 立成听了老师的话，觉得有些惭愧，因为他偷偷跑出去打篮球，留下明伟一个人做值日，他知道自己做错了。 b) 他也觉得感动，因为他知道明伟没有告诉老师他没做值日的事，让他不会被老师责骂。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "为什么明伟不告诉老师立成没做值日？",
        displayAnswer: "明伟不告诉老师立成没做值日，因为他认为他也是值日生，应该把他的部分做好，而立成是他的朋友，他不想因为这件事破坏他们的友情。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 3, format: "Long-Answer",
        text: "第四段中，老师说的话让同学们明白了什么？（2分）最后立成做了什么决定？（1分）",
        displayAnswer: "老师的话让同学们明白了做事要尽责，就算没人提醒也能自己完成任务。最后立成在做值日时，留在课室认真打扫。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "你从明伟身上学到了什么？你会怎么把它运用到生活中？",
        displayAnswer: "官方参考答案接受以下任一种（学生答案只要合理并符合评分要点即可）：\n【责任心角度】我从明伟身上学到了不要把责任推给别人。平时在学习时，我会自动自发地把老师吩咐的作业做好，并按时交上，不需要他人提醒或催促。\n【友情角度】我从明伟的身上学到了不应该为了一点小事而破坏了友情。和朋友相处时，不要为了一小事争吵，有误会时要说清楚。",
        answerSource: "official",
        notes: "开放式题目，官方提供两个不同角度的参考答案，学生答案只要合理并符合评分要点即可。"
      }
    ]
  },

  {
    groupId: "NH-HC-G1", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 A组",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "误会", source: "老师自编",
      text: "休息时间，教室里传来争吵声。\n\n“你翻我书包干什么！”小明气红了脸，像一头 [Q1]___ 的狮子。\n\n原来小明发现车资卡不见了，认为是一旁收作业的丽丽拿的。丽丽的泪水在眼中打转，[Q2]___ 地说：“真不是我……”\n\n眼看两人越吵越 [Q3]___，班长赶紧上前拉开两人。不一会儿，老师来了，说：“我们还没有弄清楚 [Q4]___ 情况，不能随便说是别人的错。”\n\n放学后，小明在书包找到了那张车资卡——原来是自己塞进去的！第二天，小明向丽丽道了歉。老师笑了，[Q5]___ 地说：“一句对不起，比争吵更有用。”\n\n词语库：1激动 2矛盾 3委屈 4心照不宣 5后悔 6愤怒 7详细 8语重心长"
    },
    questions: [
      { qNo: "Q1", marks: 2, format: "Fill-in",
        text: "小明气红了脸，像一头 ___ 的狮子。",
        accepted: ["6", "愤怒", "6愤怒", "6 愤怒"],
        displayAnswer: "6 愤怒",
        answerSource: "official"
      },
      { qNo: "Q2", marks: 2, format: "Fill-in",
        text: "丽丽的泪水在眼中打转，___ 地说：“真不是我……”",
        accepted: ["3", "委屈", "3委屈", "3 委屈"],
        displayAnswer: "3 委屈",
        answerSource: "official"
      },
      { qNo: "Q3", marks: 2, format: "Fill-in",
        text: "眼看两人越吵越 ___，班长赶紧上前拉开两人。",
        accepted: ["1", "激动", "1激动", "1 激动"],
        displayAnswer: "1 激动",
        answerSource: "official"
      },
      { qNo: "Q4", marks: 2, format: "Fill-in",
        text: "我们还没有弄清楚 ___ 情况，不能随便说是别人的错。",
        accepted: ["7", "详细", "7详细", "7 详细"],
        displayAnswer: "7 详细",
        answerSource: "official"
      },
      { qNo: "Q5", marks: 2, format: "Fill-in",
        text: "老师笑了，___ 地说：“一句对不起，比争吵更有用。”",
        accepted: ["8", "语重心长", "8语重心长", "8 语重心长"],
        displayAnswer: "8 语重心长",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-HC-G2", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 B组",
    category: "errorcorrect", lessonEligible: false, lessonIds: [],
    passage: {
      title: "扫地机器人", source: "老师自编",
      text: "我家有一台扫地机。它长着两只脚，每只脚上有三把小刷子，扫地可全靠它们呢！它还长着两只“小眼睛”，[Q6]停止 它乱撞家里的东西。\n\n别看它不大，扫起地来可快了！你只要按下它身体上的开关，它就会 [Q7](墨)(墨) 地扫起地来。它扫地时可仔细了，你完全不用 [Q8]怀(意) 它的能力。如果发现哪个地方很脏，它就会不停地扫，直到完成任务，才肯离开。\n\n它还有好多其他的本领呢！除了 [Q9]辛(琴) 地工作，它还会自己充电呢！如果它快没电了，它就会赶快跑回充电的地方。充电时，它的身体就会亮起绿灯。电充好了，它就能重新开始工作了。\n\n多么聪明的扫地机啊！自从有了它，我家 [Q10]增长 了许多乐趣！"
    },
    questions: [
      { qNo: "Q6", marks: 2, format: "Fill-in",
        text: "它还长着两只“小眼睛”，停止 它乱撞家里的东西 —— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["防止"],
        displayAnswer: "防止",
        answerSource: "official"
      },
      { qNo: "Q7", marks: 2, format: "Fill-in",
        text: "它就会 (墨)(墨) 地扫起地来 —— 括号里的字是写错的字，请改正。",
        accepted: ["默"],
        displayAnswer: "默 (默默)",
        answerSource: "official"
      },
      { qNo: "Q8", marks: 2, format: "Fill-in",
        text: "你完全不用怀 (意) 它的能力 —— 括号里的字是写错的字，请改正。",
        accepted: ["疑"],
        displayAnswer: "疑 (怀疑)",
        answerSource: "official"
      },
      { qNo: "Q9", marks: 2, format: "Fill-in",
        text: "除了辛 (琴) 地工作 —— 括号里的字是写错的字，请改正。",
        accepted: ["勤"],
        displayAnswer: "勤 (辛勤)",
        answerSource: "official"
      },
      { qNo: "Q10", marks: 2, format: "Fill-in",
        text: "自从有了它，我家 增长 了许多乐趣 —— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["增添"],
        displayAnswer: "增添",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-HC-G3", subject: "Higher Chinese", paper: "Paper 2", section: "二 阅读理解(一)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "了不起的爸爸", source: "老师自编",
      text: "大卫的爸爸只有一条腿，这让大卫觉得有点丢脸。有一天，学校举行篮球比赛，大卫希望妈妈能去看。但当妈妈说要和爸爸一起去时，大卫立刻拒绝，不情愿地说：“我只希望您一个人去。爸爸去了，会让气氛变得奇怪。”妈妈叹了口气，正要说话，爸爸刚好走过来说：“我要出国工作，你们去就好。”\n\n比赛那天，大卫的队伍赢了。妈妈很开心，说：“如果你爸爸知道了，一定会感到骄傲的！”大卫一听见“爸爸”两个字，脸色就变了，不耐烦地说：“别提他了，好吗？”妈妈问：“你知道爸爸是怎么失去一条腿的吗？”大卫摇头。妈妈说：“你两岁时在路边乱跑，一辆车突然冲出来。你爸爸冲过去推开你，结果自己被撞了。”大卫听了，满脸通红，一句话也说不出来。\n\n妈妈接着告诉他另一个秘密：爸爸就是著名作家布恩特！那个写出许多精彩故事的人，竟然就是他一直以为“丢脸”的爸爸！大卫不敢相信自己的耳朵，冲去问老师。老师点头说：“这是真的。你爸爸不想让你太早知道这些，是怕你有压力。他一直都很爱你，你爸爸是一位伟大的父亲。”\n\n几天后，爸爸回来了，大卫小声问：“您真的是布恩特？”没等爸爸回答，大卫就把一本爸爸写的书递了过去，兴奋地请他签名。爸爸微笑地看着大卫，然后在第一页写下：“爸爸永远爱你！”"
    },
    questions: [
      { qNo: "Q11", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：弟弟做错了事，却不肯道歉。",
        accepted: ["拒绝"],
        displayAnswer: "拒绝",
        answerSource: "official"
      },
      { qNo: "Q12", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：他听到自己拿了一百分，非常自豪。",
        accepted: ["骄傲"],
        displayAnswer: "骄傲",
        answerSource: "official"
      },
      { qNo: "Q13", marks: 2, format: "Long-Answer",
        text: "大卫在得知第一个秘密时，他的反应有所不同，试加以比较，并说明原因。（填入表格：得知第一个秘密时）",
        context: "表格栏目：反应 / 原因",
        displayAnswer: "反应：满脸通红，一句话也说不出来\\n原因：知道了爸爸是为了自己而受伤，感到惭愧",
        answerSource: "official"
      },
      { qNo: "Q14", marks: 2, format: "Long-Answer",
        text: "大卫在得知第二个秘密时，他的反应有所不同，试加以比较，并说明原因。（填入表格：得知第二个秘密时）",
        context: "表格栏目：反应 / 原因",
        displayAnswer: "反应：不敢相信自己的耳朵，冲去问老师\\n原因：没想到爸爸是著名作家",
        answerSource: "official"
      },
      { qNo: "Q15", marks: 4, format: "Long-Answer",
        text: "当妈妈说要和爸爸一起去看大卫的比赛时，大卫是怎么做的，为什么？",
        displayAnswer: "大卫立刻拒绝了，不情愿地说他只希望妈妈一个人去。因为爸爸只有一条腿，大卫认为有点丢脸，去了会让气氛变得奇怪。",
        answerSource: "official"
      },
      { qNo: "Q16", marks: 4, format: "Long-Answer",
        text: "试从以下两个选项中，选一个最适合的作为这篇短文的题目，并举例说明理由：(1) 伟大的父亲 (2) 著名的作家",
        displayAnswer: "选 (1) 伟大的父亲。我选《伟大的父亲》作为这篇短文的题目，因为短文主要讲的是大卫的父亲为了救大卫而失去一条腿，而且父亲怕大卫有压力，就没有告诉大卫自己就是著名作家布恩特。大卫最后明白了父亲一直默默在为自己付出，是一位伟大的父亲。",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NH-HC-G4", subject: "Higher Chinese", paper: "Paper 2", section: "三 阅读理解(二)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "自己动脑", source: "老师自编",
      text: "假期里，小光到外婆家住。外婆写了一张购物清单，让他去附近的小超市帮忙买日用品。\n\n第一次自己去买东西，小光把清单递给了小超市的老板王爷爷。王爷爷只是扫了一眼，便说：“架子上都有，自己去找吧。”说完，他便转身走向收银台，不再理会小光。\n\n小光听了，十分惊讶。他原以为大人会帮他，结果却被一句话打发了。他只好在架子间走来走去。鸡蛋藏在面包和牛奶之间，纸巾压在玩具堆下，牙刷竟然夹在毛巾旁边。他蹲下、起身，来来回回转了好几圈，才手忙脚乱地把东西全部找齐。\n\n回到家，他向外婆抱怨，说王爷爷冷冰冰的，不理睬他，明明知道东西在哪里，却害他浪费了好多时间。外婆笑了笑，鼓励他说：“我明白王爷爷的意思，你自己去找答案吧。”\n\n接下来的几天，外婆依然让他一个人去店里。一开始，小光还需要花很多时间。渐渐地，他学会主动把清单读一遍，在脑子里先想好找东西的顺序再出门。后来，他发现自己找得一次比一次快。\n\n每次小光独自完成任务，都会觉得自己长高了一点，王爷爷也总向他投来赞许的目光。\n\n假期快结束时，王爷爷问小光现在有没有明白他的用意。小光点点头，说：“您是想让我学会自己动脑，也让我知道，很多事情不是别人不帮，而是自己可以做到。”王爷爷笑着说：“真正的成长，是哪怕一开始觉得难，也愿意去尝试。”"
    },
    questions: [
      { qNo: "Q17", marks: 2, format: "Long-Answer",
        text: "试解释下面短语在文中的意思（第三段）：“被一句话打发了”",
        displayAnswer: "小光以为王爷爷会帮他找东西，没想到王爷爷却说架子上都有，让他自己找，便不再理会小光。",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "Long-Answer",
        text: "试解释下面短语在文中的意思（第六段）：“觉得自己长高了一点”",
        displayAnswer: "小光每次独自完成任务，发现自己找东西越来越快，觉得自己成长了。",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 4, format: "Long-Answer",
        text: "第一次去小超市，小光惊讶的原因是什么？他是怎么把东西找齐的？",
        displayAnswer: "小光觉得惊讶，因为他原本以为大人会帮忙，却听到王爷爷叫他自己找。他在架子间走来走去，蹲下、起身，来来回回转了好多圈，才手忙脚乱地把东西全部找齐。",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 4, format: "Long-Answer",
        text: "假期里，外婆是怎么帮助小光成长的？",
        displayAnswer: "一开始，外婆写了购物清单，让小光去附近的小超市帮忙买日用品。后来，小光向外婆抱怨王爷爷时，外婆鼓励他自己去找答案。接下来的几天，外婆依然让他自己去买东西。最后，小光学会了独自买东西，明白了很多事情不是别人不帮，而是自己可以做到。",
        answerSource: "official"
      },
      { qNo: "Q21", marks: 4, format: "Long-Answer",
        text: "请用不超过15个字，写出文中第五段的段落大意。",
        context: "字数限制：≤15字",
        displayAnswer: "小光独自购物，学会动脑，找东西更快。",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 4, format: "Long-Answer",
        text: "小光对自己去超市买东西的想法有什么改变？从哪里可以看出？",
        displayAnswer: "一开始，小光去超市买东西时，认为自己只需要提供购物清单，大人应该帮他找东西。从他听了王爷爷的话，十分惊讶，以为大人会帮他，结果却被一句话打发了，后面还抱怨王爷爷冷冰冰的可以看出。后来，他明白应该自己动脑，很多事情自己可以做到。从他后来找东西前会主动把清单读一遍，在脑子里先想好找东西的顺序再出门可以看出。",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 4, format: "Long-Answer",
        text: "如果你遇到困难，你会像小光一样，自己尝试解决问题吗？为什么？请举生活中的例子加以说明。",
        displayAnswer: "官方参考答案接受两种立场（学生答案只要合理并符合评分要点即可）：\n【会】我会像小光一样自己尝试解决问题，因为我觉得能够自己完成任务，才是真正的成长。我小时候不会骑脚踏车，我没有让爸爸扶我，而是让自己练习，最后我真的学会了，也很有成就感。\n【不会】我不会像小光一样自己尝试解决问题，因为我觉得刚开始做一件事时，还是需要有大人的帮助和指导。我小时候第一次学游泳，我很紧张，还是需要妈妈带着我一起游，最后我学会了。",
        answerSource: "official",
        notes: "开放式题目，官方提供两种可接受的立场（会/不会），学生答案只要合理并符合评分要点即可。"
      }
    ]
  },

/* =========================================================
   ACS (JUNIOR) SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "ACSJ-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "这个杯子的__形状__很特别，吸引了我的目光。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "xín zhuàn" }, { key: "2", text: "xín zhuàng" }, { key: "3", text: "xíng zhuàn" }, { key: "4", text: "xíng zhuàng" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "他为人__慷慨__，常常出钱请朋友们吃饭。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "kān kǎi" }, { key: "2", text: "kān gài" }, { key: "3", text: "kāng kǎi" }, { key: "4", text: "kāng gài" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "爸爸 ___ 种的苹果树结出了许多红红的苹果。",
        options: [{ key: "1", text: "戴" }, { key: "2", text: "载" }, { key: "3", text: "截" }, { key: "4", text: "栽" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "沙滩上留下了我和弟弟奔跑的足 ___ 。",
        options: [{ key: "1", text: "季" }, { key: "2", text: "迹" }, { key: "3", text: "寄" }, { key: "4", text: "纪" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "长大后，我更加 ___ 和家人在一起的时光。",
        options: [{ key: "1", text: "珍惜" }, { key: "2", text: "保护" }, { key: "3", text: "爱护" }, { key: "4", text: "爱惜" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "我家门前有一条 ___ 的马路。",
        options: [{ key: "1", text: "巨大" }, { key: "2", text: "宽阔" }, { key: "3", text: "大型" }, { key: "4", text: "粗壮" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "轮到妹妹表演了，她__胸有成竹__地走上了舞台。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "非常自信" }, { key: "2", text: "十分自豪" }, { key: "3", text: "无比激动" }, { key: "4", text: "特别开心" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "哥哥最近__沉迷__于电脑游戏，常常不做功课。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "舍不得离开" }, { key: "2", text: "认真地完成" }, { key: "3", text: "非常用心做" }, { key: "4", text: "对事物上瘾" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "___ 我推开家门，我的小狗 ___ 会飞快地向我跑来。",
        options: [{ key: "1", text: "自从……就" }, { key: "2", text: "每当……都" }, { key: "3", text: "就算……也" }, { key: "4", text: "已经……还" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "___ 你要去图书馆，___ 顺便帮我还书吧。",
        options: [{ key: "1", text: "不管……仍然" }, { key: "2", text: "由于……因此" }, { key: "3", text: "反正……不如" }, { key: "4", text: "不但……而且" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "小明低着头偷看故事书，___________ 。",
        options: [{ key: "1", text: "视力就下降了许多" }, { key: "2", text: "是大家学习的榜样" }, { key: "3", text: "没发现老师正盯着他" }, { key: "4", text: "不知不觉做完了功课" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________ ，真想找个地洞钻进去。",
        options: [{ key: "1", text: "黄叔叔发现骂错了人" }, { key: "2", text: "林老师气得火冒三丈" }, { key: "3", text: "他的家被大雨冲倒了" }, { key: "4", text: "小明喜欢阴凉的地方" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：领取)",
        options: [{ key: "1", text: "老师今天领取全班同学去动物园。" }, { key: "2", text: "所有参赛者都可以领取免费午餐。" }, { key: "3", text: "爸爸生日那天，我送了他一条新领取。" }, { key: "4", text: "花木兰和士兵们攻打敌军，领取胜仗。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：宣布)",
        options: [{ key: "1", text: "丽丽在宣布上画了本地的著名景点。" }, { key: "2", text: "我把小明被欺负的事情宣布了老师。" }, { key: "3", text: "食堂里贴着几张宣布，提醒同学抹桌椅。" }, { key: "4", text: "比赛结束后，校长宣布我们班得了冠军。" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "ACSJ-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [3], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：详细)",
        options: [{ key: "1", text: "天空中突然飘起了详细的小雨。" }, { key: "2", text: "小安做事很详细，从来不出错。" }, { key: "3", text: "老师把游戏规则详细地解释给我们听。" }, { key: "4", text: "写完作文后，欢欢详细地检查了一遍。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  {
    groupId: "ACSJ-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "建国60周年", source: "老师自编",
      text: "今年是新加坡建国60周年。爷爷说以前很多人的家里很穷，一家几口挤在一个小房间里。房间里光线[Q16]___，就连白天都看不清楚书本上的字。到了晚上，路灯下坐满了写作业的孩子。虽然生活困难，但是大家的感情很好，只要有人买了好吃的，都会和邻居[Q17]___。\n\n听说今年的国庆庆典会介绍新加坡从过去到现在的改变，爷爷便决定带我去看。国庆那天，大草场外排起了长长的人龙，我等得有些不耐烦。爷爷见了[Q18]___我，说我们很快就可以进入会场了。\n\n我们在观众席坐下后不久，国庆庆典就开始了！表演节目十分精彩，我看得目不转睛。当国歌响起时，我自豪地唱着国歌，[Q19]___流下了眼泪。\n\n回家的路上，看着眼前的街道和高楼，我觉得作为新加坡人很[Q20]___。我们现在所拥有的一切得来不易，长大后，我也要为新加坡尽自己的一份力。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "房间里光线 ___ ，就连白天都看不清楚书本上的字。",
        options: [{ key: "1", text: "昏暗" }, { key: "2", text: "充足" }, { key: "3", text: "丰富" }, { key: "4", text: "模糊" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "只要有人买了好吃的，都会和邻居 ___ 。",
        options: [{ key: "1", text: "欣赏" }, { key: "2", text: "分享" }, { key: "3", text: "共用" }, { key: "4", text: "尝试" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "爷爷见了 ___ 我，说我们很快就可以进入会场了。",
        options: [{ key: "1", text: "唠叨" }, { key: "2", text: "提醒" }, { key: "3", text: "命令" }, { key: "4", text: "安慰" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "当国歌响起时，我自豪地唱着国歌，___ 流下了眼泪。",
        options: [{ key: "1", text: "恨不得" }, { key: "2", text: "忍不住" }, { key: "3", text: "受不了" }, { key: "4", text: "来不及" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "我觉得作为新加坡人很 ___ 。",
        options: [{ key: "1", text: "轻松" }, { key: "2", text: "惊喜" }, { key: "3", text: "幸福" }, { key: "4", text: "欢乐" }],
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "ACSJ-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "妈妈的用心", source: "老师自编",
      text: "小时候，小安喜欢围着妈妈转，告诉她学校里发生的事情。可是随着年龄增长，他只有在向妈妈要零用钱时才会和她说两句话。就连一起吃晚餐时，他也只是安静地盯着电视屏幕看，这让妈妈很伤心。妈妈担心小安长大后不懂得怎么跟别人交流，也无法清楚地说出自己的想法。\n\n不少父母只会批评孩子，从不称赞和鼓励他们；还有一些家长手机不离手，不是忙着上网购物，就是追看连续剧。这样的家长孩子们自然不愿意和他们交流。可小安的妈妈并不是那样的。\n\n在一次家长会上，老师告诉小安的妈妈，小安觉得妈妈不关心他。妈妈皱着眉头说：“我怎么会不关心小安呢？我每天一回到家，就会问他是否完成了作业。”老师说：“孩子们其实有许多烦恼，需要找人说一说。如果您只关心他的学业，小安会越来越害怕和您说话。要不，您试试和他聊学习以外的事情？”老师的话让妈妈恍然大悟。\n\n那天晚上，妈妈请小安教她打篮球，那是小安最喜欢的运动之一。小安一边教妈妈，一边兴奋地和她说了很多心里话。从那天起，家里又传出了欢声笑语。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "小安什么时候才会开口和妈妈说话？",
        options: [{ key: "1", text: "需要钱的时候。" }, { key: "2", text: "有烦恼的时候。" }, { key: "3", text: "开家长会的时候。" }, { key: "4", text: "一起吃饭的时候。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "小安不肯和妈妈说话，妈妈有什么感受？",
        options: [{ key: "1", text: "很失望。" }, { key: "2", text: "很难过。" }, { key: "3", text: "很生气。" }, { key: "4", text: "很害怕。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "为什么小安不愿意和妈妈说话？",
        options: [{ key: "1", text: "妈妈不懂得怎么跟别人面对面交谈。" }, { key: "2", text: "妈妈经常忙着上网购物和追看连续剧。" }, { key: "3", text: "妈妈只会批评小安，从不称赞和鼓励他。" }, { key: "4", text: "妈妈一开口就问功课，让他觉得压力很大。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "文中“恍然大悟”说明了什么？",
        options: [{ key: "1", text: "老师知道孩子们有许多烦恼。" }, { key: "2", text: "老师知道小安的妈妈关心他。" }, { key: "3", text: "妈妈知道应该和小安聊些什么了。" }, { key: "4", text: "妈妈知道要怎样说出自己的想法。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "妈妈是个怎样的人？",
        options: [{ key: "1", text: "关心孩子的人。" }, { key: "2", text: "热爱学习的人。" }, { key: "3", text: "喜欢运动的人。" }, { key: "4", text: "乐于助人的人。" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "ACSJ-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "我只写了一半" }, { key: "2", text: "谁会来帮助我呢" }, { key: "3", text: "你什么时候有空" }, { key: "4", text: "这次的作业不简单" }, { key: "5", text: "我把作业留在课室里了" }, { key: "6", text: "我很乐意当你的小老师" }, { key: "7", text: "你可以把作业借给我抄吗" }, { key: "8", text: "老师一定会狠狠骂我一顿的" }],
    passage: {
      title: "忘做作业", source: "老师自编",
      text: "李聪：阿东，老师昨天发的作业，你做完了吗？\n阿东：哦，[Q26]___。\n李聪：明天就要交作业了。你回到家赶紧做完吧。\n阿东：[Q27]___，有几道题我不会做，你可以教我吗？\n李聪：当然可以，[Q28]___。\n阿东：谢谢你，“师父”！\n李聪：不客气，朋友之间就应该互相帮忙。\n阿东：[Q29]___？\n李聪：我今天下午有时间，你可以随时来我家找我。\n阿东：好的，我吃完午餐就去找你。"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "阿东：哦，___ 。 (回应李聪问他作业做完了吗)",
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "阿东：___ ，有几道题我不会做，你可以教我吗？",
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "李聪：当然可以，___ 。",
        correctKey: "6",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "阿东：___ ？",
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "ACSJ-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "假期活动", source: "老师自编 — 应用文/通告",
      text: "红山小学假期活动\n\n为了让学生度过一个又特别又难忘的假期，红山小学将首次举办学校假期活动，让他们有机会认识自己生活的地方，帮助有需要的人。活动人数有限，欢迎家长在11月20日前上学校网站www.chengxinschool.sg为孩子报名。\n\n【走走看看】活动内容：小导游带你探索红山组屋区。日期和时间：11月28日下午4点到6点。注意事项：三年级以下的学生需要家长陪伴。\n\n【献爱心】活动内容：帮助独居老人大扫除／陪老人聊天。日期和时间：每周星期六早上8点到12点。注意事项：7点半到学校礼堂集合。\n\n【亲亲大自然】活动内容：到红山公园种树。日期和时间：12月3日早上7点到10点。注意事项：只限五、六年级学生。\n\n除了以上为学生准备的假期活动，本校也鼓励大家捐出旧衣服，帮助有需要的人。捐出的衣物必须清洗干净，放进学校门口的回收箱。"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "如果想进一步认识红山组屋区，你应该报名参加哪个活动？",
        options: [{ key: "1", text: "献爱心。" }, { key: "2", text: "走走看看。" }, { key: "3", text: "捐出旧衣服。" }, { key: "4", text: "亲亲大自然。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "以下哪一个说法是不正确的？",
        options: [{ key: "1", text: "学生需要报名参加假期活动。" }, { key: "2", text: "要捐出的旧衣服应该先清洗干净。" }, { key: "3", text: "所有活动都必须家长陪伴才可以参加。" }, { key: "4", text: "这是红山小学第一次举办学校假期活动。" }],
        correctKey: "3",
        answerSource: "official",
        notes: "这一句是错的——只有“走走看看”规定三年级以下学生需要家长陪伴"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "红山小学举办学校假期活动的主要目的是什么？",
        options: [{ key: "1", text: "让学生踏出家门认识朋友。" }, { key: "2", text: "让学生学习怎么上学校网站。" }, { key: "3", text: "让学生能和家长一起参加活动。" }, { key: "4", text: "让学生度过又特别又难忘的假期。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "假如你是康康，看到这个通告时，想起同班同学小乐很关心老人。于是，你写了一个短信给小乐，告诉她哪一个活动适合她，并说明活动当天需要做些什么和注意什么。",
        context: "开头已给出：“小乐，我们学校在假期将举办很多活动，我觉得你可以参加‘献爱心’的活动……”\n评分标准：内容 /2分，表达 /2分（扣分项：病句、错别字、标点符号错误、词语搭配错误），总分 /4分。",
        displayAnswer: "小乐，我们学校在假期将举办很多活动，我觉得你可以参加“献爱心”的活动。这个活动内容是帮助独居老人打扫除和陪老人聊天。日期和时间是每周星期六早上8点至12点，如果你有兴趣参加，请你父母在11月20日前在学校网站www.chengxinschool.sg为你报名，报名后每周星期六早上7点半到学校礼堂集合。",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。"
      }
    ]
  },

  {
    groupId: "ACSJ-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "游戏机", source: "老师自编",
      text: "一天，杨文回家告诉爸爸妈妈他的同学都买了最新的游戏机，他请求爸爸妈妈也给他买一台。那台游戏机要一千元，太贵了！爸爸想了想，说：“这样吧，如果你在年终考试能考到班级前十名，我们就想办法帮你实现愿望。”杨文听了，说：“您要说到做到！如果大家发现只有我没有游戏机，我会被取笑的！”\n\n杨文平时上课不专心，功课也不用心做，考试从来不超过40分，爸爸觉得他根本不可能完成这个任务。谁知几个月后，年终考试结束，杨文竟然考到全班第九名！爸爸妈妈听到这个好消息却沉默了很久。\n\n过了几天，爸爸妈妈递给杨文一个礼物，杨文兴奋地接过它，双手微微发抖。“这是什么？”杨文拆开礼物后，瞪大了眼睛，难过地问。妈妈拍拍他的肩膀，说：“对不起，我们现在真的没钱给你买游戏机，但你可以把零用钱存进这个铁盒。以后凡是考试得90分以上，我们就给你十元。等你存够了钱，就可以买游戏机了。”看着爸爸身上破了好几个洞的衬衫和妈妈脚上那双旧鞋子，杨文惭愧地点点头。\n\n接下来的一年，他每天认真听讲，晚上还会复习老师当天讲过的内容。此外，遇到不懂的题目他会立刻问老师或同学。在年终考试中，杨文取得了全年级第一名的好成绩。爸爸妈妈看到成绩册，笑着拿出一千元对杨文说：“我们存了一些钱。给！去买游戏机吧！”杨文没有伸手去接，而是从书包里拿出一件新衬衫和一双新鞋子递给了爸爸妈妈，说：“这一年，我明白了有些东西比游戏机更重要！”"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中表示“不说话”的词语是 ___ 。",
        accepted: ["沉默"],
        displayAnswer: "沉默",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中表示“只要是、所有”的词语是 ___ 。",
        accepted: ["凡是"],
        displayAnswer: "凡是",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 3, format: "Long-Answer",
        text: "杨文为什么想要最新的游戏机？",
        displayAnswer: "因为杨文的同学们都买了最新的游戏机，如果同学们发现只有他没有最新的游戏机，他会被取笑的，所以杨文想要最新的游戏机。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "文中“爸爸觉得他根本不可能完成这个任务”，“这个任务”指的是什么 (1分)？为什么爸爸觉得杨文不可能完成这个任务 (3分)？",
        displayAnswer: "这个任务是杨文要在年终考试考到班级前十名。因为杨文上课不专心，功课也不用心做，考试也从来不超过40分，所以爸爸觉得杨文不可能完成这个任务。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "打开盒子前后杨文的心情有什么不同 (2分)？为什么 (2分)？",
        displayAnswer: "打开盒子前，杨文感到很兴奋，打开盒子后，他感到很难过。因为打开盒子前，他考了全班第九名，他以为里面是父母答应实现的愿望——一台最新的游戏机。可是打开盒子后，发现里面什么也没有，只是一个空盒子。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 3, format: "Long-Answer",
        text: "杨文怎么取得全年级第一名？",
        displayAnswer: "杨文每天认真听讲，晚上会复习老师当天讲过的内容，他遇到不懂的题目也会立刻问老师或同学，他通过这样做，取得了全班第一名。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "杨文有哪两个值得你学习的地方 (2分)？试各举一个例子加以说明 (2分)。",
        displayAnswer: "杨文有两个值得我学习的地方。第一，他孝顺并且体谅父母。父母答应实现愿望却没有做到，这时他没有大吵大闹，而且十分理解与体谅父母的难处，还买了新衬衫与新鞋子给父母。第二，他通过自己的努力一步一步实现不可能的任务，让自己从考试不超过40分到全班第一，这样决心与努力也值得我学习。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   HENRY PARK PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "HP-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "学校__禁止__学生在课室里用手机。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "jìn zǐ" }, { key: "2", text: "jìn zhǐ" }, { key: "3", text: "jìng zǐ" }, { key: "4", text: "jìng zhǐ" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "HP-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "小明喜欢在课间休息时和同学们__闲聊__。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "xián liáo" }, { key: "2", text: "xián liǎo" }, { key: "3", text: "xiǎn liáo" }, { key: "4", text: "xiǎn liǎo" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "HP-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "我常常到附近的小 ___ 中心吃午餐。",
        options: [{ key: "1", text: "反" }, { key: "2", text: "板" }, { key: "3", text: "贩" }, { key: "4", text: "饭" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "HP-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "根 ___ 天气预报，明天可能会下雨。",
        options: [{ key: "1", text: "聚" }, { key: "2", text: "据" }, { key: "3", text: "具" }, { key: "4", text: "距" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "HP-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "为了有 ___ 的睡眠，欢欢每天晚上八点就上床睡觉。",
        options: [{ key: "1", text: "丰富" }, { key: "2", text: "丰盛" }, { key: "3", text: "充实" }, { key: "4", text: "充足" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "HP-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "丽丽每天练习画画，希望能 ___ 美术老师的要求。",
        options: [{ key: "1", text: "获得" }, { key: "2", text: "拥有" }, { key: "3", text: "遵守" }, { key: "4", text: "达到" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "HP-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "运动对我们的健康有很大的__作用__。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "对人或事物产生影响" }, { key: "2", text: "事件发生的最后结果" }, { key: "3", text: "整件事情是如何发生" }, { key: "4", text: "让每个人有不同看法" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "HP-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "明华__积极__参加学校举办的各种活动。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "心中有着非常强烈的感觉" }, { key: "2", text: "自己相信自己能够做得到" }, { key: "3", text: "表现出热心和努力的行为" }, { key: "4", text: "做事只顾自己而不顾别人" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "HP-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "___ 我已经完成作业，可以陪你去看电影。",
        options: [{ key: "1", text: "如果" }, { key: "2", text: "即使" }, { key: "3", text: "为了" }, { key: "4", text: "反正" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "HP-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "___ 明天的天气好，我们就去海边玩耍。",
        options: [{ key: "1", text: "除了" }, { key: "2", text: "要是" }, { key: "3", text: "因为" }, { key: "4", text: "尽管" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "HP-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "小安被老师狠狠地批评后，___________ 。",
        options: [{ key: "1", text: "好不容易哇哇大哭" }, { key: "2", text: "便禁不住手舞足蹈" }, { key: "3", text: "一整天都沉默不语" }, { key: "4", text: "依依不舍地离开了" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "HP-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________ ，是个有孝心的好孩子。",
        options: [{ key: "1", text: "哥哥常在听写中得到满分" }, { key: "2", text: "明利睡觉前都会读一本书" }, { key: "3", text: "姐姐用存下的钱买礼物给妈妈" }, { key: "4", text: "小乐安静地等着爸爸接她回家" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "HP-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：交流)",
        options: [{ key: "1", text: "姐姐和妈妈交流，要在六月假期中到日本去游玩。" }, { key: "2", text: "弟弟新买的玩具坏了，他一定要和哥哥交流玩具。" }, { key: "3", text: "爸爸和手机进行交流后，让他学到了很多新知识。" }, { key: "4", text: "丽丽参加国外的学习活动，和各国学生进行交流。" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "HP-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：灵感)",
        options: [{ key: "1", text: "爸爸刷牙时突然有了灵感，决定下午去游泳。" }, { key: "2", text: "华强突然有了画画的灵感，立刻把画画出来。" }, { key: "3", text: "小红看了美食节目后，有灵感要吃红烧排骨。" }, { key: "4", text: "文明看着妈妈工作辛苦，心里禁不住有灵感。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "HP-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [4], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：无意间)",
        options: [{ key: "1", text: "小安打扫时，无意间发现一个藏在书架上的盒子。" }, { key: "2", text: "乐乐无意间跑得很快，结果赢了这次的短跑比赛。" }, { key: "3", text: "课室的桌椅很整齐，老师无意间表扬了全班同学。" }, { key: "4", text: "弟弟无意间的恶作剧，让妹妹难过地大哭了起来。" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  {
    groupId: "HP-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "热心的邻居", source: "老师自编",
      text: "现在的人住在一座座高楼里，多数的人却与邻居都 [Q16]___。但我很幸运有一个热心助人的邻居。\n\n有一次，我像往常一样放学回到家，但 [Q17]___ 我按多少次门铃，却都没有人开门。这时，我才想起：惨了！外婆去朋友的家，家里现在没人！\n\n不久，天色渐渐暗了下来，我在门前来来回回地走着。突然，一个身影走近，那人不是外婆，而是我的邻居——陈阿姨。我有些失望，心想：[Q18]___ 还要等多久，外婆才会回来啊？陈阿姨知道我的情况后，二话不说，便让我去她家等外婆。陈阿姨还请我在她家吃晚饭。\n\n[Q19]___ 她烧的菜不如外婆煮的美味，但我还是吃得很开心。陈阿姨还 [Q20]___ 给我夹菜，怕我没吃饱。\n\n我从这件事明白了“远亲不如近邻”的意思。我很感恩能有陈阿姨这样的好邻居。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "现在的人住在一座座高楼里，多数的人却与邻居都 ___ 。",
        options: [{ key: "1", text: "无精打采" }, { key: "2", text: "互不来往" }, { key: "3", text: "愁眉苦脸" }, { key: "4", text: "不顾一切" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "但 ___ 我按多少次门铃，却都没有人开门。",
        options: [{ key: "1", text: "凡是" }, { key: "2", text: "由于" }, { key: "3", text: "因此" }, { key: "4", text: "不管" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "我有些失望，心想：___ 还要等多久，外婆才会回来啊？",
        options: [{ key: "1", text: "不如" }, { key: "2", text: "是否" }, { key: "3", text: "到底" }, { key: "4", text: "明明" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "___ 她烧的菜不如外婆煮的美味，但我还是吃得很开心。",
        options: [{ key: "1", text: "果然" }, { key: "2", text: "虽然" }, { key: "3", text: "不然" }, { key: "4", text: "竟然" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "陈阿姨还 ___ 给我夹菜，怕我没吃饱。",
        options: [{ key: "1", text: "不时" }, { key: "2", text: "一向" }, { key: "3", text: "尽早" }, { key: "4", text: "每当" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "HP-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "别乱说话", source: "老师自编",
      text: "兴亮是一个可爱的男孩，但是他有一个坏习惯。\n\n一次，兴亮经过小美的座位，发现她正一边写字，一边看另一份相同的作业。他转身向周围的同学说：“原来小美的作业都是抄别人的！”坐在小美旁边的丽文听见了，就立刻对兴亮说：“不知道就不要乱说！”\n\n还有一次，在休息时，兴亮发现食堂的一个角落有一个小女孩在哭。站在小女孩面前的小美正怒气冲冲地瞪着小女孩。接着，兴亮跑去和朋友说：“平时看起来很安静的小美，原来喜欢欺负别人！”\n\n这些话传开后，同学们都在小美的背后指指点点，并渐渐地远离她。这让小美感到很难过。丽文看到了这一切，决定告诉老师。\n\n第二天，老师在班里问兴亮：“你知不知道你的行为对小美造成了多大的伤害？”兴亮却回答：“我亲眼看到小美在课室里抄别人的功课，也看到她在休息时欺负一个小女孩。”\n\n听到这儿，小美激动地说：“我那时是在抄丽文的笔记，因为我生病，好几天没来上学！而食堂的那个小女孩是我的妹妹，我很生气她在短短三天内弄丢了两个水瓶！你们什么都不知道就乱说话！”\n\n老师这时也看向其他同学，问道：“你们现在知道到处乱说话的后果了吗？”同学们听了都红着脸，低下了头。兴亮也恍然大悟，后悔之前对小美做的事……"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "兴亮的坏习惯是什么？",
        options: [{ key: "1", text: "他常常在空闲时找同学们说话。" }, { key: "2", text: "他喜欢躲在角落听别人说坏话。" }, { key: "3", text: "他没弄清楚情况就到处乱说话。" }, { key: "4", text: "他在老师的面前说朋友的坏话。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "为什么小美会怒气冲冲地瞪着小女孩？因为",
        options: [{ key: "1", text: "小女孩还没有向小美道歉。" }, { key: "2", text: "小女孩又弄丢了她的水瓶。" }, { key: "3", text: "小女孩在食堂的角落大哭。" }, { key: "4", text: "小女孩在休息时去找小美。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "为什么同学们都渐渐地远离小美？因为",
        options: [{ key: "1", text: "小美抄了别的同学的作业。" }, { key: "2", text: "小美爱欺负年纪小的同学。" }, { key: "3", text: "同学们以为小美是坏学生。" }, { key: "4", text: "同学们认为小美太安静了。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "文中“同学们都红着脸，低下了头”指的是什么？",
        options: [{ key: "1", text: "大家很生气，因为兴亮害大家都被老师批评了。" }, { key: "2", text: "大家很伤心，因为没有人能够回答老师的问题。" }, { key: "3", text: "大家很惭愧，因为他们之前的行为伤害了小美。" }, { key: "4", text: "大家很后悔，因为他们没有向老师报告整件事。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "丽文是一个怎样的人？",
        options: [{ key: "1", text: "见义勇为" }, { key: "2", text: "聪明能干" }, { key: "3", text: "做事非常小心" }, { key: "4", text: "懂得尊重别人" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "HP-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "你不用太紧张" }, { key: "2", text: "你在担心什么呢" }, { key: "3", text: "老师会骂我们吗" }, { key: "4", text: "我会觉得很难受的" }, { key: "5", text: "不像家里那么好吃" }, { key: "6", text: "但是我还是很想念" }, { key: "7", text: "我最爱吃盒饭里的食物哟" }, { key: "8", text: "但大家还是有足够的时间冲凉的" }],
    passage: {
      title: "露营", source: "老师自编",
      text: "小丽：小新，明天就要去露营了，我有点紧张……\n小新：露营很好玩的！[Q26]___？\n小丽：我从来没在外面睡过，担心睡不着。\n小新：我们白天有很多活动，晚上一定会累得躺下就睡着的。\n小丽：那就好。不过我听说露营期间我们吃的食物都是盒饭，[Q27]___。\n小新：虽然盒饭不一定适合每个人的口味，但一定是健康的！\n小丽：听说冲凉的时间很短，如果不够时间冲凉怎么办？流了汗不冲凉，[Q28]___。\n小新：我以前露营的时候，虽然时间短，[Q29]___。\n小丽：谢谢你，小新！听你这么说，我好像没那么紧张了。\n小新：五年级的露营活动机会难得，我们可不要错过哦！"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "小新：露营很好玩的！___？",
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "小丽：不过我听说露营期间我们吃的食物都是盒饭，___ 。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "小丽：流了汗不冲凉，___ 。",
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "小新：我以前露营的时候，虽然时间短，___ 。",
        correctKey: "8",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "HP-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "亲子同乐日", source: "老师自编 — 应用文/通告",
      text: "乐享健康・亲子同乐日\n\n您还在为周末的亲子活动发愁吗？欢乐民众俱乐部邀请您参加“乐享健康・亲子同乐日”活动！这次活动将在2025年10月28日（星期天）举办。希望本次健康日可以让民众享受和家人一起运动的乐趣。\n\n活动详情：\n\n【舞动亲子情】时间：8:00 AM – 9:30 AM。地点：民众俱乐部大礼堂。内容：跟随舞蹈老师学习简单又有趣的亲子舞蹈，享受音乐与跳舞的快乐！8岁以上儿童可自己参加哦！\n\n【活力健康行】时间：9:45 AM – 11:00 AM。地点：欢乐公园步道。要求：儿童需要家长陪伴。内容：在大自然中散步，呼吸新鲜空气，放松身心！\n\n【欢乐风筝赛】时间：11:15 AM – 1:00 PM。地点：欢乐公园广场。组别：儿童组（12岁以下）／亲子组（家长+儿童）／公开组（12岁以上）。内容：风筝飞得最高的前三名，将获得精美奖品！\n\n报名方式：请上网huanlecc.com报名。报名截止日期：10月15日。热线电话：如有任何疑问，请拨打热线6543 7890。\n\n欢乐民众俱乐部"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "“乐享健康・亲子同乐日”的活动目的是什么？",
        options: [{ key: "1", text: "让民众都能收到精美的奖品。" }, { key: "2", text: "让民众享受音乐带来的快乐。" }, { key: "3", text: "让民众有机会和家人一起运动。" }, { key: "4", text: "让民众有机会和家人放松身心。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "下面哪个活动儿童必须要家长陪伴？",
        options: [{ key: "1", text: "舞动亲子情" }, { key: "2", text: "活力健康行" }, { key: "3", text: "欢乐风筝赛" }, { key: "4", text: "所有的活动" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一句话是不正确的？",
        options: [{ key: "1", text: "“舞动亲子情”是室内活动。" }, { key: "2", text: "“活力健康行”在上午举行。" }, { key: "3", text: "“欢乐风筝赛”只能儿童参加。" }, { key: "4", text: "如果有疑问可以拨打热线电话。" }],
        correctKey: "3",
        answerSource: "official",
        notes: "这一句是错的——风筝赛也有亲子组和公开组"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "你的朋友小安很喜欢和父母一起放风筝。看了这则通告，请发一条短信给他，告诉他可以参加的活动和原因，并告诉他报名的方法和要注意的事。",
        context: "开头已给出：“亲爱的小安，我看到一则通告，关于‘乐享健康，亲子同乐日’。我觉得你会有兴趣参加……”\n评分标准：内容 /2分，表达 /2分（扣分项：病句、错别字、标点符号错误、词语搭配错误），总分 /4分。",
        displayAnswer: "亲爱的小安，我看到一则通告，关于“乐享健康，亲子同乐日”。我觉得你会有兴趣参加，因为你很喜欢和你的爸爸妈妈一起放风筝。活动会在学校的操场进行。你们要带自己的风筝就可以了。记得注意安全，别跑太快，也要留意周围的人。",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。"
      }
    ]
  },

  {
    groupId: "HP-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "小乌龟爬山", source: "老师自编",
      text: "在一片美丽的森林里，有一座山，山脚下住着一只小乌龟。它有个梦想，就是爬上山顶，从那里看看森林的美景。\n\n它把想法告诉朋友们。小猴嘲笑道：“你动作那么慢，要爬到什么时候？”小兔也摇摇头说：“山太高了，你是做不到的。”小乌龟什么也没说，心想：我一定要爬上山顶给你们看！\n\n第二天，小乌龟信心满满地出发了。可是很快的，第一个困难来了——路上一块巨石让它过不去。它试着爬过去，可是石头太滑了，每次刚爬到一半，就滑了下来。这时，一只小鸟飞过来劝它：“算了吧，你爬不过去的。”小乌龟依然没有说话，它决定慢慢地绕过石头，继续前进。\n\n走着走着，天色暗了下来，不一会儿大雨倾盆而下。小乌龟小心翼翼地前进，可一不小心，还是跌倒了。它的身上一阵疼痛，心想：也许，我真的做不到……\n\n就在这时，它看到一只小蚂蚁努力搬着食物，吃力地往前走。小乌龟好奇地问：“这么重的东西，你不累吗？”小蚂蚁喘着气说：“当然累啊，但如果我现在停下，之前付出的努力不就白费了？”说完，它又向前爬。小乌龟沉默了一下，咬紧牙关，然后再慢慢往上爬。\n\n时间一分一秒地过去，山顶越来越近了。然而，最后一段路特别难走，小乌龟的腿已经快要抬不起来了。它看着不远处的山顶，想起了那只努力搬食物的小蚂蚁。它深吸一口气，拼尽最后的力气，一步一步地向上爬去。\n\n终于，它到达了山顶。夕阳的金光洒满森林，它看到了一片从来都没见过的美丽景色。它没有大声欢呼，而是安静地看着远方，嘴角露出了微笑。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中形容“用看不起别人的语气笑话别人”的词语是 ___ 。",
        accepted: ["嘲笑"],
        displayAnswer: "嘲笑",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中形容“情况没有改变，还是和原来一样”的词语是 ___ 。",
        accepted: ["依然"],
        displayAnswer: "依然",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 2, format: "Long-Answer",
        text: "小乌龟有什么梦想？",
        displayAnswer: "小乌龟要爬上山顶，从那里看看森林的美景。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "知道小乌龟的梦想后，小猴和小兔各有什么反应？",
        displayAnswer: "知道小乌龟的梦想后，小猴子嘲笑小乌龟的动作那么慢，要爬到什么时候。小兔也摇摇头说山太高了，小乌龟是做不到的。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "小乌龟遇到的第一个困难是什么 (1分)？它接着是怎么做的 (3分)？",
        displayAnswer: "小乌龟遇到的第一个困难是路上一块巨石让它过不去。它接着试着爬过去，可是石头太滑了，爬到一半，就滑了下来。它慢慢地绕过石头继续前进。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 4, format: "Long-Answer",
        text: "最后一段路小乌龟很累了，为什么它还是拼尽力气向上爬？",
        displayAnswer: "因为它看着不远处的山顶，想起了那只努力搬食物的小蚂蚁。它深吸一口气，用尽最后的力气，所以最后一段小路小乌龟很累了，它还是用尽力气向上爬。小蚂蚁告诉它如果现在停下，之前的努力就白费了。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "你觉得小乌龟是个怎样的动物？从哪里可以看出？",
        displayAnswer: "我觉得小乌龟是个遇到困难不放弃的动物，小乌龟想要爬上山顶看美景，但它没有放弃，而是努力坚持下去，最后爬到山顶看到了美景。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   MAHA BODHI SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "MB-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "陈阿姨很__善良__，总是帮助身边的人。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "shàn liáng" }, { key: "2", text: "shàn liǎng" }, { key: "3", text: "shàng liáng" }, { key: "4", text: "shàng liǎng" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "MB-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "小月经常生病，而且身体也很__瘦弱__。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "shōu luò" }, { key: "2", text: "shòu luò" }, { key: "3", text: "shōu ruò" }, { key: "4", text: "shòu ruò" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "MB-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "那些树枝上有尖尖的 ___ ，妈妈要我小心点儿。",
        options: [{ key: "1", text: "刺" }, { key: "2", text: "利" }, { key: "3", text: "刷" }, { key: "4", text: "刻" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "MB-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "我们在家里举办了一场 ___ 会，请了许多朋友。",
        options: [{ key: "1", text: "距" }, { key: "2", text: "俱" }, { key: "3", text: "剧" }, { key: "4", text: "聚" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "MB-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "外婆很 ___ ，常常准备好吃的食物和邻居们分享。",
        options: [{ key: "1", text: "热烈" }, { key: "2", text: "配合" }, { key: "3", text: "慷慨" }, { key: "4", text: "优秀" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "MB-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "如果你想参加比赛，就要 ___ 告诉老师。",
        options: [{ key: "1", text: "尽早" }, { key: "2", text: "纷纷" }, { key: "3", text: "大概" }, { key: "4", text: "连声" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "MB-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "有了家人们的鼓励，小丽很快就__恢复__了自信。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "变成原来的样子" }, { key: "2", text: "变成更好的样子" }, { key: "3", text: "变成更差的样子" }, { key: "4", text: "变成以后的样子" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "MB-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "战斗机从空中飞过，__一眨眼__就不见了。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "动作迅速" }, { key: "2", text: "睁大眼睛" }, { key: "3", text: "感到惊讶" }, { key: "4", text: "时间很短" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "MB-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "___ 这位作家写的书，我都看过。",
        options: [{ key: "1", text: "为了" }, { key: "2", text: "假如" }, { key: "3", text: "凡是" }, { key: "4", text: "尽管" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "MB-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "打乒乓球 ___ 好玩，___ 能让身体更强壮。",
        options: [{ key: "1", text: "如果……就" }, { key: "2", text: "不仅……还" }, { key: "3", text: "虽然……但" }, { key: "4", text: "不管……都" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "MB-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "哥哥才运动了一会儿，___________ 。",
        options: [{ key: "1", text: "放松了不少" }, { key: "2", text: "就累得直喘气" }, { key: "3", text: "跑了一圈又一圈" }, { key: "4", text: "身体变得非常健康" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "MB-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________ ，爷爷的笑脸就浮现在我的脑海里。",
        options: [{ key: "1", text: "妹妹画了一幅画" }, { key: "2", text: "刚戴上新的眼镜" }, { key: "3", text: "电脑连上网络后" }, { key: "4", text: "一说起这件往事" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "MB-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：产生)",
        options: [{ key: "1", text: "才过了几天，妹妹种的绿豆就产生了豆芽。" }, { key: "2", text: "一场大雨后，天空中产生了一道美丽的彩虹。" }, { key: "3", text: "听了王老师讲的故事，文文对历史产生了兴趣。" }, { key: "4", text: "老师提出了一个问题，产生了同学们积极的讨论。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "MB-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：自豪)",
        options: [{ key: "1", text: "能够为学校争光，小乐感到十分自豪。" }, { key: "2", text: "小美是一个自豪的人，经常看不起我们。" }, { key: "3", text: "哥哥演讲时总是充满自豪，从来不会紧张。" }, { key: "4", text: "立明什么都没准备就上台表演，太自豪了。" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "MB-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [5], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：温柔)",
        options: [{ key: "1", text: "奶奶给我穿上外套后，感觉温柔多了。" }, { key: "2", text: "姑姑看到姐姐很难过，就温柔地安慰她。" }, { key: "3", text: "这个饭盒能温柔，到了中午饭菜还是热的。" }, { key: "4", text: "最近几天的温柔上升，大家都躲在冷气房里。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  {
    groupId: "MB-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "好朋友", source: "老师自拟",
      text: "小云和小玉是邻居，也是同班同学。每天早上，[Q16]___7点，她们就会在家楼下等对方，然后一起上学。放学后，她们也会一起回家。\n\n小云最喜欢中午的时光，因为小玉的妈妈总会为她们准备美味的午餐。这天中午，午餐特别 [Q17]___，有炒饭、煎鸡蛋、排骨，还有青菜和萝卜汤。她们看着眼前的饭菜，眼睛闪闪发亮，口水都要流出来了。\n\n一天早上，小玉在楼下等了十五分钟，依然不见小云的 [Q18]___。小玉跑到小云的家一看，才发现原来小云发高烧了。“别担心，你好好休息，我会帮你把作业带回来的。”小玉轻声说。\n\n放学后，小玉去小云家，耐心地教她写作业。看着好朋友对自己这么好，小云的心里暖暖的，也更加 [Q19]___ 这份友谊。她 [Q20]___ 着自己快点好起来，就能和小玉一起上学、一起吃午餐了。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "每天早上，___ 7点，她们就会在家楼下等对方。",
        options: [{ key: "1", text: "基本" }, { key: "2", text: "大约" }, { key: "3", text: "刚巧" }, { key: "4", text: "每隔" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "这天中午，午餐特别 ___ 。",
        options: [{ key: "1", text: "丰盛" }, { key: "2", text: "贵重" }, { key: "3", text: "优美" }, { key: "4", text: "仔细" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "小玉在楼下等了十五分钟，依然不见小云的 ___ 。",
        options: [{ key: "1", text: "回答" }, { key: "2", text: "消息" }, { key: "3", text: "身影" }, { key: "4", text: "到达" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "小云的心里暖暖的，也更加 ___ 这份友谊。",
        options: [{ key: "1", text: "增添" }, { key: "2", text: "欣赏" }, { key: "3", text: "珍惜" }, { key: "4", text: "承认" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "她 ___ 着自己快点好起来。",
        options: [{ key: "1", text: "鼓励" }, { key: "2", text: "祝福" }, { key: "3", text: "安慰" }, { key: "4", text: "盼望" }],
        correctKey: "4",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "MB-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "邻居的手电筒", source: "改编自《小孩的心》",
      text: "我刚搬进新家，跟周围的人都不太认识。每天下班回家，我总会看到邻居家的孩子在楼下玩耍。他们常常穿着破旧的校服，在空地上追跑打闹，笑声和吵闹声连楼上的邻居都能听得一清二楚。我皱了皱眉头，心里想：这么吵，也太不为别人着想了！衣服已经那么旧了，还在穿，不觉得难为情吗？我关上窗，告诉自己不要理他们。\n\n一天晚上，突然打雷，接着下起了大雨。不一会儿，整座组屋就停电了。房间里一下子变得黑暗。我有点害怕，立刻找出手电筒，这才安心多了。\n\n这时，门外突然传来敲门声，把我吓了一跳。打开门一看，原来是邻居的小孩。他慌慌张张地问道：“阿姨，您有手电筒吗？”我心想：果然是穷得连手电筒也买不起……“没有！”我不耐烦地摇摇头，急忙把门关上。“阿姨！阿姨！”男孩又开始敲门。我叹了一口气，用力地把门再次打开，并大喊：“去找别人借！”只见小男孩从口袋里拿出手电筒，递给我，说：“妈妈说您一个人住，怕您会害怕，叫我送手电筒来给您。”我顿时大吃一惊，脸也红了。“谢谢你！”我接过手电筒，感动地说，“阿姨刚才还以为……对……不起。”小男孩笑了笑，说：“没关系，我们是邻居！互相关心是应该的啊！”\n\n那晚，手电筒的光虽然很弱，却像太阳一样照亮了我的心。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "一开始，作者对邻居家的孩子有什么看法？",
        options: [{ key: "1", text: "喜欢吵闹，衣服很旧。" }, { key: "2", text: "有礼貌，会关心邻居。" }, { key: "3", text: "很穷，喜欢向人借东西。" }, { key: "4", text: "爱玩，邻居都不想理他们。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "什么事让作者感到害怕？",
        options: [{ key: "1", text: "突然听见敲门的声音。" }, { key: "2", text: "找不到家里的手电筒。" }, { key: "3", text: "打雷后整座组屋受了影响。" }, { key: "4", text: "停电后的屋子里非常黑暗。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "为什么作者急着把门关上？",
        options: [{ key: "1", text: "不太认识这个小男孩。" }, { key: "2", text: "被小男孩吓了一大跳。" }, { key: "3", text: "不想用小男孩家的手电筒。" }, { key: "4", text: "认为小男孩是来借手电筒的。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "听了小男孩的话，作者的脸为什么红了？",
        options: [{ key: "1", text: "她对小男孩说了一个谎。" }, { key: "2", text: "她发现刚才的想法不对。" }, { key: "3", text: "她不想把手电筒借给男孩。" }, { key: "4", text: "她没想到小男孩很有礼貌。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "文中“像太阳一样照亮了我的心”说明了什么？",
        options: [{ key: "1", text: "作者希望太阳光照进屋子里。" }, { key: "2", text: "手电筒可以照亮作者的屋子。" }, { key: "3", text: "邻居的关心让作者感到温暖。" }, { key: "4", text: "作者害怕停电的时候的感觉。" }],
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "MB-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "安全最重要" }, { key: "2", text: "的确很不方便" }, { key: "3", text: "我要打电话报警" }, { key: "4", text: "这里离巴士站很远" }, { key: "5", text: "我们家附近没有坡道" }, { key: "6", text: "可是他们都听不进去" }, { key: "7", text: "他们完全不懂得礼让" }, { key: "8", text: "邻居之间应该互相理解才对" }],
    passage: {
      title: "林爷爷搬家", source: "老师自拟",
      text: "美美：林爷爷，听说您要搬家了？\n林爷爷：是啊，我和太太的年纪越来越大了，觉得这一区已经不适合我们居住了。\n美美：您为什么会这么说呢？\n林爷爷：你看看，[Q26]___，所以每次从巴刹买菜回来的时候，我们需要提着大包小包的东西爬上楼梯，没办法使用推车。\n美美：对年纪大的居民来说，[Q27]___。\n林爷爷：还有更让人头疼的！最近搬来了不少年轻人，每到周末他们就玩到很晚，音乐也开得很大声。我们没办法好好休息。我提醒了好几次，[Q28]___。\n美美：这些人真不为别人着想！[Q29]___。\n林爷爷：是啊，希望我们搬到新环境后能住得更舒适。"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "林爷爷：你看看，___ ，所以每次从巴刹买菜回来的时候，我们需要提着大包小包的东西爬上楼梯，没办法使用推车。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "美美：对年纪大的居民来说，___ 。",
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "林爷爷：我提醒了好几次，___ 。",
        correctKey: "6",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "美美：这些人真不为别人着想！___ 。",
        correctKey: "8",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "MB-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "中秋晚会", source: "老师自拟 — 应用文/通告",
      text: "中秋晚会 2025\n\n为了介绍华族文化，一年一度的中秋晚会又来了！这将更加丰富居民的生活。\n\n活动详情如下：9月22日（星期六）／晚上7时到9时／乌美1街大牌220前的公园\n\n活动安排：文化部长讲话／中秋美食展（超过20个摊位）／设计灯笼（每个灯笼的材料费2元，请自备剪刀）／歌舞表演（由欢乐歌舞团呈献）／抽奖活动（奖品由物美公司提供）\n\n中秋晚会的收费是每人5元（儿童和60岁以上的老人免费）。有兴趣者，请到俱乐部的办公室报名。如果要参加设计灯笼的活动，必须在活动当天下午4点前报名。查问详情，请拨打电话66345678或上新华俱乐部的网站www.xinhua.com.sg。"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "举办“中秋晚会”的目的是什么？",
        options: [{ key: "1", text: "观看歌舞表演。" }, { key: "2", text: "介绍华族文化。" }, { key: "3", text: "品尝中秋美食。" }, { key: "4", text: "学会制作灯笼。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "哪些人参加这个活动不需要付钱？",
        options: [{ key: "1", text: "孩子和老年人。" }, { key: "2", text: "所有报名的人。" }, { key: "3", text: "父母和他们的孩子。" }, { key: "4", text: "俱乐部的所有会员。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一项不是通告所提到的？",
        options: [{ key: "1", text: "只要报名就可以参加活动。" }, { key: "2", text: "中秋晚会每年只举行一次。" }, { key: "3", text: "参加中秋晚会有机会获得奖品。" }, { key: "4", text: "报名者可获得一个精美的灯笼。" }],
        correctKey: "4",
        answerSource: "official",
        notes: "通告只提到设计灯笼需付2元材料费，没有说报名者可免费获得灯笼"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "如果你是明华，你知道妈妈很喜欢做手工，试写一则短信给妈妈，向她提议可以参加哪一个活动，并告诉她参加这个活动要注意些什么。",
        context: "开头已给出：“妈妈：新华民众俱乐部将举办‘中秋晚会’活动，我知道您喜欢做手工，……”\n评分标准：内容 /2分，表达 /2分（扣分项：病句、错别字、标点符号错误、词语搭配错误），总分 /4分。",
        displayAnswer: "妈妈：新华民众俱乐部将举行“中秋晚会”活动，我知道您喜欢做手工，所以我建议您参加设计灯笼这个活动。参加时要注意灯笼的材料费是2元，并且请自备剪刀。另外，记得必须在活动当天下午4点前报名。",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。"
      }
    ]
  },

  {
    groupId: "MB-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "新朋友", source: "老师自拟",
      text: "小明七岁那年，父母要出国工作，就把小明从乡下送到住在城里的叔叔家住。刚开始，他好开心，觉得大城市里有宽阔的马路和高大的楼房，真好啊！接下来的几天，每当看到楼下的一群孩子玩得热闹时，小明也曾试着加入他们的队伍，可每一次他都会被周围的大人赶出去：“去，去，哪里来的脏孩子！”这让他心里酸酸的，感到闷闷不乐。\n\n一天下午，小明坐在门口，目不转睛地看着不远处一个小男孩和他的妈妈打羽毛球，他真想和他们一起玩呀！忽然，小孩子用力一挥球拍，球向小明飞了过来，最后落在了他的脚旁。小明很快伸出了手，但又马上收了回来。他怕之前的事情再次发生。“小朋友，帮阿姨捡一下羽毛球好吗？”那位阿姨望着他，大声说道。小明没说话，将球捡起来送到阿姨的手里。阿姨接过羽毛球后，说：“一起来玩好吗？”小明听了，一下子呆住了，接着，眼睛亮了起来，拼命地点头。阿姨将球拍交到他的手里，让他和小男孩一起打球。\n\n就这样，小明认识了王阿姨和她的儿子乐乐。很快，他就和乐乐成了好朋友，一有时间，他们就在一起玩。\n\n而对小明来说，最幸福的事情还是和王阿姨一起出去玩。出门在外，每当过马路的时候，王阿姨总是一只手拉着乐乐，另一只手拉着小明。一过了马路，乐乐就松开手，跑向前去。可小明却舍不得松手。王阿姨的手，让他感到十分温暖，让他的心里总是充满了被人关怀、疼爱的快乐。\n\n两年之后，小明的爸妈回国了，决定带着他重新回到乡下生活，小明只好依依不舍地告别了亲爱的乐乐与王阿姨。他的心里，充满了对王阿姨的感激，感谢她给了自己一只温暖的手。而在未来的日子里，他要做的就是将这份温暖传递下去。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中形容“注意力集中，专心地看着”的词语是 ___ 。",
        accepted: ["目不转睛"],
        displayAnswer: "目不转睛",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中形容“舍不得分离”的词语是 ___ 。",
        accepted: ["依依不舍"],
        displayAnswer: "依依不舍",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 4, format: "Long-Answer",
        text: "小明刚来到大城市和几天后，他心里的感受有什么变化 (2分)？为什么 (2分)？",
        displayAnswer: "小明刚开始很开心，觉得大城市有宽阔的马路和高大的楼房。接下来几天，每当他看到一群孩子们在楼下玩的热闹时，他想试着加入他们，可是都被周围的大人赶出去说他是脏孩子，让他心里酸酸的，感到闷闷不乐。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "阿姨叫小明一起打球，小明有什么反应 (1分)？他当时有什么感受 (1分)？为什么 (2分)？",
        displayAnswer: "小明听了，一下子呆住了，接着，眼睛亮了起来，拼命地点头。他当时感到很开心，因为他很想打羽毛球，终于有朋友要和他一起玩了。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 3, format: "Long-Answer",
        text: "过马路后，乐乐跑向前，小明是怎么做的 (1分)？为什么 (2分)？",
        displayAnswer: "小明舍不得松手，因为王阿姨的手，让他感到十分温暖，让他的心里总是充满了被人关怀、疼爱的快乐。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 3, format: "Long-Answer",
        text: "王阿姨是个怎样的人 (1分)？从哪里可以看出 (2分)？",
        displayAnswer: "王阿姨是个心地善良的人。每当她带着小明和乐乐出门在外，过马路的时候，王阿姨总会一只手拉着乐乐，另一只手拉着小明，可以看出来。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "你认为小明为什么要将这份温暖传递下去 (2分)？如果你是小明，你以后会怎样对待别人？请举例说明 (2分)。",
        displayAnswer: "因为是王阿姨给了他一只温暖的手，在他无助的时候唯有王阿姨不会看不起他，觉得他脏。小明很对王阿姨充满了感激。如果我是小明，我会把王阿姨给予我的爱传下去，例如帮助有需要的人让他们也感受到爱。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   NANYANG PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "NY-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "哥哥穿着新买的__衬衫__，看起来很神气。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "chén sān" }, { key: "2", text: "chèn shān" }, { key: "3", text: "chéng sān" }, { key: "4", text: "chèng shān" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NY-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "如果你找到小狗，请尽快__联系__我。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "nián xí" }, { key: "2", text: "nián xì" }, { key: "3", text: "lián xí" }, { key: "4", text: "lián xì" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NY-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "妈妈劝姐姐要早睡早起，但她 ___ 不听。",
        options: [{ key: "1", text: "扁" }, { key: "2", text: "偏" }, { key: "3", text: "遍" }, { key: "4", text: "编" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NY-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "我们在沙滩上玩闹，留下了一串串的足 ___ 。",
        options: [{ key: "1", text: "计" }, { key: "2", text: "基" }, { key: "3", text: "纪" }, { key: "4", text: "迹" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NY-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "无论考得多好，你都不应该 ___ 成绩比你差的人。",
        options: [{ key: "1", text: "担心" }, { key: "2", text: "唠叨" }, { key: "3", text: "嘲笑" }, { key: "4", text: "怀疑" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NY-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "自从去英国游玩后，表哥就 ___ 了搬到那儿居住的想法。",
        options: [{ key: "1", text: "增添" }, { key: "2", text: "露出" }, { key: "3", text: "构成" }, { key: "4", text: "产生" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NY-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "如果你们在__宽阔__的操场上踢球，就不会发生意外了。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "空间很大" }, { key: "2", text: "数量变多" }, { key: "3", text: "连续不断" }, { key: "4", text: "没有限制" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "NY-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "为了参加全国讲故事比赛，同学们都__积极__训练。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "快速地解决问题" }, { key: "2", text: "耐心地完成任务" }, { key: "3", text: "努力把事情做好" }, { key: "4", text: "认真考取好成绩" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NY-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "他 ___ 随便作答，___ 仔细地读每一道题目。",
        options: [{ key: "1", text: "就算……还是" }, { key: "2", text: "不是……而是" }, { key: "3", text: "因为……所以" }, { key: "4", text: "不仅……而且" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NY-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "___ 五岁以下的孩童，___ 可以免费入场。",
        options: [{ key: "1", text: "既然……就" }, { key: "2", text: "除了……还" }, { key: "3", text: "虽然……却" }, { key: "4", text: "凡是……都" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NY-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "他回到家时全身湿透了，___________ 。",
        options: [{ key: "1", text: "妈妈一直不停地观察着他" }, { key: "2", text: "实际上刚刚才恢复了健康" }, { key: "3", text: "偏偏今天早上忘记带雨伞" }, { key: "4", text: "不久后额头就微微地发烫" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "NY-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________ ，我感到无比自豪。",
        options: [{ key: "1", text: "看到别人需要帮助" }, { key: "2", text: "演讲比赛准时开始了" }, { key: "3", text: "被选中代表全校参与比赛" }, { key: "4", text: "因为得到了偶像的签名照片" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "NY-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：培育)",
        options: [{ key: "1", text: "我和小松从小就认识，培育了很深厚的友情。" }, { key: "2", text: "奶奶很好学，最近又报名参加了电脑培育班。" }, { key: "3", text: "老师要我从小培育好习惯，成为一个有用的人。" }, { key: "4", text: "父母辛勤地培育我们，我们长大后要记得报恩。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "NY-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：详细)",
        options: [{ key: "1", text: "他做事一向很详细，通常不会出现错误。" }, { key: "2", text: "护士很详细地照顾爷爷，我们很感谢她。" }, { key: "3", text: "年终考试前，我制定了详细的学习计划。" }, { key: "4", text: "在做出任何决定前，我必须先详细思考。" }],
        correctKey: "4",
        answerSource: "official",
        notes: "官方答案选(4)；(3)\"详细的学习计划\"是常见搭配，乍看也很自然，但以官方答案卷为准。"
      }] },

  { groupId: "NY-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [6], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：坚固)",
        options: [{ key: "1", text: "无论困难有多大，也改变不了我坚固的意志。" }, { key: "2", text: "这座木桥建成已有很多年了，但依然很坚固。" }, { key: "3", text: "我们要时常复习功课，坚固我们所学的知识。" }, { key: "4", text: "由于经常做运动，我的身体变得更加坚固了。" }],
        correctKey: "4",
        answerSource: "official",
        notes: "官方答案选(4)；(2)\"木桥……很坚固\"是常见搭配，乍看也很自然，但以官方答案卷为准。"
      }] },

  {
    groupId: "NY-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "妈妈的提醒", source: "老师自拟",
      text: "丽文六年级毕业后，考进了体育学校。这是她第一次离开父母，和同学们住在一起。离开家之前，为了 [Q16]___ 她和同学们争吵，妈妈不断地提醒她要多为别人着想，但丽文总是回答：\"别管我，我已经长大了，知道怎么做！\"\n\n上学后，她认识了很多新朋友，大家一起玩，一起训练，生活过得既 [Q17]___ 又开心。渐渐地，同学发现丽文时常不顾他人的感受，对她这种自私的行为很不满，便纷纷与她 [Q18]___ 距离。\n\n丽文这才开始思考妈妈之前说过的话，她 [Q19]___ 明白妈妈是为了她好。丽文感到很惭愧，知道自己以前没有真正理解妈妈的心意。想到这里，她的视线开始 [Q20]___ 了，眼泪不由自主地流了下来。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "离开家之前，为了 ___ 她和同学们争吵，妈妈不断地提醒她要多为别人着想。",
        options: [{ key: "1", text: "禁止" }, { key: "2", text: "停止" }, { key: "3", text: "阻止" }, { key: "4", text: "防止" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "上学后，她认识了很多新朋友，生活过得既 ___ 又开心。",
        options: [{ key: "1", text: "充足" }, { key: "2", text: "充实" }, { key: "3", text: "充分" }, { key: "4", text: "充满" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "同学们对她这种自私的行为很不满，便纷纷与她 ___ 距离。",
        options: [{ key: "1", text: "保持" }, { key: "2", text: "避开" }, { key: "3", text: "减少" }, { key: "4", text: "制造" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "丽文这才开始思考妈妈之前说过的话，她 ___ 明白妈妈是为了她好。",
        options: [{ key: "1", text: "曾经" }, { key: "2", text: "终于" }, { key: "3", text: "此后" }, { key: "4", text: "永远" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "想到这里，她的视线开始 ___ 了，眼泪不由自主地流了下来。",
        options: [{ key: "1", text: "昏暗" }, { key: "2", text: "模糊" }, { key: "3", text: "劳累" }, { key: "4", text: "下降" }],
        correctKey: "2",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NY-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "诚实面对错误", source: "老师自拟",
      text: "明文今年刚加入童子军，他一直希望能在大家面前证明自己的能力。有一回，童子军举办了一项捐钱活动，帮助学校里家庭困难的同学。明文觉得这是一个表现自己的好机会，想交出一份亮眼的成绩单。\n\n回到家后，他认真练习如何向别人介绍捐钱活动，父母被他的认真打动，捐出了钱。拿到第一笔钱后，明文便开开心心地去找邻居捐钱。\n\n然而，当明文按下王叔叔家的门铃时，王叔叔正要出门去工作，就不耐烦地对他摆了摆手，他只好失望地离开了。接着，他在小区里转了几圈，却始终不敢向邻居开口，因为他害怕又被拒绝。\n\n最终，明文闷闷不乐地回到家，看到信封里只有那么一点儿钱，心里很难受。他不想在大家面前丢脸，便从钱包取出一些零花钱塞进信封，并在卡片上写了好几个\"捐钱者\"的名字。\n\n第二天，当他把信封交给老师时，心里很不安。老师看出他很紧张，便把他带到一旁。明文结结巴巴地承认了错误。\n\n老师温和地说：\"明文，捐钱活动的意义不在于收到多少钱，而是让我们学会勇敢、关心他人、传递善意。但我很高兴你愿意承认错误。\"\n\n听了老师的话，明文心里一震，脸红着点点头。放学后，他决定重新尝试。这一次，他不再想着\"出风头\"，而是认真向邻居们说明活动的意义。\n\n后来，许多邻居都捐了钱。当明文再次把钱交给老师时，他放下了心中的大石……"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "童子军举办这次捐钱活动的目的是什么？",
        options: [{ key: "1", text: "给学生表现自己的机会。" }, { key: "2", text: "让学生取得亮眼的成绩。" }, { key: "3", text: "让学生帮助和关心他人。" }, { key: "4", text: "使学生明白诚实的可贵。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "明文在小区转了几圈后，为什么没有向邻居开口？",
        options: [{ key: "1", text: "他觉得邻居都很忙。" }, { key: "2", text: "他害怕邻居拒绝他。" }, { key: "3", text: "他不想给邻居添麻烦。" }, { key: "4", text: "他不愿意让邻居帮忙。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "明文从小区回到家后，做了什么决定？",
        options: [{ key: "1", text: "他决定不再做任何努力。" }, { key: "2", text: "他把自己的钱放进信封。" }, { key: "3", text: "他将所有的钱都捐出去。" }, { key: "4", text: "他勇敢向老师承认错误。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "明文在卡片上写上了几个\"捐钱者\"的名字，说明了什么？",
        options: [{ key: "1", text: "他想要证明自己是一个很有爱心的人。" }, { key: "2", text: "他想要让这次的捐钱活动变得有意义。" }, { key: "3", text: "他想要帮助邻居完成这次的捐钱任务。" }, { key: "4", text: "他想要假装自己已经找到不少人捐钱。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "这次的捐钱活动对明文有什么影响？",
        options: [{ key: "1", text: "他明白了只有捐钱才能够帮助有困难的家庭。" }, { key: "2", text: "他感受到只要放下心中的大石才能取得成功。" }, { key: "3", text: "他学会了诚实，并明白捐钱活动的真正意义。" }, { key: "4", text: "他体会到邻居工作非常辛苦，不再\"出风头\"。" }],
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NY-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "我画的是民众俱乐部" }, { key: "2", text: "希望这些海报能起作用" }, { key: "3", text: "警告公众不讲卫生是会被抓的" }, { key: "4", text: "你将通过什么方法提醒食客呢" }, { key: "5", text: "正在为附近的小贩中心设计海报" }, { key: "6", text: "民众俱乐部对海报有什么要求呢" }, { key: "7", text: "有些公众怀疑这些海报是否有效" }, { key: "8", text: "提醒大家注意小贩中心的清洁人人有责" }],
    passage: {
      title: "海报设计比赛", source: "老师自拟",
      text: "安安：小乐，你在画什么呢？\n小乐：我参加了民众俱乐部举办的海报设计比赛，[Q26]___。\n安安：哦！你那么有画画天分，肯定能获奖。\n小乐：谢谢你的鼓励。\n安安：[Q27]___？\n小乐：民众俱乐部将会把获奖的海报贴在小贩中心，[Q28]___。因此，设计必须使大家明白公共卫生的重要，例如归还碗盘、注意公厕卫生等。\n安安：我认为这次的海报设计比赛太有意义了！[Q29]___，让大家更加自觉地为环境尽一份力。\n小乐：是的！海报设计好后，再让你看看！"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "小乐：我参加了民众俱乐部举办的海报设计比赛，___ 。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "安安：___ ？",
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "小乐：民众俱乐部将会把获奖的海报贴在小贩中心，___ 。因此，设计必须使大家明白公共卫生的重要。",
        correctKey: "8",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "安安：我认为这次的海报设计比赛太有意义了！___ ，让大家更加自觉地为环境尽一份力。",
        correctKey: "2",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "NY-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "欢乐阅读周", source: "老师自拟 — 应用文/通告",
      text: "欢乐阅读周\n\n为了引起学生阅读华文书的兴趣，本校将在阅读周推出许多有趣的阅读活动，欢迎各年级的同学积极参与！以下是其中三个活动：\n\n【读书会】老师们将用华语为大家介绍世界各国的著名绘本，并安排各种有趣的读后活动，等着大家参与哦！日期：10月3日至10月7日／时间：一二三年级的休息时间／地点：学校图书馆\n\n【本地知名作家阿福分享会】阿福老师将来到校园与大家见面！他将分享自己的写作心得，并指导同学们写小故事。详情--日期：10月5日（星期三）／时间：下午2点半至4点半／地点：学校图书馆\n注意事项：1）仅限前30位报名的六年级学生参加。请通过电邮linshuxiang@huanlepri.com向林书香老师报名。2）所有参加者将获得一本阿福老师亲笔签名的新书《狮城60载》。\n\n【书中人物服装秀】孙悟空、花木兰、哈利波特、小红帽……你最想扮演哪位书中人物呢？日期：10月6日（星期四）／时间：各年级的周会时间／地点：学校礼堂\n注意事项：有兴趣的同学请在当天装扮成你最喜欢的书中人物，你将有机会上台拍照，并获得一份小礼物！"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "学校举办\"欢乐阅读周\"的主要目的是什么？",
        options: [{ key: "1", text: "提高学生写华文故事的能力。" }, { key: "2", text: "鼓励学生积极参加各种活动。" }, { key: "3", text: "引起学生阅读华文书的兴趣。" }, { key: "4", text: "介绍新加坡的知名作家阿福。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "低年级学生不能参加哪个阅读活动？",
        options: [{ key: "1", text: "绘本读后活动。" }, { key: "2", text: "装扮故事人物。" }, { key: "3", text: "阿福的分享会。" }, { key: "4", text: "听老师讲故事。" }],
        correctKey: "3",
        answerSource: "official",
        notes: "阿福分享会仅限前30位报名的六年级学生参加，低年级学生无法参与。"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？",
        options: [{ key: "1", text: "学生可以装扮成任何书中人物。" }, { key: "2", text: "阅读活动仅有三个有趣的活动。" }, { key: "3", text: "老师们将以各国语言讲绘本故事。" }, { key: "4", text: "所有分享会的报名者都可获得新书。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "看了这则通告后，你想起上六年级的哥哥喜欢看本地作家阿福的书，希望他不会错过阿福的分享会。请写一则短信给哥哥，告诉他参加分享会的一个好处，活动详情和报名方法，并告诉他要尽早报名的原因。",
        context: "开头已给出：\"哥哥，学校将邀请你喜欢的作家阿福来学校进行分享会，……\"",
        displayAnswer: "哥哥，学校将邀请你喜欢的作家阿福来学校进行分享会，你千万别错过，因为所有参加者将获得一本阿福老师亲笔签名的新书《狮城60载》。分享会将在10月5日（星期三），下午2点半至4点半，在学校图书馆举行。你可以通过电邮linshuxiang@huanlepri.com向林书香老师报名。记得尽早报名，因为这个活动仅限/只有前30名报名的六年级学生参与。",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。"
      }
    ]
  },

  {
    groupId: "NY-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "一块钱的教训", source: "老师自拟",
      text: "一天放学后，我独自回家。突然，觉得肚子很饿，但口袋里只剩下妈妈今早给我用来搭巴士的一块钱。我正感到烦恼时，刚巧看到巴士站里挤满了人。我灵机一动，一个\"完美\"的计划浮现在脑海中。于是，我用了口袋里仅有的一块钱，买了面包，就走去巴士站。\n\n不一会儿，巴士来了。上巴士时，我故意躲在人群后面，跟着别人上车，不让巴士司机看到。我心想：没想到那么顺利就完成了这次的计划！\n\n回到家时，妈妈已经下班回来了。我得意地把刚刚的经历告诉了她。\"妈妈，您赚钱那么辛苦，我想到了一个妙计！今天，我用搭车的钱买了面包。上车时，我没付车费。如果每天都省下这笔车费，您就不必工作得那么辛苦……\"不料，我的话还没说完，一记耳光就打在了我的脸上。\n\n\"妈妈！您为什么打我？\"我顿时大吃一惊，激动地喊道。妈妈铁青着脸，什么都不说就回到了房间。\n\n我怎么想也想不明白。平时，无论我多顽皮，妈妈都不曾打过我。这一次，我帮她省了钱，她怎么还打我？\n\n临睡前，妈妈摸了摸我的脸，问：\"还疼吗？\"我瞪了妈妈一眼，转过头，什么也不说。妈妈沉默了很久，才说：\"我今天打你，就是要让你记住，你上巴士没有付钱，其实和偷东西是没有两样的。做人一定要诚实！\"说着，妈妈把两块钱递给我，吩咐道：\"明天搭巴士时，用这两块钱多买一张车票，并勇敢地跟司机说出原因，你做得到吗？\"\n\n我红着脸，点了点头，把钱接了过来，眼泪再一次流了下来。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中表示\"做事很少遇到困难\"的词语是 ___ 。",
        accepted: ["顺利"],
        displayAnswer: "顺利",
        answerSource: "inferred",
        notes: "官方答案卷（PDF文字层提取，页27-28）从Q33直接跳到Q36，完全没有列出Q34/Q35的答案 — 经直接查看源PDF页27图像确认，官方答案卷本身确实缺少这两题的答案（不是提取/OCR的问题）。此答案根据短文内容\"没想到那么顺利就完成了这次的计划\"拟写，仅供参考，请自行核实。"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中表示\"立刻\"的词语是 ___ 。",
        accepted: ["顿时"],
        displayAnswer: "顿时",
        answerSource: "inferred",
        notes: "官方答案卷没有提供本题答案（见Q34备注，同一处缺漏）。此答案根据短文内容\"我顿时大吃一惊\"拟写，仅供参考，请自行核实。"
      },
      { qNo: "Q36", marks: 3, format: "Long-Answer",
        text: "作者从图书馆回家时，为了什么事而感到烦恼？(3分)",
        displayAnswer: "作者回家时，肚子很饿，但口袋里只剩下妈妈今早给他用来搭巴士的一块钱。如果他把钱拿去买食物，就没有钱搭车回家。作者为了这件事而感到烦恼。",
        answerSource: "official",
        notes: "题目文字写\"从图书馆回家时\"，但短文开头是\"一天放学后，我独自回家\"，并未提及图书馆 — 题目与短文用词不一致，可能是原试卷本身的编写疏漏；答案照官方答案卷原文转录。"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "作者说的\"妙计\"指的是什么？(2分)他为什么要那么做？(2分)",
        displayAnswer: "作者说的\"妙计\"指的是上巴士时躲在人群后面，跟着别人上车，不要被司机发现。因为他认为如果省下这笔车费，妈妈就不必工作得那么辛苦，所以他要那么做。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 5, format: "Long-Answer",
        text: "当妈妈打了作者时，作者有什么反应？为什么？(5分)",
        displayAnswer: "当妈妈打了作者之后，作者大吃一惊，激动地问妈妈为什么要打他。因为平时无论他有多顽皮，妈妈都不曾打过他，可是这次作者认为他不付车费是帮妈妈省钱，妈妈却打了他，使他不明白，所以他有这样的反应。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 3, format: "Long-Answer",
        text: "妈妈把两块钱交给作者的目的是什么？(3分)",
        displayAnswer: "妈妈把两块钱交给作者的目的是要让作者把那天没付的车费还给司机，并且向巴士司机承认错误，这样他才能够做一个诚实的孩子。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 3, format: "Long-Answer",
        text: "你认为妈妈还可以用什么其他的方法教导作者？(3分)",
        displayAnswer: "官方答案卷列出的可接受方法示例（写出方法后须附解释才给分）：\n— 以身作则\n— 扣零花钱\n— 讲故事/看动画片/社会新闻\n— 在他做得好的时候称赞/奖励他\n— 请老师帮忙",
        answerSource: "official",
        notes: "开放式个人见解题，官方答案卷只列出可接受的方法关键词，并注明\"写了方法，后面需要提供解释\"— 学生需自行举例说明理由才能得分，以上仅为方法清单，非完整示范答案。"
      }
    ]
  },

/* =========================================================
   RAFFLES GIRLS' PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "RG-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "丽丽戴了一整天的__隐形__眼镜，眼睛又累又干。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "yǐn xīng" }, { key: "2", text: "yǐn xíng" }, { key: "3", text: "yǐng xīng" }, { key: "4", text: "yǐng xíng" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RG-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "我今天忘了带伞，结果被雨淋得全身都__湿透__了。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "sī tòu" }, { key: "2", text: "sī tuò" }, { key: "3", text: "shī tòu" }, { key: "4", text: "shī tuò" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RG-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "我在图书馆的地上捡到了一张 ___ 票。",
        options: [{ key: "1", text: "秒" }, { key: "2", text: "钞" }, { key: "3", text: "沙" }, { key: "4", text: "炒" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RG-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "爸爸说下个周末去爬山，大家都 ___ 口同声地说好。",
        options: [{ key: "1", text: "意" }, { key: "2", text: "议" }, { key: "3", text: "异" }, { key: "4", text: "亿" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RG-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "大家 ___ 地捐出食品和钱，希望能帮助到有需要的人。",
        options: [{ key: "1", text: "积极" }, { key: "2", text: "热烈" }, { key: "3", text: "耐心" }, { key: "4", text: "勇敢" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RG-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "妈妈忘记把水果放进冰箱，结果几天后发现水果 ___ 了。",
        options: [{ key: "1", text: "伤害" }, { key: "2", text: "腐烂" }, { key: "3", text: "变化" }, { key: "4", text: "破坏" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RG-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "能和同学一起参加比赛，真是个__宝贵__的机会！ (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "非常精彩，大家都爱看" }, { key: "2", text: "非常美丽，有很多颜色" }, { key: "3", text: "非常充足，完全没缺少" }, { key: "4", text: "非常重要，不容易得到" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RG-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "妈妈每天在我耳边__唠叨__，要我早点儿上床睡觉。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "只说不重要的话" }, { key: "2", text: "说话慢又很小声" }, { key: "3", text: "一直说同样的话" }, { key: "4", text: "喜欢说很多谎话" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RG-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "___ 有好吃的东西，姐姐 ___ 会留给我。",
        options: [{ key: "1", text: "凡是……就" }, { key: "2", text: "不管……都" }, { key: "3", text: "虽然……却" }, { key: "4", text: "除了……还" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RG-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "哥哥 ___ 学业成绩好，___ 喜欢帮助别人。",
        options: [{ key: "1", text: "一边……一边" }, { key: "2", text: "不是……而是" }, { key: "3", text: "因为……所以" }, { key: "4", text: "不仅……而且" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RG-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "___________ ，偏偏就下起了大雨。",
        options: [{ key: "1", text: "小明今早出门时忘了带作业" }, { key: "2", text: "爸爸刚到操场准备开始跑步" }, { key: "3", text: "阿姨收到的礼物是一把雨伞" }, { key: "4", text: "弟弟准备好下周露营的东西" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RG-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "等了好久，巴士终于来了，___________ 。",
        options: [{ key: "1", text: "很多路人都挤上前来围观" }, { key: "2", text: "车窗外的景色变得模糊了" }, { key: "3", text: "乘客们争先恐后地上了车" }, { key: "4", text: "文华连忙向同学们打招呼" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RG-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：下降)",
        options: [{ key: "1", text: "国庆表演结束后，观众席上的观众都下降了。" }, { key: "2", text: "一家人兴奋地望着窗外，看着大雪纷纷下降。" }, { key: "3", text: "自从明文不努力读书，成绩就渐渐地下降了。" }, { key: "4", text: "听到小猫突然不见了，我的眼泪忍不住下降。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RG-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：有限)",
        options: [{ key: "1", text: "哥哥花了很长的时间，也想不出一个有限的方法。" }, { key: "2", text: "我和家人去日本旅游时，发现了许多有限的事物。" }, { key: "3", text: "这位歌手十分有限，世界各地的人都会唱她的歌。" }, { key: "4", text: "能参加露营的人数有限，所以我们应该尽早报名。" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RG-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [7], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？ (词语：记录)",
        options: [{ key: "1", text: "妈妈把我从小到大的样子，全部用照片记录下来。" }, { key: "2", text: "我们一家人去餐馆吃饭，来记录这个特别的日子。" }, { key: "3", text: "每晚睡觉前，奶奶都会提醒小刚一定要记录关灯。" }, { key: "4", text: "乐乐昨天才看过这本书，还可以记录故事的内容。" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  {
    groupId: "RG-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "交流生", source: "老师自拟",
      text: "去年，五名从印度来的学生到我的学校交流。在短短的一个月里，我们一起上课，一起参加不同的户外活动，拉近了我们之间的 [Q16]___。\n\n这几名印度学生用心学习，几个星期后就能用 [Q17]___ 的华文词语与我们聊天。他们非常努力地学习华语，尽管遇到困难，也不怕被别人 [Q18]___，继续坚持练习。\n\n有一天，印度学生除了为我们献上精彩的歌舞节目，还讲故事 [Q19]___ 自己在印度的生活，让我们对他们的国家有了更深的认识。\n\n我们十分 [Q20]___ 这次交流的机会。在他们离开新加坡之前，我们互相送上代表自己国家的纪念品，并说好会继续保持联系。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "在短短的一个月里，我们一起上课，一起参加不同的户外活动，拉近了我们之间的 ___ 。",
        options: [{ key: "1", text: "地址" }, { key: "2", text: "网络" }, { key: "3", text: "年龄" }, { key: "4", text: "距离" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "这几名印度学生用心学习，几个星期后就能用 ___ 的华文词语与我们聊天。",
        options: [{ key: "1", text: "容易" }, { key: "2", text: "基本" }, { key: "3", text: "大概" }, { key: "4", text: "初级" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "他们非常努力地学习华语，尽管遇到困难，也不怕被别人 ___ ，继续坚持练习。",
        options: [{ key: "1", text: "阻拦" }, { key: "2", text: "嘲笑" }, { key: "3", text: "讨厌" }, { key: "4", text: "怀疑" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "有一天，印度学生除了为我们献上精彩的歌舞节目，还讲故事 ___ 自己在印度的生活。",
        options: [{ key: "1", text: "讨论" }, { key: "2", text: "表示" }, { key: "3", text: "分享" }, { key: "4", text: "宣布" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "我们十分 ___ 这次交流的机会。",
        options: [{ key: "1", text: "珍惜" }, { key: "2", text: "制造" }, { key: "3", text: "盼望" }, { key: "4", text: "记得" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RG-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "打错的电话", source: "老师自拟",
      text: "一天，我的手机响了，电话另一边传来了个小女孩的声音：\"爸爸，您快回来吧，我好想您！\"我知道她打错了，因为我没有女儿，只有一个五岁的儿子。我不耐烦地说：\"打错了！\"说完，我便放下电话。没想到小女孩很坚持，一直打电话来。\n\n这一天，电话又响起，电话里还是那个女孩的声音：\"爸爸，您能陪我说一说话吗？妈妈说您很忙，但我真的好想您。\"我听了，有点儿感动，觉得自己不能拒绝她的要求。我回答：\"好吧，你想聊什么？\"她问道：\"您能讲个故事给我听吗？\"我想了想，说：\"好。很久以前，有个小女孩，她是世界上最棒的公主……\"我像个父亲一样，温柔地和她聊天，还答应回家时带个布娃娃给她。\n\n就在我渐渐对这个打错的电话感兴趣时，电话里传来一位女士的声音：\"对不起，先生。小孩的爸爸在国外工作，我的女儿联系不到他。她常常一个人在家，我没想到她会打错电话给您……\"\n\n我放下电话后，心想：原来一个孩子需要的，只是简单的陪伴。我忽然想起自己的儿子，心里做了个决定。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "一开始，小女孩打电话来时，作者有什么反应？",
        options: [{ key: "1", text: "温柔地对女孩说话，并安慰她。" }, { key: "2", text: "答应女孩的要求，买个布娃娃。" }, { key: "3", text: "觉得很有趣，想要和女孩聊天。" }, { key: "4", text: "不耐烦地说话，然后放下电话。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "为什么女孩很坚持地一直打电话来？",
        options: [{ key: "1", text: "她喜欢打电话，想找人陪她聊天。" }, { key: "2", text: "她一个人在家，想听别人讲故事。" }, { key: "3", text: "她很想爸爸，希望可以和爸爸说话。" }, { key: "4", text: "她想要个布娃娃，请求爸爸买给她。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "为什么作者会继续和女孩聊天？",
        options: [{ key: "1", text: "女孩对爸爸的想念让他感动。" }, { key: "2", text: "女孩很喜欢听他讲童话故事。" }, { key: "3", text: "他想知道女孩打错电话的原因。" }, { key: "4", text: "他没有办法让女孩先放下电话。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "女孩打电话的真正原因是什么？",
        options: [{ key: "1", text: "要爸爸给她讲个故事。" }, { key: "2", text: "要爸爸给她买布娃娃。" }, { key: "3", text: "希望爸爸能回家陪她。" }, { key: "4", text: "希望和爸爸一起去玩。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "最后，作者做了什么决定？",
        options: [{ key: "1", text: "不再忙着工作，专心照顾女儿。" }, { key: "2", text: "多花点时间，陪伴自己的儿子。" }, { key: "3", text: "继续接女孩的电话，和她聊天。" }, { key: "4", text: "和女孩保持联系，给她讲故事。" }],
        correctKey: "2",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RG-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "但我昨天吃得太饱" }, { key: "2", text: "我现在要去归还碗盘" }, { key: "3", text: "我还有很多功课要做" }, { key: "4", text: "请阿姨换别的食物给你" }, { key: "5", text: "但我就是不喜欢吃鱼丸" }, { key: "6", text: "让阿姨每天的工作更辛苦" }, { key: "7", text: "是老师提醒我们不要浪费的" }, { key: "8", text: "都是别人辛辛苦苦准备的啊" }],
    passage: {
      title: "别浪费食物", source: "老师自拟",
      text: "伟文：明强，你的碗里还剩下很多鱼丸，你不吃了吗？\n明强：不了，[Q26]___，然后和你一起去踢球！\n伟文：你买了鱼丸面，却不吃鱼丸。浪费食物是很不应该的，你应该改掉坏习惯。\n明强：我也不想这么做，[Q27]___。\n伟文：你在买面时，应该告诉阿姨，[Q28]___。\n明强：你说得对，我应该这么做。我常看到有同学和我一样，把吃不完的食物丢进垃圾桶。\n伟文：这些扔掉的食物，[Q29]___！这就像自己用心画了一个星期的画，被别人扔了一样！\n明强：我明白了，我下次一定会把食物吃完。"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "明强：不了，___ ，然后和你一起去踢球！",
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "明强：我也不想这么做，___ 。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "伟文：你在买面时，应该告诉阿姨，___ 。",
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "伟文：这些扔掉的食物，___ ！这就像自己用心画了一个星期的画，被别人扔了一样！",
        correctKey: "8",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RG-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "动物园游", source: "老师自拟 — 应用文/通告",
      text: "假期\"趣\"动物园！\n\n为了鼓励小朋友和家人一起到动物园游玩，并度过充实的假期，新加坡动物园将在学校假期举办\"假期'趣'动物园！\"活动。\n\n【健康步道行】每天早上7点至晚上7点。除了能和家人一起运动和欣赏景色，你们还能看到一些小动物呢！\n\n【儿童故事时间】12月的每个周末／下午1点至2点／雨林广场。欢迎小朋友来听故事《动物园的秘密》！活动结束后，小朋友还可以在现场买书。\n\n【动物知识大比拼】12月6日／早上9点至10点／雨林广场。小朋友和家长两人一组报名参加。活动当天，请在早上8点半前到雨林广场报名。报名费是每组10元。\n\n【小小管理员】12月7日／早上9点至12点／雨林探险园。欢迎小朋友来当一日动物管理员！报名费是每人5元，请到www.zoo.com.sg报名。\n\n注意：\n◆ 为了支持环保，动物园没有卖矿泉水，请自己带水壶。\n◆ 只要报名参加活动，就有机会赢得大奖。"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "举办\"假期'趣'动物园\"的主要目的是什么？",
        options: [{ key: "1", text: "提醒大家度过充实的假期。" }, { key: "2", text: "鼓励大家到动物园去游玩。" }, { key: "3", text: "告诉大家假期有什么活动。" }, { key: "4", text: "请大家来现场听儿童故事。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "哪一个活动适合爷爷、小文和弟弟一起参加？",
        options: [{ key: "1", text: "健康步道行。" }, { key: "2", text: "小小管理员。" }, { key: "3", text: "儿童故事时间。" }, { key: "4", text: "动物知识大比拼。" }],
        correctKey: "1",
        answerSource: "official",
        notes: "健康步道行不限年龄/人数，适合三人一起参加；动物知识大比拼限定\"两人一组\"，不适合三人。"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？",
        options: [{ key: "1", text: "参加所有动物园的活动前，都要先报名。" }, { key: "2", text: "周末早上，小朋友可以一起听儿童故事。" }, { key: "3", text: "只要去动物园，就可能有机会赢得大奖。" }, { key: "4", text: "如果想看小动物，可以参加健康步道行。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "假如你是小文，你和妈妈想要参加\"动物知识大比拼\"。请在活动前一天写一则短信，提醒妈妈参加活动需要注意的事项。",
        context: "开头已给出：\"妈妈，我们明天早上就要去动物园参加'动物知识大比拼'的活动了。活动会在早上9点开始。我想要提醒您，……\"",
        displayAnswer: "妈妈，我们明天早上就要去动物园参加\"动物知识大比拼\"的活动了。活动会在早上9点开始。我想要提醒您，活动当天，要在早上8点半前到雨林广场报名，报名费是每组10元。还有，为了支持环保，动物园没有卖矿泉水，所以我们要自己带水壶。",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。"
      }
    ]
  },

  {
    groupId: "RG-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "善意的传递", source: "老师自拟",
      text: "一天傍晚，我和父亲一起去公园散步。突然，一位阿姨向我们走来。她不好意思地说：\"先生，能借我两块钱搭巴士回家吗？我的钱包不见了，手机也没电了。\"\n\n这时，我想到电视上说过不能太相信陌生人。我正想把父亲拉走，却看见他已经拿出十块钱递给她。阿姨道谢后，便快步离去。\n\n过后，我忍不住问父亲：\"您忘记去年在地铁站被人骗的事吗？\"父亲解释道：\"去年我是遇到骗子借用手机，当时追不上他，所以才拿不回手机，可是我不能因为那件事而拒绝帮助这位阿姨。有时候，做善事不是要别人感谢我们，而是我们愿不愿意相信这个世界还有真正需要帮助的人。\"我听了，只是对父亲笑了笑。\n\n过了几天，我放学后去文具店买笔，却发现自己忘了带钱包。我站在收银台前，一下子呆住了。老板看出我心里在想什么，微笑着说：\"小朋友，没关系，你先把笔带回家吧，再找时间来付钱也行。\"我吃惊地抬起头，说：\"您真的相信我？\"老板点点头，说：\"每个人都会有需要别人帮忙的时候。\"\n\n那一刻，我似乎明白了什么。我接受了老板的建议，小心地接过笔，连声道谢。回家的路上，我想起那天在公园里发生的事，终于明白了：善心能让人与人之间的感情变得更好，也能让人心里感到更温暖。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中形容\"不能控制\"的词语是 ___ 。",
        accepted: ["忍不住"],
        displayAnswer: "忍不住",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中形容\"好像\"的词语是 ___ 。",
        accepted: ["似乎"],
        displayAnswer: "似乎",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 2, format: "Long-Answer",
        text: "阿姨为什么要向作者的父亲借钱？(2分)",
        displayAnswer: "因为阿姨的钱包不见了，手机也没电，她想搭巴士回家，所以阿姨向作者的父亲借钱。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 4, format: "Long-Answer",
        text: "听了阿姨的话，作者和父亲的反应有什么不同？为什么？(4分)",
        displayAnswer: "听了阿姨的话，作者想到电视上说过不能太相信陌生人，想把父亲拉走，因为他不要父亲被人骗，父亲却已经拿出十块钱递给她。因为父亲愿意相信这个世界还有真正需要帮助的人。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "文中\"一下子呆住了\"这句话的意思是什么？(4分)",
        displayAnswer: "这句话的意思是当作者发现自己忘了带钱包，他站在收银台前，不知所措。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 4, format: "Long-Answer",
        text: "老板怎么帮助作者？(3分) 作者得到了老板的帮助后，有什么感受？(1分)",
        displayAnswer: "老板看出作者心里在想什么，微笑着说作者可以先把笔带回家，再找时间来付钱也行，作者听了后很感动。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "你认为父亲是个怎样的人？试加以说明。(4分)",
        displayAnswer: "作者认为父亲是个善良的人。因为当一位阿姨问作者跟他的父亲可不可以借他两块钱搭巴士回家时，父亲立刻把一张十元的钞票给她了，他没有因为自己曾经被骗手机而拒绝帮助真正需要帮助的人。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   RED SWASTIKA PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "RS-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "今年来新加坡旅游的人数打破了历史__记录__。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "lí sǐ" }, { key: "2", text: "lì shǐ" }, { key: "3", text: "ní sǐ" }, { key: "4", text: "nì shǐ" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RS-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "工人们在后院挖出了一颗__炮弹__，惊动了警方。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "bào dàn" }, { key: "2", text: "bào tàn" }, { key: "3", text: "pào dàn" }, { key: "4", text: "pào tàn" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RS-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "他把自己最喜欢的菜 ___ 到了妈妈的碗里。",
        options: [{ key: "1", text: "夫" }, { key: "2", text: "失" }, { key: "3", text: "夹" }, { key: "4", text: "来" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RS-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "这个活动的报名 ___ 止日期是9月6日。",
        options: [{ key: "1", text: "戴" }, { key: "2", text: "截" }, { key: "3", text: "载" }, { key: "4", text: "栽" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RS-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "哥哥上课很认真，课堂笔记写得很 ___ 。",
        options: [{ key: "1", text: "完好" }, { key: "2", text: "小心" }, { key: "3", text: "详细" }, { key: "4", text: "干净" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RS-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "天色暗了，路上的行人 ___ 少了。",
        options: [{ key: "1", text: "明明" }, { key: "2", text: "渐渐" }, { key: "3", text: "阵阵" }, { key: "4", text: "纷纷" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RS-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "__大概__二十分钟，我就能做完功课。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "只要" }, { key: "2", text: "超过" }, { key: "3", text: "不多过" }, { key: "4", text: "差不多" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RS-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "虽然她的生活过得并不好，但对朋友却总是很__慷慨__。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "幽默有趣" }, { key: "2", text: "温柔善良" }, { key: "3", text: "诚实友善" }, { key: "4", text: "乐于分享" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RS-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "___ 老师给的任务，我 ___ 会努力完成。",
        options: [{ key: "1", text: "凡是……都" }, { key: "2", text: "为了……才" }, { key: "3", text: "除了……还" }, { key: "4", text: "如果……就" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RS-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "这条路 ___ 很远，___ 难走。",
        options: [{ key: "1", text: "不是……就是" }, { key: "2", text: "虽然……但是" }, { key: "3", text: "不仅……而且" }, { key: "4", text: "因为……所以" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RS-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "在妈妈的细心培育下，___________ 。",
        options: [{ key: "1", text: "爷爷恢复了健康" }, { key: "2", text: "晚餐很快就做好了" }, { key: "3", text: "花园里的花全都枯了" }, { key: "4", text: "果树结出了甜甜的果子" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RS-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________ ，你把它们丢进垃圾桶吧！",
        options: [{ key: "1", text: "这些早餐很有营养" }, { key: "2", text: "食物都已经腐烂了" }, { key: "3", text: "我们应该废物利用" }, { key: "4", text: "购物时使用环保袋" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RS-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：材料)",
        options: [{ key: "1", text: "可乐又甜又好喝，是我最喜欢喝的材料之一。" }, { key: "2", text: "做这道菜时，苦瓜和鸡蛋都是最基本的材料。" }, { key: "3", text: "胡椒粉是一种材料，它可以增添食物的味道。" }, { key: "4", text: "这部电影的材料很多，大家看了都哈哈大笑。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RS-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：记录)",
        options: [{ key: "1", text: "交通意外发生后，现场来了很多的记录。" }, { key: "2", text: "小时候的事情，姐姐现在都还能记录起来。" }, { key: "3", text: "老师要我们把他课上讲的内容全都记录下来。" }, { key: "4", text: "每次读自己过去写的记录，我都会忍不住笑出来。" }],
        correctKey: "3",
        answerSource: "official",
        notes: "(4)在语意上其实也说得通，但官方答案选(3)。"
      }] },

  { groupId: "RS-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [8], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：自豪)",
        options: [{ key: "1", text: "做事情要有自豪，才能更好面对困难。" }, { key: "2", text: "华文课上，老师让同学们自豪地讨论。" }, { key: "3", text: "赢得比赛后，队员们都感到无比自豪。" }, { key: "4", text: "她的表演很自豪，获得了观众的掌声。" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  {
    groupId: "RS-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "陈老师的词典", source: "老师自拟",
      text: "陈老师是我们的华文老师。他的脾气很好，但是十分 [Q16]___ ，同样的事要说很多次。\n\n刚上五年级时，有几个同学每次上华文课都是 [Q17]___ 的样子。陈老师没有生气，而是一遍又一遍地提醒他们要认真听课。过了一段时间，这几个同学一看到陈老师，就会 [Q18]___ 地坐好。\n\n其实，陈老师十分关心学生。那时我家里穷，上学用的书本都是哥哥姐姐用剩下的，但我学习很努力。有一天，陈老师 [Q19]___ 拿起我又破又旧的词典，翻开后忽然呆住了，用一种特别的眼神看了我好一会儿，什么也没说就转身离开。第二天，他突然在课堂上说要小测验，考得最好的人，可以得到一本词典。我很幸运地得到了它。\n\n那本词典我用了好多年。我会永远爱护它，[Q20]___ 它。能遇到这样的好老师，真是我一生的幸运！"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "他的脾气很好，但是十分 ___ ，同样的事要说很多次。",
        options: [{ key: "1", text: "恶劣" }, { key: "2", text: "自私" }, { key: "3", text: "唠叨" }, { key: "4", text: "沉默" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "有几个同学每次上华文课都是 ___ 的样子。",
        options: [{ key: "1", text: "狼吞虎咽" }, { key: "2", text: "胸有成竹" }, { key: "3", text: "无精打采" }, { key: "4", text: "兴高采烈" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "这几个同学一看到陈老师，就会 ___ 地坐好。",
        options: [{ key: "1", text: "激动人心" }, { key: "2", text: "不约而同" }, { key: "3", text: "异口同声" }, { key: "4", text: "七嘴八舌" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "陈老师 ___ 拿起我又破又旧的词典，翻开后忽然呆住了。",
        options: [{ key: "1", text: "无意间" }, { key: "2", text: "一眨眼" }, { key: "3", text: "回过神" }, { key: "4", text: "禁不住" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "我会永远爱护它，___ 它。",
        options: [{ key: "1", text: "照顾" }, { key: "2", text: "感恩" }, { key: "3", text: "珍惜" }, { key: "4", text: "赢得" }],
        correctKey: "3",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RS-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解一",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "乔布斯的家规", source: "老师自拟",
      text: "乔布斯和他的团队推出了世界上第一台苹果手机。很多人以为像他这样的大老板，他家里一定有很多电子用品。他的孩子也肯定每天都在使用手机或电脑。但事实却偏偏相反。\n\n有一次，有人问乔布斯：\"你的孩子是不是很喜欢平板电脑？\"他说：\"他们还没用过，我们不让孩子使用。\"这让很多人非常吃惊。\n\n其实，不只是乔布斯，大多数父母都很小心地控制孩子用手机或电脑的时间。有些父母规定，孩子每天放学回家后不能碰手机或电脑，周末也只能玩一会儿。有些父母则要求孩子只能使用手机或电脑进行学习活动。\n\n这是因为大多数父母很清楚手机和电脑虽然方便，但如果用得太多，会因此迷上手机或电脑游戏，不爱读书，也不爱运动，变得不愿意和别人说话。他们希望孩子多看书，多动脑或者经常参加户外活动，保持身体健康。\n\n不过，也有人觉得，如果禁止孩子用手机和电脑，反而会让孩子更好奇、更想去偷偷使用。比如有的父母不让孩子出去和朋友玩耍，结果孩子长大后常常往外跑，很少待在家里。这说明，有时候过度禁止也可能产生反作用。\n\n在乔布斯的家里，晚餐时间就是全家人一起聊天的时刻，谁也不会拿出手机或平板电脑。他的孩子也并没有因此感到不快乐，反而喜爱阅读和运动，生活得非常充实。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "为什么很多人听了乔布斯的话会非常吃惊？",
        options: [{ key: "1", text: "因为他的家里有很多电子用品。" }, { key: "2", text: "因为他的孩子不喜欢平板电脑。" }, { key: "3", text: "因为他不让孩子使用平板电脑。" }, { key: "4", text: "因为他的孩子每天用电子用品。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "孩子用手机或电脑，大多数父母是怎么做的？",
        options: [{ key: "1", text: "毫不在意" }, { key: "2", text: "无能为力" }, { key: "3", text: "小心控制" }, { key: "4", text: "鼓励使用" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "以下哪一个不是父母要孩子少用手机和电脑的原因？",
        options: [{ key: "1", text: "孩子有可能会上瘾。" }, { key: "2", text: "孩子每天都在使用。" }, { key: "3", text: "影响孩子的身体健康。" }, { key: "4", text: "孩子会变得不爱说话。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "为什么有人觉得禁止孩子用手机和电脑是不好的？",
        options: [{ key: "1", text: "因为会让孩子长大常常往外跑。" }, { key: "2", text: "因为孩子可能会变得不爱读书。" }, { key: "3", text: "因为孩子应该和朋友一起玩耍。" }, { key: "4", text: "因为过度禁止可能产生反作用。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "这篇文章最主要想告诉我们什么？",
        options: [{ key: "1", text: "使用手机和电脑会有危险。" }, { key: "2", text: "孩子不需要用手机和电脑。" }, { key: "3", text: "父母不应该买手机和电脑。" }, { key: "5", text: "应该合理使用手机和电脑。" }],
        correctKey: "5",
        answerSource: "official",
        notes: "原题第4个选项印刷标号为\"(5)\"而非\"(4)\"（原PDF排版有误），照原样转录；官方答案卷同样以\"4\"作为此选项的答案代号。"
      }
    ]
  },

  {
    groupId: "RS-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "他伤得不严重" }, { key: "2", text: "住院的人不多" }, { key: "3", text: "我们改天去好吗" }, { key: "4", text: "他就不用看医生了" }, { key: "5", text: "他一定会感到安慰" }, { key: "6", text: "不如我和你一起去" }, { key: "7", text: "怎么现在才告诉我" }, { key: "8", text: "我想做张卡片送给他" }],
    passage: {
      title: "林伯伯住院了", source: "老师自拟",
      text: "美文：妈妈，待会儿吃完晚饭后能带我到游乐场玩吗？\n妈妈：[Q26]___？林伯伯住院了，我今晚要去探望他。\n美文：没问题。林伯伯怎么住院了？\n妈妈：他今天在巴刹里跌倒了。幸好，[Q27]___，只需要住院几天。\n美文：[Q28]___，可以吗？\n妈妈：当然可以呀！你真是个懂事的孩子。看了你做的卡片，[Q29]___。\n美文：太好了，那我现在就去做！"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "妈妈：___ ？林伯伯住院了，我今晚要去探望他。",
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "妈妈：他今天在巴刹里跌倒了。幸好，___ ，只需要住院几天。",
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "美文：___ ，可以吗？",
        correctKey: "8",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "妈妈：当然可以呀！你真是个懂事的孩子。看了你做的卡片，___ 。",
        correctKey: "5",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RS-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "年终假日营", source: "老师自拟 — 应用文/通告",
      text: "\"动起来！\" 年终假日营\n\n为了让孩子们更加热爱运动，我们将在十二月学校假期举办\"动起来！\"年终假日营。\n\n活动详情：\n【足球训练营】学习基本球技／日期：12月1日\n【快乐飞盘团】训练眼力和团体合作／日期：12月2日\n【篮球挑战赛】专业教练教你投篮和传球。／日期：12月3日\n\n首30位报名的人都能得到水瓶和毛巾！\n\n时间：早上8时至10时\n地点：爱慈小学\n费用：每人每天$10\n\n报名参加三天活动的人只需要付$25！\n\n您可以到www.happycamp.com了解更多详情。请有兴趣参加的公众在11月15日之前到欢乐民众俱乐部报名。\n\n欢乐民众俱乐部\n2025年10月1日"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "举办\"动起来！\"年终假日营的主要目的是什么？",
        options: [{ key: "1", text: "帮助孩子们结交新朋友。" }, { key: "2", text: "让孩子们对运动感兴趣。" }, { key: "3", text: "给孩子们学习团队合作。" }, { key: "4", text: "训练孩子的眼力和合作。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "欢乐民众俱乐部怎样吸引公众参加全部的活动？",
        options: [{ key: "1", text: "全部活动都安排在早上进行。" }, { key: "2", text: "每一天的运动项目都不一样。" }, { key: "3", text: "参加所有活动的费用更便宜。" }, { key: "4", text: "报名的人都能得到一个水瓶。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？",
        options: [{ key: "1", text: "这个活动是由爱慈小学举办的。" }, { key: "2", text: "公众要在11月15日之前报名。" }, { key: "3", text: "报名参加的公众都会更爱运动。" }, { key: "4", text: "公众可以上网报名参加假日营。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "如果你是丽云，你知道文文喜欢打篮球。请你写一则短信，告诉他可以参加假日营的哪一项活动，以及参加那项活动的好处和日期。",
        context: "开头已给出：\"文文，我知道你喜欢打篮球，你可以 ___\"",
        displayAnswer: "文文，我知道你喜欢打篮球。你可以参加\"篮球挑战赛\"。那里有专业的教练教你投篮和传球。活动日期是12月3日。希望你能参加！",
        answerSource: "official",
        notes: "本题为约束式应用文写作，官方示范答案只是其中一种合理写法，评分以内容要点+表达是否通顺为准，并非唯一标准答案。官方答案卷按分句给出0.5分的评分细则（每个内容要点0.5分，共4项=2分，其余2分为表达分）。"
      }
    ]
  },

  {
    groupId: "RS-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "藏起来的功课", source: "老师自拟",
      text: "\"伟明，你在发什么呆？功课做完了吗？\"妈妈一边在厨房里炒菜，一边说道。伟明觉得做功课很浪费时间。妈妈的问题让他感到非常不耐烦。\"功课，功课！每天都有做不完的功课！今天做完了，老师明天又会再给。我什么时候才可以看电视、玩手机？\"伟明生气地说道。\n\n伟明整天只想着要看电视和玩手机游戏，功课都做得十分马虎。他常常不是忘了几道题没做，就是把字写错。有时候，他在数学作业里会少写数字，答案也常常算错。有一次还把\"天\"字写成\"大\"字。老师和父母都劝他要认真学习，可是伟明并不同意他们说的话。他觉得只要自己在考试时细心点就行了。平时不用把功课看得那么认真，再多错误也没关系。\n\n这天是星期五，老师给了不少功课。伟明一边收拾书包，一边皱着眉头，心想：\"这么多功课，我的周末不是又没了吗？我又不能看电视和玩手机了！\"这时，一个坏主意突然浮现在他的脑海里。他悄悄把功课放到桌子底下，然后当作老师没给功课似的走回家。\n\n接下来的日子，伟明每天不带功课回家做。老师给的功课他也做得不认真，常常被老师批评做事不负责任。\n\n很快，要考试了。伟明在考试前一天才开始复习，结果考试当天很多题不会做，考试成绩不及格。看到其他同学都开心地看着自己的成绩，伟明感到很后悔，伤心地哭了起来。回到家后，妈妈对他说：\"学习靠的是平时的努力，不是到最后一分钟才用功。\"听了妈妈的话后，伟明用力地点了点头，说：\"我以后一定会认真做好每一次功课，细心完成每一道题。\"\n\n从此以后，伟明对功课有了新的看法。妈妈看到伟明的改变，成绩也进步了，露出了满意的笑容。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中形容\"不惊动人或不让别人知道\"的词语是 ___ 。",
        accepted: ["悄悄"],
        displayAnswer: "悄悄",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中形容\"事情过后感到自责，心里不舒服\"的词语是 ___ 。",
        accepted: ["后悔"],
        displayAnswer: "后悔",
        answerSource: "official"
      },
      { qNo: "Q36", marks: 3, format: "Long-Answer",
        text: "伟明为什么不喜欢做功课？(3分)",
        displayAnswer: "伟明觉得做功课很浪费时间。他认为每天都有做不完的功课，今天做完了，老师明天又会再给，他就不可以（没有时间）看电视和玩手机。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 3, format: "Long-Answer",
        text: "从哪里可以看出伟明对待功课不认真？(3分)",
        displayAnswer: "他常常不是忘了几道题没做，就是把字写错。有时候，他在数学作业里会少写数字，答案也常常算错。有一次还把\"天\"字写成\"大\"字。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "文中的\"坏主意\"指的是什么？(1分)伟明为什么要这样做？(3分)",
        displayAnswer: "这指的是伟明把功课放到桌子底下，当作老师没给功课似的走回家。因为那天是星期五，老师给了很多功课，伟明不想做功课，伟明觉得（认为）如果他把功课带回家，他的周末就会用来完成功课，不能看电视和玩手机。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 4, format: "Long-Answer",
        text: "听了妈妈的话后，伟明对功课的看法和以前有什么不同？(4分)",
        displayAnswer: "他以前觉得只要自己在考试时细心一点就行了，平时不用认真对待功课，再多错误也没关系。听了妈妈的话后，他认为学习靠的是平时努力，不是到最后一分钟才用功。只要认真做好每一次功课，细心完成每一道题，成绩就会进步。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "你认为妈妈最后为什么露出满意的笑容？(4分)",
        displayAnswer: "因为伟明听了妈妈的话后，做出了改变／改过自新（行为），成绩也进步了（结果），妈妈感到开心（感受）。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   ROSYTH PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  { groupId: "RO-Q1", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q1", marks: 2, format: "MCQ",
        text: "我们要了解国家的__历史__。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "lǐ sī" }, { key: "2", text: "lǐ sì" }, { key: "3", text: "lì shī" }, { key: "4", text: "lì shǐ" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RO-Q2", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "pinyin",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q2", marks: 2, format: "MCQ",
        text: "放在桌子上的水果已经__腐烂__了。 (选出画线词语的汉语拼音)",
        options: [{ key: "1", text: "fú lán" }, { key: "2", text: "fǔ làn" }, { key: "3", text: "fú làng" }, { key: "4", text: "fǔ láng" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RO-Q3", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q3", marks: 2, format: "MCQ",
        text: "父母把我们养大，我们要懂得感___。",
        options: [{ key: "1", text: "思" }, { key: "2", text: "恩" }, { key: "3", text: "意" }, { key: "4", text: "总" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RO-Q4", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q4", marks: 2, format: "MCQ",
        text: "如果我们做错了，要承认自己的错___。",
        options: [{ key: "1", text: "屋" }, { key: "2", text: "物" }, { key: "3", text: "误" }, { key: "4", text: "鸟" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RO-Q5", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q5", marks: 2, format: "MCQ",
        text: "运动能让我们身体健康，也能___心情。",
        options: [{ key: "1", text: "放松" }, { key: "2", text: "培育" }, { key: "3", text: "进步" }, { key: "4", text: "休息" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RO-Q6", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "vocab",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q6", marks: 2, format: "MCQ",
        text: "妈妈告诉我考到第一名不能___，要继续努力。",
        options: [{ key: "1", text: "激动" }, { key: "2", text: "骄傲" }, { key: "3", text: "害羞" }, { key: "4", text: "紧张" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  { groupId: "RO-Q7", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q7", marks: 2, format: "MCQ",
        text: "我__阻拦__他把水瓶丢下楼，因为这样做不安全。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "帮助别人做事情" }, { key: "2", text: "勇敢地面对问题" }, { key: "3", text: "不让一些事情发生" }, { key: "4", text: "让人感到不好意思" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RO-Q8", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "phrase",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q8", marks: 2, format: "MCQ",
        text: "弟弟刚开始学踢足球，他只会一些__基本__知识。 (选出与画线词语意思最接近的选项)",
        options: [{ key: "1", text: "简单的" }, { key: "2", text: "专心的" }, { key: "3", text: "好玩的" }, { key: "4", text: "认真的" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RO-Q9", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q9", marks: 2, format: "MCQ",
        text: "他___不要浪费食物，___把剩下的食物都吃完。",
        options: [{ key: "1", text: "除了……还有" }, { key: "2", text: "反正……不如" }, { key: "3", text: "为了……只好" }, { key: "4", text: "不是……而是" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RO-Q10", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "conjunction",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q10", marks: 2, format: "MCQ",
        text: "小华___长大了，妈妈___叫他\"宝宝\"。",
        options: [{ key: "1", text: "已经……还" }, { key: "2", text: "不但……还" }, { key: "3", text: "如果……就" }, { key: "4", text: "自从……就" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RO-Q11", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q11", marks: 2, format: "MCQ",
        text: "他深深地吸了一口气，___________。",
        options: [{ key: "1", text: "把想要说的话说出来" }, { key: "2", text: "不小心地摔倒在地上" }, { key: "3", text: "把自己房间收拾干净" }, { key: "4", text: "看到门外有很多叶子" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RO-Q12", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "sentence",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q12", marks: 2, format: "MCQ",
        text: "___________，我可能来不及完成这份功课。",
        options: [{ key: "1", text: "听到了这个坏消息后" }, { key: "2", text: "想到老师生气的样子" }, { key: "3", text: "要是没有哥哥的帮忙" }, { key: "4", text: "平时都没有好好学习" }],
        correctKey: "3",
        answerSource: "official"
      }] },

  { groupId: "RO-Q13", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q13", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：附近)",
        options: [{ key: "1", text: "学校附近有个咖啡店，走过一条马路便到了。" }, { key: "2", text: "他们从小就是很附近的朋友，常常一起玩耍。" }, { key: "3", text: "那只小狗闻到食物的味道，慢慢附近我这里。" }, { key: "4", text: "小强把他的椅子推过来，附近其他人一起坐。" }],
        correctKey: "1",
        answerSource: "official"
      }] },

  { groupId: "RO-Q14", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q14", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：制造)",
        options: [{ key: "1", text: "新年要到了，同学们一起把课室制造得非常干净。" }, { key: "2", text: "妈妈知道他今晚会回来，特别制造了美味的晚餐。" }, { key: "3", text: "今天功课好难，我们要用学会的字制造一个句子。" }, { key: "4", text: "为了节省力气，我想制造一个会做家务的机器人。" }],
        correctKey: "4",
        answerSource: "official"
      }] },

  { groupId: "RO-Q15", subject: "Chinese", paper: "Paper 2", section: "一 语文应用", category: "usage",
    lessonEligible: true, lessonIds: [9], passage: null,
    questions: [{ qNo: "Q15", marks: 2, format: "MCQ",
        text: "以下哪个句子是正确的？ (词语：恢复)",
        options: [{ key: "1", text: "爸爸忙了半天，才把不见的书本恢复了。" }, { key: "2", text: "奶奶在家休息了两天，终于恢复了健康。" }, { key: "3", text: "弟弟很懂事，他会把玩具恢复到柜子里。" }, { key: "4", text: "姐姐读了同学写的电邮后，立刻恢复她。" }],
        correctKey: "2",
        answerSource: "official"
      }] },

  {
    groupId: "RO-G1", subject: "Chinese", paper: "Paper 2", section: "二 短文填空",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "班长的信心", source: "老师自拟",
      text: "小红是我们班的班长。但是她觉得自已 [Q16]___ 安静，不适合当班长。她对自已没有什么信心。\n\n有一次，她和我说她不明白老师为什么 [Q17]___ 几年都选她当班长，她觉得自已不是好班长。我说她是个温柔的班长，看到同学犯错会很有 [Q18]___ 地劝他们。\n\n我也说她是个 [Q19]___ 的人。有一次，我忘了带钱买食物吃，小红还把自已的面包分一半给我吃。听了我的 [Q20]___，小红变得更有信心。"
    },
    questions: [
      { qNo: "Q16", marks: 2, format: "MCQ",
        text: "但是她觉得自已 ___ 安静，不适合当班长。",
        options: [{ key: "1", text: "经常" }, { key: "2", text: "似乎" }, { key: "3", text: "永远" }, { key: "4", text: "比较" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q17", marks: 2, format: "MCQ",
        text: "她不明白老师为什么 ___ 几年都选她当班长。",
        options: [{ key: "1", text: "连续" }, { key: "2", text: "连接" }, { key: "3", text: "继续" }, { key: "4", text: "接着" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "MCQ",
        text: "看到同学犯错会很有 ___ 地劝他们。",
        options: [{ key: "1", text: "细心" }, { key: "2", text: "孝心" }, { key: "3", text: "爱心" }, { key: "4", text: "耐心" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 2, format: "MCQ",
        text: "我也说她是个 ___ 的人。",
        options: [{ key: "1", text: "诚实" }, { key: "2", text: "公平" }, { key: "3", text: "善良" }, { key: "4", text: "聪明" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 2, format: "MCQ",
        text: "听了我的 ___ ，小红变得更有信心。",
        options: [{ key: "1", text: "鼓励" }, { key: "2", text: "支持" }, { key: "3", text: "表示" }, { key: "4", text: "告诉" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RO-G2", subject: "Chinese", paper: "Paper 2", section: "三 阅读理解",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "老人的善心", source: "老师自拟",
      text: "从前，有一个年轻人很自私，他的心中只有他自己。当别人遇到困难时，他也不会去帮助他们。\n\n有一次，他自己一个人去爬山。爬了一个小时，他走不动了，便在半路上休息。突然，一条蛇爬了出来，咬了他一口。他躺在路旁，整个人看起来很辛苦。他心想：我平时不肯帮助别人。这次应该也不会有人来帮我。我该怎么回家？\n\n不知过了多久，年轻人醒来了。他发现自己没死。他睡在一间又破又旧的屋子里，一个老人捧着一碗菜汤站在他面前，对他说：\"吃点东西吧，身体才好得快。以后爬山要小心哦！\"\n\n原来是老人发现年轻人倒在路旁。他叫了年轻人好多次，但是年轻人一直紧紧地闭着眼睛。老人担心年轻人会有危险，便把他背回家。到家后，老人还替他在受伤的地方上涂药。年轻人很感谢老人，就拿出一些钱给老人，想谢谢老人救了他的命。\n\n老人拒绝收下年轻人的钱，并对年轻人说：\"我不是为了钱而救你的。\"但是，年轻人坚持要老人把钱收下，老人说：\"如果你想向我表示感谢，就把这些钱送给更需要它的人，这就是给我最好的礼物了。\"听了老人的话，年轻人点了点头。年轻人一想到以前的自己，脸就红了起来。\n\n后来，年轻人把那些钱捐给了穷人。从此，年轻人积极帮助别人，做了很多好事。"
    },
    questions: [
      { qNo: "Q21", marks: 2, format: "MCQ",
        text: "为什么年轻人躺在路旁？",
        options: [{ key: "1", text: "他忘了回家的路。" }, { key: "2", text: "他不要别人帮忙。" }, { key: "3", text: "他等着老人出现。" }, { key: "4", text: "他被一条蛇咬伤。" }],
        correctKey: "4",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 2, format: "MCQ",
        text: "以下哪一个不是老人把年轻人背回家的原因？",
        options: [{ key: "1", text: "老人在半路叫不醒年轻人。" }, { key: "2", text: "老人发现年轻人倒在路旁。" }, { key: "3", text: "老人想请年轻人喝他煮的菜汤。" }, { key: "4", text: "老人担心年轻人在山上有危险。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 2, format: "MCQ",
        text: "老人认为年轻人给他最好的礼物是什么？",
        options: [{ key: "1", text: "年轻人把所有的钱都给老人。" }, { key: "2", text: "年轻人紧闭着的眼睛睁开了。" }, { key: "3", text: "年轻人把钱捐给有需要的人。" }, { key: "4", text: "年轻人懂得向老人表示感谢。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q24", marks: 2, format: "MCQ",
        text: "年轻人想到以前的自己，他感到 ___ 。",
        options: [{ key: "1", text: "痛苦" }, { key: "2", text: "惭愧" }, { key: "3", text: "烦恼" }, { key: "4", text: "后悔" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q25", marks: 2, format: "MCQ",
        text: "后来，年轻人变成一个怎样的人？",
        options: [{ key: "1", text: "乐于助人" }, { key: "2", text: "积极努力" }, { key: "3", text: "坚持到底" }, { key: "4", text: "注意安全" }],
        correctKey: "1",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RO-G3", subject: "Chinese", paper: "Paper 2", section: "四 完成对话",
    category: "dialogue", lessonEligible: false, lessonIds: [],
    optionBank: [{ key: "1", text: "还是不能得第一名" }, { key: "2", text: "还会做很多练习题" }, { key: "3", text: "也会想起老师的话" }, { key: "4", text: "我越做越觉得容易" }, { key: "5", text: "偏偏一直没有进步" }, { key: "6", text: "只要我肯加倍努力" }, { key: "7", text: "我答错的练习题非常多" }, { key: "8", text: "你一定要找出答错的原因" }],
    passage: {
      title: "数学退步了", source: "老师自拟",
      text: "小安： 立明，听说你最近在数学上遇到了一些困难。\n立明： 是的，我努力学习了，[Q26]___。\n小安： 怎么会这样呢？是不是你的学习方法不对？\n立明： 我每天都会看笔记本，[Q27]___。\n小安： 那些问题你都答得如何？\n立明： [Q28]___。\n小安： 你有请老师或爸爸妈妈跟你解释吗？\n立明： 没有，我常常自己想，还是想不明白。\n小安： [Q29]___，知道哪里不对，才能进步。\n立明： 我明白了，我今天放学后就会去找老师。\n小安： 老师一定会教你的。加油！"
    },
    questions: [
      { qNo: "Q26", marks: 2, format: "MCQ",
        text: "立明：是的，我努力学习了，___ 。",
        correctKey: "5",
        answerSource: "official"
      },
      { qNo: "Q27", marks: 2, format: "MCQ",
        text: "立明：我每天都会看笔记本，___ 。",
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q28", marks: 2, format: "MCQ",
        text: "立明：___ 。 (回答\"那些问题你都答得如何？\")",
        correctKey: "7",
        answerSource: "official"
      },
      { qNo: "Q29", marks: 2, format: "MCQ",
        text: "小安：___ ，知道哪里不对，才能进步。",
        correctKey: "8",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "RO-G4", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 A组",
    category: "practical", lessonEligible: false, lessonIds: [],
    passage: {
      title: "粉红姐姐音乐会", source: "老师自拟 — 应用文/通告",
      text: "\"粉红姐姐\" 音乐会\n\n著名的\"粉红姐姐\"当了10年的歌手。为了感谢大家多年的支持，她将在新加坡举办一场音乐会。这次的音乐会将表演多首歌曲，包括《红花》、《雪糕》和《都都》。\n\n日期：2023年12月2日（星期六）\n时间：晚上8点\n地点：国家艺术中心\n\n*在音乐会当天，穿粉红色衣服的观众有机会和\"粉红姐姐\"握手拍照！\n\n•最先购买入门票的100位观众，将会免费得到一支\"粉红姐姐\"的荧光棒。\n•请带着入门票到欢欢民众俱乐部领取荧光棒。\n\n大家可以在10月1日，早上10点到订票网站pinkpink.sg开始买票。票价分为80元、180元和280元。\n请打热线电话6788 8888了解更多详情。\n\n注意：国家艺术中心禁止观众带食物和饮料。"
    },
    questions: [
      { qNo: "Q30", marks: 2, format: "MCQ",
        text: "\"粉红姐姐\"举办音乐会的目的是什么？",
        options: [{ key: "1", text: "和新加坡朋友一起听歌。" }, { key: "2", text: "感谢大家这十年的支持。" }, { key: "3", text: "让观众有机会买荧光棒。" }, { key: "4", text: "认识更多喜欢她的朋友。" }],
        correctKey: "2",
        answerSource: "official"
      },
      { qNo: "Q31", marks: 2, format: "MCQ",
        text: "想要去看演唱会的人可以怎样买票？",
        options: [{ key: "1", text: "上订票网站。" }, { key: "2", text: "打热线电话。" }, { key: "3", text: "到国家艺术中心去。" }, { key: "4", text: "去欢欢民众俱乐部。" }],
        correctKey: "1",
        answerSource: "official"
      },
      { qNo: "Q32", marks: 2, format: "MCQ",
        text: "以下哪一个句子是正确的？",
        options: [{ key: "1", text: "凡是买票的观众都能得到一支荧光棒。" }, { key: "2", text: "去听音乐会的人必须穿粉红色的衣服。" }, { key: "3", text: "人们不可以带饮料和食物去听音乐会。" }, { key: "4", text: "\"粉红姐姐\"会在新加坡有两场音乐会。" }],
        correctKey: "3",
        answerSource: "official"
      },
      { qNo: "Q33", marks: 4, format: "Writing-Constrained",
        text: "如果你是乐乐，你想去听\"粉红姐姐\"的音乐会，请你写一张便条，告诉爸爸音乐会的日期和地点，并告诉爸爸音乐会有什么吸引你的地方。",
        context: "开头已给出：\"爸爸：我想去听'粉红姐姐'的音乐会。___\"",
        displayAnswer: "爸爸：我想去听\"粉红姐姐\"的音乐会。音乐会的日期是2023年12月2日，地点在国家艺术中心。音乐会吸引我的地方是穿粉红色衣服的观众，有机会和粉红姐姐握手拍照。",
        answerSource: "official",
        notes: "官方参考答案按分句给出0.5分的评分细则（日期0.5分/地点0.5分/吸引点的两处填空各0.5分，共2分，其余2分为整体表达/内容分）；答案卷另注明可接受的其他\"吸引之处\"包括：免费得到的荧光棒、表演多首歌曲。本题为约束式应用文写作，官方示范答案只是其中一种合理写法。"
      }
    ]
  },

  {
    groupId: "RO-G5", subject: "Chinese", paper: "Paper 2", section: "五 阅读理解二 B组",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "拆穿谎言的考题", source: "老师自拟",
      text: "一天早上，我在上学的路上遇到小安和家明。看到他们手里拿着游戏机，我和他们玩了起来。结果，我们三人玩得很入迷，忘了时间。等我们跑到学校才发现已经迟到了一个小时，林老师安排的考试已经快结束了。\n\n\"对不起，林老师，\"我站在教室门口说道，\"我们不是故意迟到的，我们的巴士在路上出了问题，所以上学迟到了。\"说完后，我朝身旁的两个同学眨了眨眼。小安明白我的意思，立刻说：\"对啊！对啊！当时只听见'碰'的一声，巴士就停了下来不会动了！\"家明紧接着说：\"我们等了好久才等到下一辆巴士，我们已经尽快赶来学校了。\"\n\n林老师听了，微笑着点点头，叫我们不用担心。接着，他让我们坐在教室的三个不同角落，给我们再一次考试的机会。我很高兴，心想：我们就这样混了过去，老师太好骗了！然而，考题一出，我一下子傻了———\n\n\"巴士在哪条道路上出了问题？\"我心想：怎么会有这样的题目？老师是不是怀疑我们说谎？我转过头，想偷偷跟小安和家明讨论答案，没想到老师却直盯着我看。如果我们三个人的答案不一样就惨了！我的额头直冒汗，握笔的手一直抖着，迟迟写不下答案。\n\n那是一道我永远都无法忘记的考题，它虽然简单，但我却得了零分！老师用一道很简单的考题，让我明白了一个重要的道理。"
    },
    questions: [
      { qNo: "Q34", marks: 2, format: "Fill-in",
        text: "文中表示\"停止进行，不再继续\"的词语是：___ 。",
        accepted: ["结束"],
        displayAnswer: "结束",
        answerSource: "official"
      },
      { qNo: "Q35", marks: 2, format: "Fill-in",
        text: "文中表示\"不太相信\"的词语是：___ 。",
        accepted: ["怀疑"],
        displayAnswer: "怀疑",
        answerSource: "official",
        notes: "官方答案卷标注：若使用代词有误（如把\"作者\"误写为\"接受\"等指代错误），扣0.5分——此为评分细则备注，与\"怀疑\"这个答案本身无关。"
      },
      { qNo: "Q36", marks: 3, format: "Long-Answer",
        text: "什么事情让\"我\"上学迟到了？(3分)",
        displayAnswer: "\"我\"在上学的路上跟小安和家明一起玩游戏，玩得入迷了，忘了时间。",
        answerSource: "official"
      },
      { qNo: "Q37", marks: 3, format: "Long-Answer",
        text: "\"我们\"怎样骗老师说\"我们\"不是故意迟到的？(3分)",
        displayAnswer: "\"我们\"说巴士在路口出了问题，当时只听见\"碰\"的一声，巴士就停了下来不会动了。\"我们\"等了很久才等到下一辆巴士，已经尽快赶来学校了。",
        answerSource: "official"
      },
      { qNo: "Q38", marks: 4, format: "Long-Answer",
        text: "林老师听了\"我们\"迟到的解释后，有什么反应？(2分) 他后来怎么做？(2分)",
        displayAnswer: "林老师听了，微笑着点点头，叫\"我们\"不用担心。他让\"我们\"坐在教室的三个不同角落，给\"我们\"再一次考试的机会。",
        answerSource: "official"
      },
      { qNo: "Q39", marks: 4, format: "Long-Answer",
        text: "看到考题之前和看到考题之后，\"我\"的心情有什么不同？(2分) 为什么\"我\"的心情会有不同？(2分)",
        displayAnswer: "看到考题之前，\"我\"很高兴。因为\"我们\"就这样混了过去，\"我\"认为老师太好骗了。看到考题之后，我很惊讶。因为\"我\"没有想到会有这样的问题，心想老师可能怀疑\"我们\"说谎。",
        answerSource: "official"
      },
      { qNo: "Q40", marks: 4, format: "Long-Answer",
        text: "为什么\"我\"认为那一道考题非常难忘？(4分)",
        displayAnswer: "因为那道考题虽然简单，但是\"我\"却得了零分。那道题让\"我\"明白了做人要诚实。",
        answerSource: "official"
      }
    ]
  },

/* =========================================================
   TAO NAN SCHOOL (学校数据 / school data)
   ========================================================= */


  {
    groupId: "TN-HC-G1", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 A组",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "爱迪生的坚持", source: "老师自编",
      text: "爱迪生是闻名世界的“发明大王”，一生的发明共有一千多项。从小，他就 [Q1]___ 很强的好奇心，自学了很多知识。\n\n爱迪生 [Q2]___ 无数次尝试发明电灯，但并没有成功。有人笑他浪费时间，但他不在意，从没有过放弃的念头。为了更快 [Q3]___ 梦想，爱迪生特地请了一个助手协助他。尽管如此，实验结果还是令人失望，而原本对工作充满热情的助手也开始对他失去信心。\n\n面对种种不如意的事，爱迪生仍然继续努力。终于，在一个 [Q4]___ 的冬夜，黑暗的实验室里的灯泡亮了！那一刻，大家都激动地欢呼起来，[Q5]___ 在成功的欢乐中。\n\n词语库：1沉浸 2寒冷 3回忆 4到达 5实现 6曾经 7拥有 8产生"
    },
    questions: [
      { qNo: "Q1", marks: 2, format: "Fill-in",
        text: "从小，他就 ___ 很强的好奇心，自学了很多知识。",
        accepted: ["7", "拥有", "7拥有", "7 拥有"],
        displayAnswer: "7 拥有",
        answerSource: "official"
      },
      { qNo: "Q2", marks: 2, format: "Fill-in",
        text: "爱迪生 ___ 无数次尝试发明电灯，但并没有成功。",
        accepted: ["6", "曾经", "6曾经", "6 曾经"],
        displayAnswer: "6 曾经",
        answerSource: "official"
      },
      { qNo: "Q3", marks: 2, format: "Fill-in",
        text: "为了更快 ___ 梦想，爱迪生特地请了一个助手协助他。",
        accepted: ["5", "实现", "5实现", "5 实现"],
        displayAnswer: "5 实现",
        answerSource: "official"
      },
      { qNo: "Q4", marks: 2, format: "Fill-in",
        text: "终于，在一个 ___ 的冬夜，黑暗的实验室里的灯泡亮了！",
        accepted: ["2", "寒冷", "2寒冷", "2 寒冷"],
        displayAnswer: "2 寒冷",
        answerSource: "official"
      },
      { qNo: "Q5", marks: 2, format: "Fill-in",
        text: "那一刻，大家都激动地欢呼起来， ___ 在成功的欢乐中。",
        accepted: ["1", "沉浸", "1沉浸", "1 沉浸"],
        displayAnswer: "1 沉浸",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "TN-HC-G2", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 B组",
    category: "errorcorrect", lessonEligible: false, lessonIds: [],
    passage: {
      title: "妈妈的建议", source: "老师自编",
      text: "我的妈妈是一名教师，平时工作很忙，但她总是会抽出时间陪我。每当我在学业上遇到困难时，妈妈总是耐心地鼓励我，并给我 [Q6]珍贵 的建议。\n\n记得有一次，我因为考试成绩差而感到难过，妈妈没有生气，而是轻轻地拍拍我的肩膀，安 [Q7](卫) 我说：“失败是成功之母。只要你努力，下次一定会考到好成绩。”妈妈的话让我 [Q8]回复 自信，变得积极起来。\n\n妈妈不仅关心我的学业，也关心我的品格培养。她为人慷 [Q9](既)，时常捐钱给老人院，也时常带我一起做义工。在她的影响下，我变得越来越有爱心。\n\n妈妈让我学会了坚强与感 [Q10](思)。在成长的道路上，无论我遇到什么困难，只要想到妈妈，我就能坚持下去。"
    },
    questions: [
      { qNo: "Q6", marks: 2, format: "Fill-in",
        text: "并给我 珍贵 的建议。 —— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["宝贵"],
        displayAnswer: "宝贵 (宝贵的建议)",
        answerSource: "official"
      },
      { qNo: "Q7", marks: 2, format: "Fill-in",
        text: "安 (卫) 我说：\"失败是成功之母。只要你努力，下次一定会考到好成绩。\" —— 括号里的字是写错的字，请改正。",
        accepted: ["慰"],
        displayAnswer: "慰 (安慰)",
        answerSource: "official",
        notes: "官方打字答案键原文印刷为\"感\"，但根据上下文（\"安___我说：'失败是成功之母……'\"）判断正确答案应为\"慰\"（构成\"安慰\"）；\"慰\"与\"感\"字形皆为上下结构且下半部同为\"心\"部，怀疑原答案key排版/辨识时误植，已按语意订正，建议人工核对原始PDF确认。"
      },
      { qNo: "Q8", marks: 2, format: "Fill-in",
        text: "妈妈的话让我 回复 自信，变得积极起来。 —— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["恢复"],
        displayAnswer: "恢复 (恢复自信)",
        answerSource: "official"
      },
      { qNo: "Q9", marks: 2, format: "Fill-in",
        text: "她为人慷 (既)，时常捐钱给老人院，也时常带我一起做义工。 —— 括号里的字是写错的字，请改正。",
        accepted: ["慨"],
        displayAnswer: "慨 (慷慨)",
        answerSource: "official",
        notes: "官方打字答案键原文印刷为\"概\"，但根据上下文（\"她为人慷___，时常捐钱给老人院\"）判断正确答案应为\"慨\"（构成\"慷慨\"）；\"概\"（木部）与\"慨\"（忄部）字形高度相似、皆以\"既\"为声旁，怀疑原答案key排版/辨识时误植，已按语意订正，建议人工核对原始PDF确认。"
      },
      { qNo: "Q10", marks: 2, format: "Fill-in",
        text: "妈妈让我学会了坚强与感 (思)。 —— 括号里的字是写错的字，请改正。",
        accepted: ["恩"],
        displayAnswer: "恩 (感恩)",
        answerSource: "official",
        notes: "官方打字答案键原文印刷为\"思\"——与括号内的错字完全相同，逻辑上不可能是正确答案。根据上下文（\"学会了坚强与感___\"）判断正确答案应为\"恩\"（构成\"感恩\"）；\"思\"与\"恩\"字形相近（皆为\"心\"部上加一个方框状部件），怀疑原答案key排版/辨识时误植，已按语意订正，建议人工核对原始PDF确认。"
      }
    ]
  },

  {
    groupId: "TN-HC-G3", subject: "Higher Chinese", paper: "Paper 2", section: "二 阅读理解(一)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "老婆婆过马路", source: "老师自编",
      text: "一个早晨，我匆匆向巴士车站赶去，担心着上课会迟到。突然，天空乌云密布，大雨倾盆而下。我急忙撑起伞，加快了脚步，心想：如果十分钟内还没到学校，肯定会被老师批评的。\n\n这时，一只瘦弱冰冷的手抓住了我。我转身一看，竟是一位全身湿透的老婆婆。她手里提着沉重的购物袋，声音微弱地请求我：“小朋友，你可以扶我过马路吗？”我正想答应，脑海中却浮现出老师生气的样子，便放开她的手，向前跑去。\n\n到了巴士车站，我默默回头，只见老婆婆无助地站在路边，整个人像只落汤鸡。眼前的情景让我感到不安：老师和父母常教我们要乐于助人，我怎能忍心不理她呢？\n\n就在这时，“砰”的一声，老婆婆突然跌倒了。她吃力地站起来，伸手想捡起洒落一地的东西。此刻，我不顾一切，冲上去扶起她。我内心充满了后悔和自责，担心她受伤。老婆婆却只是对我微微一笑，说：“谢谢你，小朋友。麻烦你了！”\n\n我撑着伞，在雨中扶着老婆婆过了马路。与她道别后，我立刻赶往巴士车站。这时，我已经迟到了，但我却不后悔。我决心在未来的日子里，无论多忙都要记得停下脚步，去帮助那些需要帮助的人。因为善良和关怀，是我们面对生活风雨最好的力量。"
    },
    questions: [
      { qNo: "Q11", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：小文向哥哥借故事书，哥哥立刻__同意__了。",
        accepted: ["答应"],
        displayAnswer: "答应",
        answerSource: "official"
      },
      { qNo: "Q12", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：弟弟向妈妈保证，__以后__再也不会犯同样的错误了。",
        accepted: ["未来"],
        displayAnswer: "未来",
        answerSource: "official"
      },
      { qNo: "Q13", marks: 2, format: "Long-Answer",
        text: "老婆婆请求作者帮忙时，作者的做法是什么？原因是什么？（试比较老婆婆两次需要帮助时，作者前后不同的做法。）",
        displayAnswer: "作者的做法：放开她的手，向前跑去。原因：担心/怕/不想迟到，被老师批评/骂/脑海中浮现出老师生气的样子。",
        answerSource: "official",
        notes: "官方评分备注：老婆婆两次需要帮助时作者的做法前后不同，若\"作者的做法\"一项写错，则该题（做法+原因）0分；答案须以转述方式作答，若只是照抄原文而未转述，扣0.5分。"
      },
      { qNo: "Q14", marks: 2, format: "Long-Answer",
        text: "老婆婆跌倒时，作者的做法是什么？原因是什么？",
        displayAnswer: "作者的做法：冲上去扶起她。原因：（内心）充满/感到后悔和自责，担心/怕她受伤。",
        answerSource: "official",
        notes: "官方评分备注：老婆婆两次需要帮助时作者的做法前后不同，若\"作者的做法\"一项写错，则该题（做法+原因）0分；答案须以转述方式作答，若只是照抄原文而未转述，扣0.5分。"
      },
      { qNo: "Q15", marks: 4, format: "Long-Answer",
        text: "文中\"眼前的情景\"指的是什么？（2分）为什么它会让作者感到不安？（2分）",
        displayAnswer: "文中\"眼前的情景\"指的是老婆婆无助地站在路边，整个人像只落汤鸡/湿透了。作者想起老师和父母常教他（们）要乐于助人，不应该不理老婆婆/但是他没有去帮助老婆婆。",
        answerSource: "official",
        notes: "官方评分备注：答案须分别完整回答\"是什么\"与\"为什么\"两部分，须使用两个问号、两个句号。"
      },
      { qNo: "Q16", marks: 4, format: "Long-Answer",
        text: "试从以下的两个选项中，选一个最适合作为这篇短文的题目。这两个选项只有一个是适当的，请为正确的答案打钩（✓），并从短文中找出支持你的答案的理由。",
        context: "(1) 《一件令我自责的事》　(2) 《我不后悔做了这个决定》",
        displayAnswer: "(2) 《我不后悔做了这个决定》 ✓\n【起因】作者担心迟到，而没有扶老婆婆过马路。【经过】但他看见老婆婆跌倒了，想到老师和父母教导她要乐于助人，便扶起老婆婆。【结果】他虽然迟到了，但他从这件事明白自己无论多忙，都要去帮助有需要帮助的人。",
        answerSource: "official",
        notes: "官方评分备注：只勾选项而没有解释说明，该题0分。"
      }
    ]
  },

  {
    groupId: "TN-HC-G4", subject: "Higher Chinese", paper: "Paper 2", section: "三 阅读理解(二)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "半截尺子", source: "老师自编",
      text: "去年年终考试前，老师再三提醒同学们要带齐考试用品：“笔、尺子、橡皮，一个都不能少！”“真唠叨！这么简单的事情怎么会忘记？”丽文不耐烦地想，并没有把老师的话放在心上。\n\n考试当天，到了课室，丽文才发现自己竟然忘了带文具盒。她不知如何是好，额头冒出了冷汗。周围的同学已经开始准备文具了。丽文听到他们的嘲笑声“看，她又没有记住老师交代的事情”、“这次考试她惨了”。\n\n坐在丽文前面的小红快速地翻找自己的文具盒，然后拿出备用的笔和橡皮递给丽文。\n\n“同学们，准备好了吗？考试马上就要开始了。”听了老师的话，丽文急得眼泪都快掉下来了。她自言自语道：“还少了一把尺，怎么办？”小红看了看自己文具盒里唯一的一把尺，皱了一下眉，然后抓起它，折成了两半。“这个给你用，这样我们都能用了。”说着，她把半截尺子递给丽文。丽文看着手中的尺子，心里暖暖的。\n\n考试结束后，丽文特意去文具店买了一把一模一样的尺子要还给小红。没想到小红笑着摇摇头：“你自己留着用吧！我家里还有尺。”丽文听了，心里微微一震。\n\n真正的朋友在你遇到困难时，会主动帮助你，并不要求回报。丽文会永远记住这件事，珍惜这份友情。"
    },
    questions: [
      { qNo: "Q17", marks: 2, format: "Long-Answer",
        text: "试解释下面短语在文中的意思：额头冒出了冷汗（第二段）",
        displayAnswer: "丽文在考试时，忘记带文具盒，感到很紧张/不安/担心/害怕/着急/很急/慌张/惊慌失措。",
        answerSource: "official",
        notes: "官方评分备注：答案须包含\"谁\"、\"原因\"、\"心情\"三要素，不可重复使用关键词。"
      },
      { qNo: "Q18", marks: 2, format: "Long-Answer",
        text: "试解释下面短语在文中的意思：心里暖暖的（第四段）",
        displayAnswer: "丽文看到小红把尺子折成两半，把半截尺子递给她，心里很感动。",
        answerSource: "official",
        notes: "官方评分备注：答案须包含\"谁\"、\"原因\"、\"心情\"三要素，不可重复使用关键词。"
      },
      { qNo: "Q19", marks: 3, format: "Long-Answer",
        text: "丽文对老师的提醒有什么看法？",
        displayAnswer: "丽文认为/觉得/心想老师真唠叨，带文具那么简单的事，不可能会忘记。",
        answerSource: "official",
        notes: "官方评分备注：须直接回答，不可用\"丽文对老师的提醒有……看法\"的句式作答，否则视为病句。"
      },
      { qNo: "Q20", marks: 4, format: "Long-Answer",
        text: "发现丽文忘记带文具时，其他同学和小红的反应有什么不同？",
        displayAnswer: "其他同学嘲笑丽文又没记住老师交代的事，这次考试她惨了。小红快速地翻找自己的文具盒，然后拿出备用的笔和橡皮递给丽文。",
        answerSource: "official",
        notes: "官方评分备注：人物（其他同学/小红）对应错误，该项0分。"
      },
      { qNo: "Q21", marks: 4, format: "Long-Answer",
        text: "请用不超过18个字，写出短文中第五段的段落大意。",
        displayAnswer: "小红不接受丽文买的尺，丽文觉得很感动。",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 4, format: "Long-Answer",
        text: "小红怎么解决丽文没有尺子的问题？（1分）她一开始就决定用这个方法来解决问题吗？从哪里可以看出？（3分）",
        displayAnswer: "小红把自己唯一的一把尺折成两半，然后把半截尺子递给丽文。她一开始不想/没有决定用这个方法解决问题，从哪里可以看出：小红看了看自己文具盒里唯一的一把尺，皱了一下眉。",
        answerSource: "official",
        notes: "官方评分备注：没有立场，即使有解释，0分；有立场但没解释/解释错误，0分；需使用三个问号、三个句号；不要写\"从\"，直接回答。"
      },
      { qNo: "Q23", marks: 5, format: "Long-Answer",
        text: "你从这篇短文中学到了什么道理？（2分）试举一个例子说明你如何把这个道理应用在生活中。（3分）",
        displayAnswer: "（示例答案，学生可自由发挥，只要贴题即可）我学到了在朋友遇到困难时，要主动帮助他，并不要求回报。有一次，我的朋友小文忘了带钱包，我主动请他吃饭，隔天他想请我吃汉堡，但我拒绝了，还说帮助朋友是应该的。",
        answerSource: "official",
        notes: "官方评分备注：假设性例子可以接受；例子必须明确具体，不可笼统地讲道理。本题为开放式意见题，官方仅提供示例答案，学生答案只要言之成理、贴合主题即可给分。"
      }
    ]
  },

/* =========================================================
   ST HILDA'S PRIMARY SCHOOL (学校数据 / school data)
   ========================================================= */


  {
    groupId: "SH-HC-G1", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 A组",
    category: "cloze", lessonEligible: false, lessonIds: [],
    passage: {
      title: "李明的电影梦", source: "老师自编",
      text: "李明念大学时参加学校的电影学会，并在空闲时举办电影活动。\n\n虽然许多人想当[Q1]___的导演，但李明将来想当制片人，负责安排一切，让电影拍得更顺利。他认为制片人也是电影制作很重要的部分，需要与导演、演员和其他工作人员相互[Q2]___，才能完成一部好作品。\n\n他认为新加坡有许多有才华的电影工作者，但他们的作品常要在国外的电影比赛中[Q3]___表扬后，才会得到新加坡观众的注意。\n\n一些人会批评李明花太多时间在兴趣上，而不是学习，对他[Q4]___，但李明并不受这些话的影响。他认为只有不断追求理想，生活才能变得[Q5]___。\n\n词语库：1兴奋 2著名 3配合 4指指点点 5获得 6充实 7争取 8七嘴八舌"
    },
    questions: [
      { qNo: "Q1", marks: 2, format: "Fill-in",
        text: "虽然许多人想当___的导演，但李明将来想当制片人，负责安排一切，让电影拍得更顺利。",
        accepted: ["2", "著名", "2著名", "2 著名"],
        displayAnswer: "2 著名",
        answerSource: "official"
      },
      { qNo: "Q2", marks: 2, format: "Fill-in",
        text: "他认为制片人也是电影制作很重要的部分，需要与导演、演员和其他工作人员相互___，才能完成一部好作品。",
        accepted: ["3", "配合", "3配合", "3 配合"],
        displayAnswer: "3 配合",
        answerSource: "official"
      },
      { qNo: "Q3", marks: 2, format: "Fill-in",
        text: "他认为新加坡有许多有才华的电影工作者，但他们的作品常要在国外的电影比赛中___表扬后，才会得到新加坡观众的注意。",
        accepted: ["5", "获得", "5获得", "5 获得"],
        displayAnswer: "5 获得",
        answerSource: "official"
      },
      { qNo: "Q4", marks: 2, format: "Fill-in",
        text: "一些人会批评李明花太多时间在兴趣上，而不是学习，对他___，但李明并不受这些话的影响。",
        accepted: ["4", "指指点点", "4指指点点", "4 指指点点"],
        displayAnswer: "4 指指点点",
        answerSource: "official"
      },
      { qNo: "Q5", marks: 2, format: "Fill-in",
        text: "他认为只有不断追求理想，生活才能变得___。",
        accepted: ["6", "充实", "6充实", "6 充实"],
        displayAnswer: "6 充实",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "SH-HC-G2", subject: "Higher Chinese", paper: "Paper 2", section: "一 语文应用 B组",
    category: "errorcorrect", lessonEligible: false, lessonIds: [],
    passage: {
      title: "陪伴老人", source: "老师自编",
      text: "王小云是一名大学生。两年前她主动到老人院陪伴老人，为各族老人增[Q6](天)欢乐。\n\n“在老人院呆久了，老人会觉得很闷，心情变差。”她解释道。她十分[Q7]珍贵与老人相处的时光，并从2023年12月起为老人举办节庆活动。\n\n活动中，她带领老人玩拼图、跳舞。看到老人们从烦[Q8](脑)中走出来，脸上重现笑容，她深感愉快。“有位马来族奶奶常常请大家吃她亲手煮的马来炒面，大家吃了都觉得很快乐。她这种与他人[Q9]分担的精神让我明白，善良不分年龄。”她笑着说。老人常[Q10](斗)得她开怀大笑，让她很想继续在老人院帮忙。"
    },
    questions: [
      { qNo: "Q6", marks: 2, format: "Fill-in",
        text: "为各族老人增（天）欢乐。—— 括号里的字是写错的字，请改正。",
        accepted: ["添"],
        displayAnswer: "添 (增添)",
        answerSource: "official"
      },
      { qNo: "Q7", marks: 2, format: "Fill-in",
        text: "她十分珍贵与老人相处的时光。—— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["珍惜"],
        displayAnswer: "珍惜",
        answerSource: "official"
      },
      { qNo: "Q8", marks: 2, format: "Fill-in",
        text: "看到老人们从烦（脑）中走出来，脸上重现笑容。—— 括号里的字是写错的字，请改正。",
        accepted: ["恼"],
        displayAnswer: "恼 (烦恼)",
        answerSource: "official"
      },
      { qNo: "Q9", marks: 2, format: "Fill-in",
        text: "她这种与他人分担的精神让我明白，善良不分年龄。—— 画线词语中有一个字用得不恰当，请改正。",
        accepted: ["分享"],
        displayAnswer: "分享",
        answerSource: "official"
      },
      { qNo: "Q10", marks: 2, format: "Fill-in",
        text: "老人常（斗）得她开怀大笑，让她很想继续在老人院帮忙。—— 括号里的字是写错的字，请改正。",
        accepted: ["逗"],
        displayAnswer: "逗",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "SH-HC-G3", subject: "Higher Chinese", paper: "Paper 2", section: "二 阅读理解(一)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "迟来的责任感", source: "老师自编",
      text: "一年一度的学校艺术节到来了！同学们得根据课本的故事，上台表演。老师把全班分成五人一组，小丽和明华在同一组。小丽鼓励大家：“只要用心准备，我们就能呈现最精彩的表演！”明华却不把这次活动放在心上，说：“小菜一碟！这么简单的故事，我看一遍就会了。”\n\n接下来的几天，小丽每天一早就来排练，还带着组员们练台词。她提醒大家什么时候上场、应该怎么演，连动作和表情也细心指导。她觉得每个组员都会影响表演的成功，只有大家对小组负责，才能把这场戏演好。可明华觉得她唠叨，总是笑着说：“我不用练也能在当天演得很棒。”排练时他东张西望，常说错台词。小丽见了，有些着急，但还是耐心地劝他说：“大家都要认真准备，表演才会成功。”明华只是笑了笑，依然不当一回事。\n\n表演那天，小丽穿好戏服，在后台默记台词，认真练习。明华匆匆赶来，戏服还穿反了。他拿着课本，只随便翻了两页。\n\n上台后，小丽演得非常精彩，赢得观众热烈的掌声。听见掌声，小丽心里充满了自豪，她知道这是她努力练习的成果。\n\n轮到明华时，他突然忘了台词，急得满头大汗。小丽赶紧悄悄提醒，他才接了下去，可后面还是出现了好几处错误。台下的观众不禁露出失望的神情。\n\n下台后，明华低着头，鼓起勇气说：“对不起，我太不负责任了，早知道就该好好练了……”小丽终于忍不住，瞪着明华，指责道：“如果你早点对团队负责，我们也不会落到如此下场。表演已经结束，再也没有下次了！”明华听了，顿时沉默了下来，眼里闪过一丝后悔。"
    },
    questions: [
      { qNo: "Q11", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：虽然他的成绩很好，但他__还是__努力追求更好。",
        accepted: ["依然"],
        displayAnswer: "依然",
        answerSource: "official"
      },
      { qNo: "Q12", marks: 2, format: "Fill-in",
        text: "从短文中找出与下列画线词语意思相近或相同的词语：看到孩子得到比赛的冠军，爸爸妈妈都感到很__骄傲__。",
        accepted: ["自豪"],
        displayAnswer: "自豪",
        answerSource: "official"
      },
      { qNo: "Q13", marks: 2, format: "Long-Answer",
        text: "试比较观众对小丽和明华表演的反应，并说明原因：观众对小丽的表演有什么反应？原因是什么？",
        displayAnswer: "观众的反应：感到满意，报以热烈的掌声。原因：小丽演得非常精彩（这是她努力练习的成果）。",
        answerSource: "official",
        notes: "官方答案原文以 '小丽的表演满意 > 表演得很精彩' 的简写形式呈现，已根据短文内容重新整理为完整的'反应+原因'表述。"
      },
      { qNo: "Q14", marks: 2, format: "Long-Answer",
        text: "试比较观众对小丽和明华表演的反应，并说明原因：观众对明华的表演有什么反应？原因是什么？",
        displayAnswer: "观众的反应：感到失望，露出失望的神情。原因：明华突然忘词，表演中出现了好几处错误。",
        answerSource: "official",
        notes: "官方答案原文以 '明华的表演 > 失望忘词 > 出现了好几处错误' 的简写形式呈现，已根据短文内容重新整理为完整的'反应+原因'表述。"
      },
      { qNo: "Q15", marks: 4, format: "Long-Answer",
        text: "小丽有没有接受明华的道歉？（1分）为什么？（3分）",
        displayAnswer: "没有接受。因为明华之前排练时态度不认真，没有为表演做好准备，影响了整体的表演，明华这种不负责任的行为让小丽感到很生气，所以她还不能接受明华的道歉。",
        answerSource: "official"
      },
      { qNo: "Q16", marks: 4, format: "Long-Answer",
        text: "试从所提供的两个选项中，选一个最适合的作为这篇短文的题目，并举例说明做出这个选择的理由。",
        context: "(1) 一场成功的表演\n(2) 迟来的责任感",
        displayAnswer: "(2) 迟来的责任感。起因：小丽和明华被分到同一组表演。经过：明华排练时很不认真，虽然小丽劝他要认真练习，但他依然不当一回事。结果：表演时，明华在台上忘词，这才让他明白到应该对团队负责。",
        answerSource: "official"
      }
    ]
  },

  {
    groupId: "SH-HC-G4", subject: "Higher Chinese", paper: "Paper 2", section: "三 阅读理解(二)",
    category: "comprehension", lessonEligible: false, lessonIds: [],
    passage: {
      title: "山间雨伞", source: "老师自编",
      text: "去年，我陪妈妈去爬山。\n\n刚出发不久，就下起了小雨。这下惨了！我们赶紧走到树下避雨。妈妈突然指着草丛对我说：“你看，那是什么？”\n\n我顺着她指的方向望去，没想到竟然会在这山区发现一把红色的雨伞躺在草丛中！\n\n我走过去撑开伞一看，“还是一把新雨伞呢！”我惊喜地说。妈妈说：“幸好有这把伞。”我们继续前行。\n\n下山时，雨才停住。我心想：这一路上拿把雨伞多不方便呀，便随手把雨伞扔进垃圾桶。妈妈见了，命令道：“你快去把雨伞拿回来！”\n\n我心里有些不高兴：“这把雨伞本来就不是我们的，拿去游客中心又不方便，扔掉算了。”\n\n妈妈没理睬我，自己拿过雨伞：“你带纸了吗？”\n\n我不解地摇摇头。\n\n“你的名片呢？给我一张。”\n\n我取出一张名片递给她。妈妈写了些东西后，便说：“你把名片夹在伞里面，再把这把伞立在那棵树旁。经过的人多，容易注意到。”\n\n我照她的话去做了。名片背面的留言是：“你用过这把伞后，请把它放在容易被看到的地方，让它继续传递温暖。”\n\n几天前，我收到了一张明信片。明信片上没有寄信人的地址，也没有写上名字。\n\n明信片写着几行字：“亲爱的陌生朋友，您留在路边的那把红色雨伞，让我们感受到了世间的温暖与真爱。永远祝福你！”\n\n看到这段话，我心里暖暖的。"
    },
    questions: [
      { qNo: "Q17", marks: 2, format: "Long-Answer",
        text: "试解释短语“这下惨了”（第二段）在文中的意思。",
        displayAnswer: "当时下起了小雨，作者和妈妈没带伞，他担心会被雨淋湿。",
        answerSource: "official"
      },
      { qNo: "Q18", marks: 2, format: "Long-Answer",
        text: "试解释短语“让它继续传递温暖”（第十一段）在文中的意思。",
        displayAnswer: "用过这把伞的人将伞传给下一个人，让下一个人感受到关爱。",
        answerSource: "official"
      },
      { qNo: "Q19", marks: 3, format: "Long-Answer",
        text: "为什么作者看到雨伞时会感到意外？",
        displayAnswer: "因为作者没想到会在山上（这山区）发现一把新的雨伞。",
        answerSource: "official"
      },
      { qNo: "Q20", marks: 4, format: "Long-Answer",
        text: "下山后，作者和妈妈分别觉得应该怎么处理那把伞？为什么他们这么认为？",
        displayAnswer: "作者认为伞用完后可以扔掉，因为他觉得伞不是他们的，拿去游客中心又不方便。妈妈认为应该把伞放在容易被看到的地方，并在名片上留言，因为妈妈认为伞可以帮助其他人。",
        answerSource: "official"
      },
      { qNo: "Q21", marks: 4, format: "Long-Answer",
        text: "请用不超过15个字，写出短文中第五段的段落大意。",
        displayAnswer: "雨停后，“我”扔了伞，妈妈命令“我”取回。",
        answerSource: "official"
      },
      { qNo: "Q22", marks: 4, format: "Long-Answer",
        text: "作者收到来自谁的明信片？（1分）看到明信片上的留言，为什么会让他心里暖暖的？（3分）",
        displayAnswer: "作者收到的明信片来自使用过雨伞的人。因为作者发现妈妈留下的雨伞真的帮助到了别人，而且这个人特意写明信片表达祝福，让作者觉得很感动。",
        answerSource: "official"
      },
      { qNo: "Q23", marks: 5, format: "Long-Answer",
        text: "这篇短文告诉了我们什么道理？（2分）试举生活中的例子加以说明。（3分）",
        displayAnswer: "这篇短文告诉我们，我们获得了帮助后应该帮助别人。（举例仅供参考）有一次，我忘了带笔，朋友借我笔用。之后，我看到其他同学没带笔时，想到别人曾经帮助过我，也将自己的笔借给他用。",
        answerSource: "official",
        notes: "前半部分（道理）为短文中可归纳的固定要点，后半部分（生活例子）为学生个人开放式作答，本答案仅为示例。"
      }
    ]
  },
];
