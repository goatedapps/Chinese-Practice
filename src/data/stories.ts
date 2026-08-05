// Data for the "Read a Story" mode (components/Story/) -- one illustrated-
// story-style passage per lesson, broken into pages ("segments") that the
// reader flips through one at a time, plus each page broken into individual
// sentences so a student can tap just one sentence to hear it in isolation.
// Unlike Tingxie's lesson content (fetched at runtime from
// public/tingxie-lessons/*.json), this is small enough to bundle directly as
// TS data -- no need for the fetch-on-demand pattern.
//
// Sentence splitting is done by hand when authoring a lesson's `segments`,
// not by a runtime regex splitter -- Chinese dialogue punctuation (a “…”
// quote spanning multiple sentence-ending marks) doesn't split cleanly with
// a generic rule, so each lesson's sentence boundaries are a one-time
// authorial choice baked into the data.
import { LESSON_COUNT } from "./questions";

// A page groups one or more of the original story's paragraphs -- every page
// should have at least 3 sentences (a short paragraph on its own would make
// too sparse a page), so short consecutive paragraphs are merged onto the
// same page while a paragraph boundary itself is always preserved for
// rendering (each renders as its own <p>, see StoryReader). This means a
// page is *not* always exactly one paragraph, unlike the very first version
// of this data.
export interface StorySegment {
  paragraphs: string[][]; // each inner array is one paragraph's sentences
}

export interface StoryLesson {
  id: number;
  title: string;
  segments: StorySegment[];
  // True for a lesson whose real story hasn't been written yet -- see
  // placeholderLesson() below. Lets the lesson picker show a "coming soon"
  // badge without needing a separate "does this lesson have content" check.
  placeholder?: boolean;
}

export function segmentSentences(segment: StorySegment): string[] {
  return segment.paragraphs.flat();
}

function placeholderLesson(id: number): StoryLesson {
  return {
    id,
    title: `第 ${id} 课的故事`,
    placeholder: true,
    // Not held to the "at least 3 sentences per page" guideline that applies
    // to real authored lessons below -- it's stub content, not something
    // meant to be read as an actual passage.
    segments: [{ paragraphs: [["这篇课文即将推出，请稍候。This story is coming soon — check back later."]] }]
  };
}

const LESSON_1: StoryLesson = {
  id: 1,
  title: "消失的“宝物”",
  segments: [
    {
      paragraphs: [
        ["暑假到了，学校组织去森林露营、探险和攀岩。"],
        ["出发前老师提醒：“带好袜子和手电筒来防止蚊虫。", "绝对不能单独行动，也禁止带贵重物品！”"]
      ]
    },
    {
      paragraphs: [
        ["到了营地，大家集合参加两人三足竞赛。"],
        ["“我们一定要拿冠军！”", "小强兴奋地把我的脚和他绑在一起。"]
      ]
    },
    {
      paragraphs: [
        ["“没问题，齐心协力，互相配合！”", "我大喊。"],
        ["比赛中，小强不小心摔倒了。", "大家轮流扶起他，他擦干汗水，继续往前冲。", "那一刻我感到无比自豪。"]
      ]
    },
    {
      paragraphs: [
        ["玩累后，面对香喷喷的排骨，大家狼吞虎咽，很快吃完了一顿饭。"],
        ["突然，小强尖叫：“糟了！", "我的‘贵重宝物’掉了！”"]
      ]
    },
    {
      paragraphs: [
        [
          "违反规则带了贵重物品？",
          "大家倒吸一口凉气，但为了帮他，我们决定一起返回森林寻找。",
          "这时已是黄昏，我们来到一望无际的海边，夕阳映着高高的椰树，小强终于在树下翻出一个盒子。"
        ]
      ]
    },
    {
      paragraphs: [
        ["“找到了！”", "他松了一口气。"],
        ["大家凑近一看，里面竟然是一根啃得干干净净的排骨骨头！", "小强不好意思地笑：“这是我妈妈做的，我想留着当零食……”"],
        ["大家先是一愣，随即哈哈大笑，这真是一次难忘的经历！"]
      ]
    }
  ]
};

