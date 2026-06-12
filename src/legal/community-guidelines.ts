import { LEGAL_CONSENT_VERSION, LEGAL_UPDATED_LABEL } from './constants';
import type { LegalDocument } from './types';

export const communityGuidelines: LegalDocument = {
  id: 'community-guidelines',
  title: '社区规范',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL,
  preamble:
    '为维护 SYNC 社区的健康、安全与良好体验，请所有用户遵守以下规范。违规内容可能被删除、限流或导致账号受限；情节严重我们将配合有关部门处理。',
  sections: [
    {
      title: '一、鼓励的内容',
      paragraphs: [
        '真实、友善的活动组队与观演交流；',
        '对他人有帮助的现场资讯（如动线、氛围、注意事项等）；',
        '尊重版权与艺人、主办方的正当宣传边界。',
      ],
    },
    {
      title: '二、禁止的内容与行为',
      paragraphs: [
        '票务黄牛、加价转票、虚假票务信息；',
        '色情低俗、辱骂骚扰、歧视仇恨、暴力威胁；',
        '赌博、诈骗、传销、非法集资、虚假活动；',
        '未经授权的广告引流（微信号、二维码、外链、群号等），尤其是跨平台导流；',
        '政治敏感、违法违规及其他违反微信平台规则的内容；',
        '盗用他人头像昵称、冒充官方或他人；',
        '批量刷屏、恶意举报、操纵互动数据。',
      ],
    },
    {
      title: '三、图片与聊天',
      paragraphs: [
        '上传图片须为小程序云存储 fileID 或本服务允许的地址，勿使用违规外链或含隐私信息的截图；',
        '团队聊天请保持礼貌，勿发送骚扰、广告或违法信息；',
        '涉及他人肖像的内容请取得同意。',
      ],
    },
    {
      title: '四、平台处理措施',
      paragraphs: [
        '我们结合用户举报、自动审核与微信安全接口结果，对违规账号采取警告、限制发帖评论、临时或永久封禁等措施。',
        '你对处理结果有异议的，可通过「设置 → 申诉说明 / 帮助与反馈」提交复核申请。',
      ],
    },
  ],
};
