const { searchPublicRecruits } = require('./apis/searchPublicRecruits');

const skill = wx.modelContext.createSkill('packageAgentSkills/recruit-discovery-skill');
skill.registerAPI('searchPublicRecruits', searchPublicRecruits);