const LESSON_2: StoryLesson = {
  id: 2,
  title: "奇怪的检查",
  segments: [
    {
      paragraphs: [
        ["小明有一个坏习惯，喜欢在昏暗的房间里玩电脑，眼睛贴得非常近，完全没有保持安全的距离。"],
        ["今天，他觉得眼睛又干又疼，视力下降得厉害，看东西都很模糊。", "不仅如此，他还不停地咳嗽，整个人看起来很惨，黑眼圈也很重。", "妈妈赶紧带他去诊所看医生。"]
      ]
    },
    {
      paragraphs: [
        ["到了诊所，医生让小明做视力测试。"],
        ["“请坐在隔壁的椅子上，盯着墙上的图表。”", "医生指着前面的格子说，“请说出这个箭头代表的方向，抛开顾虑，说出你的答案。”"]
      ]
    },
    {
      paragraphs: [
        ["小明用力眨眼，填写表格时连号码都差点看错。"],
        ["他小声说：“我看不清，我是不是快要瞎了？”"]
      ]
    },
    {
      paragraphs: [
        ["医生笑了笑，正确地记录下数据，拍拍他的肩膀说：“别担心，你只是眼睛太累了，没有受到永久伤害。”"],
        ["“你平时要在户外多放松，而且少看屏幕。”"]
      ]
    },
    {
      paragraphs: [
        ["小明松了一口气，决定以后一定要好好保护眼睛！"]
      ]
    }
  ]
};

const LESSON_3: StoryLesson = {
  id: 3,
  title: "难忘的神秘大餐",
  segments: [
    {
      paragraphs: [
        ["周六家里举办聚会，大家都在欢声笑语中准备材料。"],
        ["我把黄瓜剪成各种形状，放在盘子里，妈妈则负责把紫菜放入锅里炒。"],
        ["爸爸站在一旁，把盐和调味料倒进碗里认真地搅拌。"]
      ]
    },
    {
      paragraphs: [
        ["突然，我不小心把一大包盐全都撒进了锅里，犯了一个大错误！"],
        ["原本热闹的厨房顿时变得鸦雀无声，大家都愣住了。"],
        ["我心里满是烦恼，急得左顾右盼，眼泪像要掉下来似的。"]
      ]
    },
    {
      paragraphs: [
        ["看到我难过的样子，平时沉默寡言的爸爸走过来安慰我。"],
        ["他说：“别慌，我们要爱惜食物，看看怎么化险为夷！”"]
      ]
    },
    {
      paragraphs: [
        ["妈妈灵机一动，加水把菜做成了美味的紫菜汤！"],
        ["大家尝了一口，异口同声地夸赞：“太好喝了！”"],
        ["虽然大家都很劳累，但收到了亲友送来的贺卡与祝福，心里甜滋滋的。"],
        ["爸爸还打趣说，我已经懂事得可以去领身份证啦！"]
      ]
    }
  ]
};

const LESSON_4: StoryLesson = {
  id: 4,
  title: "神奇的石头汤",
  segments: [
    {
      paragraphs: [
        ["在一个宁静的村子里，住着一群自私的人，大家对陌生人很冷淡。"],
        ["一天，一位旅行者来到村里的井边，大家正愁眉苦脸地抱怨缺少食物。"]
      ]
    },
    {
      paragraphs: [
        ["旅行者笑着拿出两个空锅开始烧水，并敲响了大钟，邀请大家来喝神奇的“石头汤”。"],
        ["村民们觉得很奇怪，纷纷围了过来。"]
      ]
    },
    {
      paragraphs: [
        ["旅行者说：“汤里必须放新鲜蔬菜和肉类，还在有效期内、存放冷冻室的最好。”"],
        ["大家一听，纷纷回家拿来水饺、果汁和饼干捐出来。"]
      ]
    },
    {
      paragraphs: [
        ["旅行者和妻子捧着大锅，撒上香料，大家一边聊天一边喝汤，过得非常愉快。"],
        ["喝完汤，大家连酒类都不喝了，烦恼一溜烟全跑光了！"]
      ]
    }
  ]
};

