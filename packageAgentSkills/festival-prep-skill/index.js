const { subscribeLineupUpdates } = require('./apis/subscribeLineupUpdates');
const { generateTravelGuide } = require('./apis/generateTravelGuide');

const skill = wx.modelContext.createSkill('packageAgentSkills/festival-prep-skill');
skill.registerAPI('subscribeLineupUpdates', subscribeLineupUpdates);
skill.registerAPI('generateTravelGuide', generateTravelGuide);
