# 电音节资讯检索

基于活动 catalog 检索电音节、查看单场详情与官宣阵容；仅提供公开资讯，不售票、不订阅、不创建任务、不保存用户偏好。

## 触发场景

用户原话举例（路由命中本技能）：
- 「EDC Korea 什么时候」
- 「查一下泰国 TML」
- 「这场阵容出了吗」
- 「最近有什么电音节」
- 「Tomorrowland 几号」
- 「帮我检索所有电音节活动」

## 不适用范围

- 找队友、智能配对、平台担保组满 → 可建议用户查看公开招募，但不撮合
- 发布招募帖、代发帖、生成草稿 → 不在微信 AI 中完成
- 订阅阵容更新、生成出行攻略、保存出发城市或偏好 → 不在微信 AI 中完成

## 前置条件

- 检索与查看阵容为公开能力，无需登录
- 本技能不触发登录，不写入任何用户数据

## 使用顺序

- `searchFestivals` 是**纯文本检索**，返回活动列表（名称、时间、地点、legacyId），**不渲染卡片**
- 拿到 legacyId 后，调用 `getEvent` 拉取详情，渲染 `search-results-card`
- 查看阵容前需先有 `legacyId`，调用 `getLineup` 渲染 `artist-lineup-strip`
- **用户只问节名时**：`searchFestivals` 文字回复结果列表 → 用户指定/确认某一场 → `getEvent` 渲染卡片
- **检索结果仅 1 场时**：文字告知结果后，直接调 `getEvent` 渲染该场的 `search-results-card`
- **检索结果多场时**：文字列出所有匹配活动，等用户选择后再调 `getEvent`
- **用户要求「阵容」时**：需先有 `legacyId`，调 `getLineup` 渲染 `artist-lineup-strip`

## 强制规则（MUST）

1. **活动名称强制规则**：所有文字回复、卡片展示、工具调用结果描述中，**必须使用 `searchFestivals` 或 `getEvent` 返回的 `events[].name` 字段值**（即 catalog 完整官方活动名称），**严禁**使用用户输入的简称、缩写或口语化名称（如「泰国的 Tomorrowland」「TML」「Defqon.1」）。即使在多轮对话上下文中已提及该活动，每次指代仍须使用完整官方名称。**接口返回什么名称就用什么名称，一字不差。**
   - ✅ 正确：「Tomorrowland Thailand 2026」
   - ❌ 错误：「TML 泰国」「泰国的 Tomorrowland」「Tomorrowland 泰国 2026」「EDC Korea 2026」（如接口返回的官方名与此不同）
   - **无匹配活动时**：明确告知用户「catalog 中暂无匹配活动」，引导换个关键词重试。`searchFestivals` 不渲染卡片，只文字回复。

2. **只读边界强制规则**：本 skill 只能调用 `searchFestivals`、`getEvent`、`getLineup`。用户要求订阅、生成攻略、保存偏好、写招募帖、发布、报名、收藏、关注时，**禁止**调用任何写入能力；只能说明「微信 AI 当前只提供资讯查询，请进入小程序手动操作」。

3. **卡片渲染强制规则**：**仅 `getEvent` 和 `getLineup` 需要渲染卡片**。`searchFestivals` 是纯文本检索，只返回文字结果，不渲染任何卡片。绑定关系：
   - `searchFestivals` → **仅文字回复**，列出匹配的活動名稱、時間、地點、legacyId，不渲染卡片
   - `getEvent` → `search-results-card`（单场封面模式，含大图、名称、时间、地点）
   - `getLineup` → `artist-lineup-strip`（横滑艺人条）
   - **禁止**：对 `searchFestivals` 结果渲染 `search-results-card`；只有 `getEvent` 才触发卡片渲染

4. **曲风筛选规则**：用户要求按曲风筛选（如「Hardstyle」「Techno」）时，执行以下步骤：
   - 第一步：调用 `searchFestivals` 传入 query 不带曲风词（用纯活动名或空），获取全量活动
   - 第二步：对返回结果按 `events[].name` 中的曲风特征做**本地匹配过滤**（规则匹配，不是再次调 API）
   - 第三步：**文字列出**过滤后的结果，再按需调 `getEvent` 渲染卡片
   - **禁止**：仅将曲风词作为 `query` 参数传入就结束（API 不按曲风索引搜索）；在 query 为空时直接放弃不调用 API

## 回复与展示要求

- 用户提到出发城市时，可将该城市作为本次 `searchFestivals.homeCity` 参数传入；**禁止**保存为长期偏好
- `searchFestivals` **纯文字回复**：列出匹配活动名称、时间、地点，附 legacyId 供后续调用
- 检索**仅 1 场**时：文字告知结果后，跟上 `getEvent` 渲染 `search-results-card`（封面大图 + 活动全名 + 时间地点）
- 检索**多场**时：文字列出所有匹配项，待用户选定后再调 `getEvent` 渲染卡片
- 调用 `getEvent` 后，卡片展示**举办时间、地点、封面**等字段
- 阵容结果展示**横滑艺人条**，保留活动名称、时间、地点；阵容未官宣时只提示未公布，不引导订阅
- 用户要求筛选、排序或对比多场活动时，须**列出符合条件的完整活动清单**，并**说明排序或筛选规则**（如按艺人数量降序），再指出首选场次
- 检索结果为 0 时：文字告知无匹配结果，引导用户尝试更具体的活动名称