const LESSON_5: StoryLesson = {
  id: 5,
  title: "小猫惹祸了",
  segments: [
    {
      paragraphs: [
        ["小明家养了一只活泼的小猫，经常逗得大家哈哈大笑。"],
        ["小明视它为心中的珍宝，并为它骄傲，但也常因它不听话而产生矛盾。"]
      ]
    },
    {
      paragraphs: [
        ["今天，小猫又闯祸了！它在客厅里追逐，一秒钟内就把桌上的花瓶撞成了碎片。"],
        ["听到响声，爸爸神情严肃，呼吸也变得急促起来。"]
      ]
    },
    {
      paragraphs: [
        ["感到愤怒的爸爸怀疑是小明干的，小明心里火辣辣的，不禁积极地解释并避开责骂。"],
        ["看到小猫躲在角里的样子，爸爸也不再抱怨。"]
      ]
    },
    {
      paragraphs: [
        ["遇到问题要冷静，爸爸根据这次“测试”，给小猫打招呼做训练，家里的怒气很快就烟消云散，气氛又旺了起来。"]
      ]
    }
  ]
};

const LESSON_6: StoryLesson = {
  id: 6,
  title: "失而复得的皮包",
  segments: [
    {
      paragraphs: [
        ["清晨的阳光洒在街道上，巴士在路上轻微地摇晃着，行驶得非常稳。"],
        ["小明坐在座位上，看着窗外的风景不断倒退，脑海里浮现出童年的许多回忆。"],
        ["巴士停站后，乘客们争先恐后地挤上车，拿出车资卡刷卡乘车。"]
      ]
    },
    {
      paragraphs: [
        ["这时，小明看到一位老妇人急得傻傻地站在原地发呆。"],
        ["老妇人翻遍了口袋，慌张地说：“怎么办？我的皮包不见了！里面有我的电话号码，还有一叠钞票和好多硬币呢！”"],
        ["小明见状，决定主动帮忙去寻寻找。"]
      ]
    },
    {
      paragraphs: [
        ["他来到街边的小贩摊位前询问，看到一个银色的皮包正掉在地上。"],
        ["一个小偷正准备伸手拿走，小明立刻上前阻拦：“住手！那是那位老人的！”"],
        ["小偷见事情败露，一溜烟跑掉了。"]
      ]
    },
    {
      paragraphs: [
        ["小明拾起皮包归还给老妇人，并帮她联系了家人。"],
        ["老妇人感激地说：“你真是个诚实又善良的好孩子，省了我好多麻烦！”"],
        ["路旁的花香随风飘来，大家不约而同地为小明的义举鼓掌，小明心里暖洋洋的。"]
      ]
    }
  ]
};

const LESSON_7: StoryLesson = {
  id: 7,
  title: "小鲸鱼的大冒险",
  segments: [
    {
      paragraphs: [
        ["广阔无边的大洋里，生活着许多海洋生物。"],
        ["小鲸鱼喜欢从深海游到浅海玩耍，它的头顶会喷出巨大的水柱，非常壮观。"],
        ["它的皮肤上有一层厚厚的海藻，体重足足有几千公斤呢！"]
      ]
    },
    {
      paragraphs: [
        ["有一天，小鲸鱼玩得太开心，不知不觉游到了岸边，不幸搁浅在沙滩上。"],
        ["阳光烈日下，小鲸鱼大口大口地喘着气，如果不赶快回到水里，它大概很快就会死掉。"],
        ["小鲸鱼的鼻孔艰难地呼吸着，心里十分害怕。"]
      ]
    },
    {
      paragraphs: [
        ["路过的村民发现了它，激动地喊道：“快来帮忙啊！这里有只小鲸鱼搁浅了！”"],
        ["大家纷纷拿来水桶向它身上泼水，甚至搬来了抽水机，把它的衣服和全身都湿透了。"],
        ["大家用大帆布盖在小鲸鱼身上，防它被晒伤。"]
      ]
    },
    {
      paragraphs: [
        ["终于等到了海水涨潮，一波又一波的海浪冲了上来。"],
        ["小鲸鱼顺着海浪慢慢悬浮起来，渐渐恢复了活力。"],
        ["一辆大船载着村民在旁边守护着，小鲸鱼在水里徘徊了一会儿，依依不舍地向大家挥挥尾巴，最后消失在了蓝色的海浪中。"]
      ]
    }
  ]
};

