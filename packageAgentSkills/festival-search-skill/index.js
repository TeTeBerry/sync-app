const { searchFestivals } = require('./apis/searchFestivals');
const { getEvent } = require('./apis/getEvent');
const { getLineup } = require('./apis/getLineup');
const { setSearchContext } = require('./apis/setSearchContext');

const skill = wx.modelContext.createSkill('packageAgentSkills/festival-search-skill');
skill.registerAPI('setSearchContext', setSearchContext);
skill.registerAPI('searchFestivals', searchFestivals);
skill.registerAPI('getEvent', getEvent);
skill.registerAPI('getLineup', getLineup);
