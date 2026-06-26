import { LEGAL_CONSENT_VERSION, LEGAL_UPDATED_LABEL } from './constants';
import type { LegalDocument } from './types';

export const plurCulture: LegalDocument = {
  id: 'plur-culture',
  title: 'PLUR 文化说明',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL,
  preamble:
    'PLUR 是锐舞（Rave）文化中广泛认同的社区精神。SYNC 鼓励在公开招募与回复中体现这一态度——不代表平台对线下见面或组队的任何承诺。',
  sections: [
    {
      title: 'Peace · 平和',
      paragraphs: [
        '核心：摒弃冲突、放下敌意。现场不推搡、不吵架、不抢位置、不针对陌生人；磕碰主动退让。整个舞池无争吵、无对立的和谐氛围，是 Rave 文化的基础。',
      ],
    },
    {
      title: 'Love · 热爱 / 善意',
      paragraphs: [
        '核心：发自内心的温柔与善意，对所有人释放善意。扶摔倒的人、递水、帮看物品、安慰情绪低落的 Raver——对电音、舞池、身边每一个人的温柔爱意，是 Love 的延伸。',
      ],
    },
    {
      title: 'Unity · 团结 / 一体',
      paragraphs: [
        '核心：所有人不分彼此，舞池是一个整体。同享节拍、We Are One——我们因同一场活动而相聚。SYNC 的找队主轴即 Unity：浏览或发布公开招募，让同场 Raver 看见彼此（平台不撮合、不提供私信）。',
      ],
    },
    {
      title: 'Respect · 尊重',
      paragraphs: [
        '核心：双向尊重所有人与现场规则。尊重陌生人：不随意触碰、不偷拍、不强行搭讪；尊重 DJ 与音乐、尊重场地、尊重差异。公开回复不含联系方式，守护彼此边界。',
      ],
    },
    {
      title: 'Responsibility · 责任（PLURR）',
      paragraphs: [
        '狂欢同时照顾自己、照顾身边陌生人、爱护场地环境——不惹麻烦、互相帮扶。行前可勾选补水、告知亲友、耳塞与舒适鞋、散场交通、垃圾随身带走、照顾同队与身边陌生人等个人备忘（平台不担保现场安全）。',
      ],
    },
  ],
};