const LESSON_8: StoryLesson = {
  id: 8,
  title: "未来的机器人伙伴",
  segments: [
    {
      paragraphs: [
        ["光阴似箭，一寸光阴一寸金，时间总是匆匆溜走。"],
        ["在不久的未来，陆地上的科技变得非常发达。"],
        ["人们不仅在网络上交流，还制造出了能听懂汉字的高科技机器人。"]
      ]
    },
    {
      paragraphs: [
        ["小华是一个看起来有点瘦弱的小男孩，曾经因为考试输了比赛而感到悲伤。"],
        ["他的妈妈为了鼓励他，买了一个智能机器人回家。"],
        ["这个机器人虽然外表机械，但似乎能看懂小华的心思。"]
      ]
    },
    {
      paragraphs: [
        ["机器人不仅把小华的房间整理得井井有条，还帮他制定了严格的学习计划。"],
        ["“一眨眼时间就过去了，我们要学会节省时间！”机器人用幽默的声音提醒他。"],
        ["小华笑着说：“有你在，我感觉自己永远不会孤单了。”"]
      ]
    },
    {
      paragraphs: [
        ["此前，小华总是缺乏信心，但在此后机器人的陪伴下，他的成绩突飞猛进。"],
        ["最终，小华在学术竞赛中赢得了第一名，成功登上了领奖台。"],
        ["他在雪地上留下了坚定的足迹，决心要依然保持这份努力与热情。"]
      ]
    }
  ]
};

const LESSON_9: StoryLesson = {
  id: 9,
  title: "花木兰的新传奇",
  segments: [
    {
      paragraphs: [
        ["周末，民众俱乐部里张灯结彩，热闹非凡。"],
        ["这里正在上演一部关于英雄花木兰的戏剧，为社区增添了不少欢声笑语。"],
        ["观众们排队订票，听说今天的戏票价格便宜，对老人甚至免费呢！"]
      ]
    },
    {
      paragraphs: [
        ["舞台上，扮演花木兰的演员精心装扮，威风凛凛。"],
        ["故事讲的是花木兰为了替年老的花老爹去打仗，女扮男装去前线杀敌。"],
        ["她的这份孝心深深打动了家乡的每一个人。"]
      ]
    },
    {
      paragraphs: [
        ["战场上，狂风大作，顶着烈日，条件非常艰苦。"],
        ["叮的一声，兵器相交，木兰奋勇攻敌，不仅成功败敌得胜，还救下了将要受伤的同伴。"],
        ["大家都夸赞她是真正的女英雄。"]
      ]
    },
    {
      paragraphs: [
        ["演出结束后，演员们在台上喝着矿泉水休息。"],
        ["小明跑过去，兴奋地说：“我也要像木兰一样，代替爸爸做家务，做一个有孝心的大英雄！”"],
        ["大家听了都哈哈大笑起来。"]
      ]
    }
  ]
};

const LESSON_10: StoryLesson = {
  id: 10,
  title: "小明的特别一天",
  segments: [
    {
      paragraphs: [
        ["小明最近迷上了玩手机游戏，简直上瘾了，根本控制不住自己。"],
        ["他整天躲在房间里，甚至戴上了隐形眼镜玩，结果脸上冒出了不少痘痘。"],
        ["妈妈看在眼里，不停地在他耳边唠叨，提醒他要注意休息。"]
      ]
    },
    {
      paragraphs: [
        ["一天，小明想搞个恶作剧，故意用手遮住脸，假装被同学嘲笑。"],
        ["妈妈见状，心疼地帮他推拿酸痛的腰，还拿刷子帮他洗净碗碟，准备了一顿非常丰盛的晚餐。"],
        ["小明小心翼翼地用筷子夹起一块肉，看着妈妈疲惫的身影，心里感到一阵惭愧。"]
      ]
    },
    {
      paragraphs: [
        ["他想起电视里的农夫在田间辛苦耕作，再比较一下自己现在的生活，才发现自己拥有这么温暖的家。"],
        ["他决定改变自己，打热线电话咨询了健康专家，制定了一段合理的作息计划。"]
      ]
    },
    {
      paragraphs: [
        ["小明把具体的地址写在卡片上，提醒自己按时去户外运动。"],
        ["那一刻，他心中充满了感恩，再也不贪玩了！"]
      ]
    }
  ]
};

