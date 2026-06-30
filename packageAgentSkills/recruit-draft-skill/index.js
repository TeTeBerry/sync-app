const { draftRecruitPost } = require('./apis/draftRecruitPost');

const skill = wx.modelContext.createSkill('packageAgentSkills/recruit-draft-skill');
skill.registerAPI('draftRecruitPost', draftRecruitPost);