const LESSON_11: StoryLesson = {
  id: 11,
  title: "篮球场上的误会",
  segments: [
    {
      paragraphs: [
        ["学校组织了一场篮球比赛，时间截止到本周五，报名名额非常有限。"],
        ["比赛要求从零起点至初级水平的同学都可以参加。"],
        ["老师给每个人发了一份详细的比赛手册。"]
      ]
    },
    {
      paragraphs: [
        ["比赛时，小刚为了抢球，猛地扑了过去。"],
        ["没想到他不小心撞到了小明，两人一下子扭打在一起。"],
        ["小刚拉扯间把小明的衬衫扣子给扯掉了，连衣服都撕破了一角。"]
      ]
    },
    {
      paragraphs: [
        ["小明捂着受伤的肩膀，气得狠狠地瞪着小刚，心里满是恨意。"],
        ["小刚连忙灵活地躲闪，解释道：“对不起，我不是故意的啦！我是想尽早把球传出去！”"]
      ]
    },
    {
      paragraphs: [
        ["看到小刚诚恳的态度，小明摸了摸发疼的胸口，气也消了大半。"],
        ["这使他们意识到了彼此友谊的珍贵，两人握手言和，重新投入到比赛中。"]
      ]
    }
  ]
};

const LESSON_12: StoryLesson = {
  id: 12,
  title: "难忘的国庆夜",
  segments: [
    {
      paragraphs: [
        ["假期里，小华拿着游览手册，来到了新加坡著名的滨海湾。"],
        ["这里的街道宽阔，连路旁的小巷都整洁美丽。"],
        ["这里是他心中唯一最棒、最佳的游玩胜地。"]
      ]
    },
    {
      paragraphs: [
        ["广场上早已排列着整齐的队伍，大家满怀期待地盼望表演的开始。"],
        ["突然，刺耳的轰鸣声划破天空，几架战斗机排成阵型从头顶飞过，呈献了精彩绝伦的空飞行表演。"],
        ["观众们无不感到无比骄傲与自豪。"]
      ]
    },
    {
      paragraphs: [
        ["随着夜幕降临，整个滨海湾开始燃放起五彩缤纷的烟花。"],
        ["绚丽的烟火照亮了夜空，全场沉浸在一片欢乐喜庆的气氛中。"]
      ]
    },
    {
      paragraphs: [
        ["这一刻的美景深深刺中了小华的心，让他久久不能忘怀。"]
      ]
    }
  ]
};

const LESSON_13: StoryLesson = {
  id: 13,
  title: "汉字的秘密",
  segments: [
    {
      paragraphs: [
        ["在漫长的历史长河中，古人发明了甲骨文来记录生活。"],
        ["这些刻在龟甲和兽骨头上的文字，构成了神奇的汉字世界，产生了独特的书法艺术。"]
      ]
    },
    {
      paragraphs: [
        ["据官方统计，全世界的汉字不仅有数万个，甚至包含了数以亿计的组合变化。"],
        ["小明走在狭窄的巷子里，去向一位老学者询问汉字的起源。"]
      ]
    },
    {
      paragraphs: [
        ["老学者拿出一块墨，顺手派人取来古籍。"],
        ["看到小明一脸怀疑的样子，老学者笑着解释道：“古代的官员甲和乙在沟通时，全靠这些符号。”"]
      ]
    },
    {
      paragraphs: [
        ["小明听完忍不住叹了一口气，恍然大悟！"],
        ["他深深佩服古人的智慧，决定绝对不违抗老师的教导，好好把汉字学下去。"]
      ]
    }
  ]
};
const LESSON_14: StoryLesson = {
  id: 14,
  title: "小罗的蜕变",
  segments: [
    {
      paragraphs: [
        ["小罗是个顽皮的孩子，平时总爱混在人群里开玩笑。"],
        ["他的偶像是一位辛勤培育学生的老师，经常写诗鼓励大家。"],
        ["在一次测试中，同学甲、乙、丙都取得了优异的成绩，凡是积极努力的人都得到了表扬。"]
      ]
    },
    {
      paragraphs: [
        ["偏偏小罗因为粗心犯错了，脸颊顿时发烫，连额头都冒出了冷汗。"],
        ["心里一阵委屈涌上心头，他真想找个地缝钻进去。"]
      ]
    },
    {
      paragraphs: [
        ["老师温柔地走到他身边，没有批评他，反而默默地为他祈祷。"],
        ["老师鼓励他：“只要你加倍努力，就一定能恢复信心，取得好成绩！”"]
      ]
    },
    {
      paragraphs: [
        ["小罗深受感动，决定并付诸行动，再也不偷懒了。"]
      ]
    }
  ]
};

const LESSON_15: StoryLesson = {
  id: 15,
  title: "树林里的奇遇",
  segments: [
    {
      paragraphs: [
        ["阳光洒在宽阔的草地上，茂密的树林里有一棵奇特的炮弹树。"],
        ["树枝上挂着扁扁的叶子，散发着淡淡的清香，偶尔还能看到浓浓的乳白色汁液。"]
      ]
    },
    {
      paragraphs: [
        ["小明和老人在树下闲聊，观察着泥土里是否存有腐烂的枯叶。"],
        ["树干上被工作人员贴上了编号，旁边还有一个小鸟搭建的窝。"]
      ]
    },
    {
      paragraphs: [
        ["老人姿态优雅，挺起胸膛，用幽默的语言给小明讲故事。"],
        ["大自然总是那么慷慨，悄悄地裁剪出四季的美景。"]
      ]
    },
    {
      paragraphs: [
        ["小明坐在树下听得入神，感觉时间都慢了下来。"]
      ]
    }
  ]
};

const LESSON_16: StoryLesson = {
  id: 16,
  title: "盲人画家的奇迹",
  segments: [
    {
      paragraphs: [
        ["在繁华的大都市里，有一座古老的博物馆。"],
        ["一位盲人坐在石阶台阶上，面前放着一粒粒颜料和一滴滴清水。"],
        ["他虽然看不见世界，但对自然的各种资源都非常熟悉。"]
      ]
    },
    {
      paragraphs: [
        ["许多匆匆路过的行人起初十分冷漠，甚至为他感到悲伤和惋惜。"],
        ["然而，当他迫不及待地翻开画板时，奇妙的事情发生了！"]
      ]
    },
    {
      paragraphs: [
        ["他笔下的春天栩栩如生，夕阳的余晖仿佛就在眼前。"],
        ["画作呈现出人与自然和谐的美感，令人深深陶醉。"]
      ]
    },
    {
      paragraphs: [
        ["大家这才明白，原来他心里藏着最珍贵的粮食与希望。"]
      ]
    }
  ]
};

const LESSON_17: StoryLesson = {
  id: 17,
  title: "人类家园的演变",
  segments: [
    {
      paragraphs: [
        ["在遥远的古代，我们的祖先生活在极其恶劣的环境中。"],
        ["他们身材虽然矮小，但非常聪明，靠打猎和捕鱼为生。"],
        ["面对野兽的攻击，他们手持棍子阻挡敌害，驾车行驶在荒野上。"]
      ]
    },
    {
      paragraphs: [
        ["即使遇到天寒地冻的严寒，他们也能神奇地搭建起冬暖夏凉的房屋。"],
        ["这些坚固的建筑能够有效减少地震和淹水带来的伤亡。"]
      ]
    },
    {
      paragraphs: [
        ["后来，这项技术甚至传到了欧洲。"],
        ["人类学会了避开灾难，创造了更加美好的生活。"]
      ]
    },
    {
      paragraphs: [
        ["回看历史，祖先的智慧真让人敬佩！"]
      ]
    }
  ]
};


// Every real lesson written so far -- add a new entry here (and its
// `const LESSON_N` above) to give a lesson its real story; any id in
// 1..LESSON_COUNT missing from this map still falls back to
// placeholderLesson() below, so a not-yet-written lesson never breaks the
// picker.
const WRITTEN_LESSONS: Record<number, StoryLesson> = {
  1: LESSON_1,
  2: LESSON_2,
  3: LESSON_3,
  4: LESSON_4,
  5: LESSON_5,
  6: LESSON_6,
  7: LESSON_7,
  8: LESSON_8,
  9: LESSON_9,
  10: LESSON_10,
  11: LESSON_11,
  12: LESSON_12,
  13: LESSON_13,
  14: LESSON_14,
  15: LESSON_15,
  16: LESSON_16,
  17: LESSON_17
};

// Every lesson number from 1 to LESSON_COUNT (data/questions.ts -- the same
// 17-lesson organization the rest of the app uses) always has an entry here,
// real or placeholder, so screens never need to null-check a missing lesson.
export const STORY_LESSONS: Record<number, StoryLesson> = {};
for (let id = 1; id <= LESSON_COUNT; id++) {
  STORY_LESSONS[id] = WRITTEN_LESSONS[id] ?? placeholderLesson(id);
}
