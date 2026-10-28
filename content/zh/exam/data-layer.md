---
title: "数据层——实践问题"
domain: "data-layer"
quiz:
  - id: "foundations-index-1"
    q: "唯一最有力的论据是: CRM Analytics 超过通用BI工具?"
    options:
      - "它的图看起来更好"
      - "它继承 Salesforce共享和安全模式,所以谁看到什么已经解决"
      - "便宜一点"
      - "这是唯一能读到的工具 Salesforce 数据"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-2"
    q: "一个数据集在 CRM Analytics 最好的描述是:"
    options:
      - "现场观看 Salesforce 对象"
      - "已制作的专栏快照按时间表重建"
      - "保存的报告"
      - "页:1 SQL 表格可以写入"
    answer: 1
    topic: "foundations"
  - id: "foundations-index-3"
    q: "您的 VP 需要显示调用中心队列深度的屏幕, 每几秒钟更新一次 。 已经 CRM Analytics 正确的工具吗?"
    options:
      - "是的,有 足够快的食谱时间表"
      - "不,它是在时间表上更新的,不是流;这是业务需要,不是分析需要"
      - "是的,如果你使用 Einstein Discovery"
      - "只持有 Plus 许可证"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-1"
    q: "哪个层拥有“合格管道”的定义?"
    options:
      - "设计层, 因为数字是显示的"
      - "数据层,因为一个每盘定义的公尺是两个公尺仪表板将不同意"
      - "情报层"
      - "哪个队伍先问"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-2"
    q: "仪表板很慢 你该先怀疑哪层?"
    options:
      - "设计层——太多部件"
      - "数据层——一个错误的格子的数据集,强迫每个部件聚合数百万行"
      - "情报层"
      - "网络"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-three-layers-3"
    q: "Einstein Discovery 生成精确度为78%的模型。 智能层欠设计层什么?"
    options:
      - "只有预言"
      - "预测、信心和主要因素——无理由附加的得分不能付诸行动"
      - "培训数据"
      - "无; 准确性足够"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-1"
    q: "数据集的“粒”是什么意思?"
    options:
      - "有多少数据"
      - "一行代表着什么"
      - "多久一次的新鲜度"
      - "哪些领域是措施"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-2"
    q: "加入机会(608行) 机会(1 192行)和总金额。 发生了什么事?"
    options:
      - "没什么,总和没错"
      - "金额按每条产品线计算,因此总收入被夸大——这里几乎是三倍。"
      - "连接失败"
      - "只有匹配的行是总和,所以收入下降"
    answer: 1
    topic: "foundations"
  - id: "foundations-what-a-dataset-really-is-3"
    q: "为什么一个数据集有历史证明 Salesforce 对象没有?"
    options:
      - "Salesforce 删除旧记录"
      - "每次运行都可以在那一刻附加状态的快照,而对象只持有当前值"
      - "数据集已备份"
      - "没有"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-1"
    q: "数据同步(复制)的目的是什么?"
    options:
      - "将数据写入 Salesforce"
      - "保持所选对象和字段的本地副本流畅, 因此菜单可以从中读取, 而不是点击源 。"
      - "时间表仪表板"
      - "加密数据集"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-2"
    q: "食谱运行失败 。 你从哪里看?"
    options:
      - "仪表板检查员"
      - "Data Manager • 监测"
      - "设置 → 分析 → 设置"
      - "数据集的字段属性"
    answer: 1
    topic: "foundations"
  - id: "foundations-how-the-data-arrives-3"
    q: "集成用户为何如此重要?"
    options:
      - "它拥有仪表板"
      - "同步运行于该用户, 因此它无法看到的任何对象或字段都永远不会到达—— 仪表板上没有错误 。"
      - "给执照买单"
      - "它会安排食谱"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-1"
    q: "一个“ app” 输入 CRM Analytics 为:"
    options:
      - "一个已安装的应用程序"
      - "装有共享设置的数据集、镜头和仪表板的容器"
      - "移动体验"
      - "管理软件包"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-2"
    q: "镜头和仪表板有什么实际区别?"
    options:
      - "Lenses 无法保存"
      - "一个镜头探索一个数据集,是一个可支配的工作空间;一个仪表板集合了许多查询,将它们组合在一起,并为其他人建造"
      - "盘片无法使用 SAQL"
      - "无"
    answer: 1
    topic: "foundations"
  - id: "foundations-the-vocabulary-3"
    q: "内 Einstein Discovery,一个\"故事\"是:"
    options:
      - "已部署模式"
      - "分析与结果相关的内容,然后可以将其用作模式"
      - "仪表板模板"
      - "叙事文本部件"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-1"
    q: "一个利益攸关方要求有一个“实时”更新的仪表板。 正确的第一行动是什么?"
    options:
      - "计时食谱并实时调用"
      - "问由它做出什么样的决定,在它无用之前它会如何僵化——答案通常以小时计."
      - "拒绝请求"
      - "使用 Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-when-not-to-use-it-2"
    q: "公司的大部分数据都在仓库里; Salesforce 只有账户和机会。 这说明什么?"
    options:
      - "使用 CRM Analytics 并同步仓库"
      - "你正在建造一个带有客户关系管理系统的仓库项目——仓库上的BI工具可能更好"
      - "使用 Salesforce 报告"
      - "使用 Einstein Discovery"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-1"
    q: "为什么这个仪表板开着一个ARR总数?"
    options:
      - "填补顶部的空间"
      - "因此,一个看不见别人的观众 仍然留下了头条屏幕"
      - "因为数字部件加载最快"
      - "这是需要的 Salesforce"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-2"
    q: "单击一段栏过滤其他两个部件。 为什么?"
    options:
      - "装订已配置"
      - "默认情况下在相同的数据集面上建构的部件"
      - "桌子是图上的孩子"
      - "面对面必须总是手动打开"
    answer: 1
    topic: "foundations"
  - id: "foundations-your-first-dashboard-3"
    q: "顶账表显示的是10行而不是全部140行. 最好的理由是:"
    options:
      - "业绩"
      - "问题在于集中程度 一张没人能看的表格 是数据输出而不是仪表板"
      - "表限十行"
      - "隐藏较小的账户"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-1"
    q: "一个数据集在 CRM Analytics 为:"
    options:
      - "现场观看 Salesforce 对象"
      - "已制作的专栏快照按时间表重建"
      - "一个保存 Salesforce 报告"
      - "可写 SQL 图表"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-2"
    q: "最强的理由 CRM Analytics 超过一个通用BI工具:"
    options:
      - "更好的图表类型"
      - "它继承了Org的共享和安全模式 而不是让你重建它"
      - "许可证费用较低"
      - "只有这样才能读 Salesforce 数据"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-3"
    q: "你的仪表板上的总收入 是财务报告的两倍 最可能的原因是:"
    options:
      - "安全前提"
      - "粉丝的加入—— 跨儿童排的家长措施"
      - "数据集尚未刷新"
      - "货币格式化"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-4"
    q: "用户报告说他们知道存在记录缺失. 你从哪里看第一?"
    options:
      - "仪表盘的部件查询"
      - "集成用户的访问,然后安全上游"
      - "图表类型"
      - "该应用的颜色主题"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-5"
    q: "哪些层拥有像“合格管道”这样的度量标准的定义?"
    options:
      - "设计——显示于此"
      - "数据——每个仪表板的度量定义是一两个仪表板将不同意"
      - "情报"
      - "哪个队伍先问"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-6"
    q: "数据同步是为了什么?"
    options:
      - "将分析结果写回 Salesforce"
      - "保持选定对象和字段的本地副本流畅, 因此配方不会击中源代码"
      - "日程安排仪表板电子邮件"
      - "在休息时加密数据集"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-7"
    q: "一个“ app” 输入 CRM Analytics 为:"
    options:
      - "已安装的软件包"
      - "装有共享设置的数据集、镜头和仪表板的容器"
      - "移动客户端"
      - "仪表板模板"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-8"
    q: "食谱每晚都成功运行 但数据总是一天的 最可能的原因是:"
    options:
      - "数据集已经腐败了"
      - "食谱在数据同步前排好 取决于完成"
      - "面孔已禁用"
      - "集成用户缺乏访问权限"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-9"
    q: "您的利害相关者需要每几秒钟更新一个屏幕, 以便实时呼叫队列 。 你应该:"
    options:
      - "尽可能频繁地安排食谱"
      - "说这是业务要求,不是分析要求,然后指 Salesforce 页面或目的工具"
      - "使用 Einstein Discovery"
      - "构建并添加刷新按钮"
    answer: 1
    topic: "foundations"
  - id: "foundations-graded-quiz-10"
    q: "Einstein Discovery 部署对机会进行评分的模式。 得分怎么运?"
    options:
      - "培训数据集"
      - "其背后的顶尖因素 — — 光是概率就无济于事"
      - "那个 SAQL 查询"
      - "没有别的了"
    answer: 1
    topic: "foundations"
  - id: "data-preparation-index-1"
    q: "其中哪一种数据不是成为数据的方法 CRM Analytics 数据集?"
    options:
      - "页:1 CSV 上传"
      - "数据同步从 Salesforce 对象,通过配方转换"
      - "由仪表盘部件发布的实时查询"
      - "与仓库的外部连接, 同步和转换"
    answer: 2
    topic: "data-preparation"
  - id: "data-preparation-index-2"
    q: "在建立任何食谱之前,你应该能够说明:"
    options:
      - "您将使用的图表类型"
      - "输出数据集的一行代表什么"
      - "仪表板的颜色主题"
      - "有多少用户会查看它"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-1"
    q: "为什么食谱是从同步数据而不是从每个运行源读取?"
    options:
      - "食谱无法读取 Salesforce 直接"
      - "本地拷贝速度更快,不会在每次运行时打乱记录系统"
      - "同步数据更准确"
      - "这是一个许可证要求"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-2"
    q: "配方在夜间成功 但总是显示昨天的数据 最相似的原因是:"
    options:
      - "一个腐败的数据集"
      - "食谱在同步前排好 取决于完成"
      - "仪表盘缓存"
      - "集成用户缺乏访问权限"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-connections-and-sync-3"
    q: "下个季度开始的田野需要逐月的历史 你什么时候开始同步?"
    options:
      - "下一季度,当需要的时候"
      - "现在——一个快照只能记住当时同步的内容,历史不能从持有当前状态的物体中回填"
      - "没关系"
      - "只有在食谱存在之后"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-1"
    q: "以文字装入的 CloseDate 字段 。 什么间断?"
    options:
      - "无;文本日期正常"
      - "日期过滤器、月组和趋势线——固定需要重新装入"
      - "只有记录页"
      - "数据集不会保存"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-2"
    q: "为什么强制数字化的ID 维度?"
    options:
      - "保存空间"
      - "因为打字作为措施 产品会提供它们的总和, 最后有人接受"
      - "这是必要的"
      - "让他们可以过滤"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-load-a-csv-properly-3"
    q: "您上传的数据集显示的是607行而不是608行. 最有可能的是:"
    options:
      - "许可问题"
      - "标题排行问题 CSV 剖析"
      - "安全前提"
      - "正常四舍五入"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-1"
    q: "桶的界限应该从哪里来?"
    options:
      - "射程的三分之一"
      - "企业——某人做不同事情的时刻"
      - "数据集的四分位数,总是"
      - "图表的颜色尺度"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-2"
    q: "在每个仪表板上而不是在食谱上划划划,导致:"
    options:
      - "提高灵活性"
      - "'Large'在不同的屏幕上意味着不同的东西,两者都是可防的"
      - "快速查询"
      - "较小的数据集"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-buckets-and-binning-3"
    q: "准确的边界价值——使用率确切为55%——应为:"
    options:
      - "机会"
      - "由明确的书面规则指定 因为最终会有人去查"
      - "不包括"
      - "绕开"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-1"
    q: "哪个节点类型会改变流经它的数据的格子?"
    options:
      - "过滤器"
      - "合并和合并"
      - "公式"
      - "产出"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-2"
    q: "您需要计算每个账户中每个账户的机会。 哪个节点?"
    options:
      - "公式"
      - "按账户分类的机会总额,然后并入账户"
      - "过滤器"
      - "变形"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-recipe-nodes-3"
    q: "为什么把大菜谱分成几个小菜谱?"
    options:
      - "食谱的节点限制很硬"
      - "一个50节点的食谱是无法读取的 没有写它,失败停止本地化"
      - "小菜谱跑得更快"
      - "需要安排时间"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-1"
    q: "为什么每个交易贴现率的平均值通常是错误的?"
    options:
      - "四舍五入"
      - "它的权重是五千块 和二百万块一样 正确的数字将总折扣除以总价"
      - "贴现不能平均"
      - "字段为文本"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-2"
    q: "应计算10个仪表板上所需的比率:"
    options:
      - "每个部件,每个团队都可以调整"
      - "一旦进入食谱,所以所有10个同意 通过构建"
      - "在电子表格中"
      - "以 Einstein Discovery"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-formulas-and-computed-fields-3"
    q: "在仪表板上真正属于哪一种计算而不是食谱?"
    options:
      - "全公司的计量定义"
      - "取决于查看器当前过滤器选择的"
      - "货币兑换"
      - "一个桶状部分"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-1"
    q: "以零填入空白金额为:"
    options:
      - "总是正确"
      - "一项索赔――它声称这笔交易没有价值,这改变了所根据的每个平均数。"
      - "汇总前需要"
      - "仅显示选项"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-2"
    q: "只有44%的结案案件进行了CSAT调查。 平均CSAT为:"
    options:
      - "错误"
      - "没错,但是它描述的是被调查者而不是顾客,所以它用它旁边的响应率"
      - "无法使用"
      - "通过计算缺失的分数来改进"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-missing-values-3"
    q: "\"经济买家领域是空白的\"预测会输掉. 最可能的解释是:"
    options:
      - "空栏造成损失"
      - "离队代表不填字段——空白是症状,不是原因."
      - "球场断了"
      - "巧合"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-1"
    q: "在你加入后,收入增加了一倍。 这些重复是:"
    options:
      - "要删除的真实重复记录"
      - "结合的艺术——修补是结合,而不是重复的步骤"
      - "数据输入问题"
      - "无效导致"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-2"
    q: "一个账户出现在 arr  snapshots 中 18 次 。 这是:"
    options:
      - "要删除的重复"
      - "预定谷物——每个账户每月一行"
      - "负载失败"
      - "同步错误"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-de-duplication-3"
    q: "当真正的重复倒塌时, 哪行应该活下来?"
    options:
      - "无论哪个先出现"
      - "由一条明确的规则选择的,最近经过修改,最完整,或来自首选来源"
      - "随机行"
      - "身份证最低的"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-1"
    q: "仪表盘显示的总数是错误的。 先看何处."
    options:
      - "部件的图表配置"
      - "Data Manager 监测器:是否运行、何时运行以及有多少行"
      - "应用程序共享设置"
      - "浏览器控制台"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-2"
    q: "在你没有做出改变后,行数从2,800降至2,100。 最有可能的是:"
    options:
      - "正常变化"
      - "上游过滤器、 内联或权限更改丢弃记录"
      - "图表限制"
      - "四舍五入"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-troubleshooting-a-recipe-3"
    q: "将谷类问题放在食谱中最快的方法是:"
    options:
      - "重读 SAQL"
      - "通过节点预览和观察行数变化之处单击"
      - "重建食谱"
      - "导出到 CSV"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-1"
    q: "数据同步是为了什么?"
    options:
      - "将分析结果写回 Salesforce"
      - "保持所选对象和字段的本地副本流畅, 因此 食谱不会在每次运行时击中源"
      - "日程安排仪表板电子邮件"
      - "加密数据集"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-2"
    q: "食谱是绿色的 但数据总是一天的 原因:"
    options:
      - "一个腐败的数据集"
      - "食谱在同步前排好 取决于是否完整"
      - "隐藏板缓存"
      - "陈旧的上游"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-3"
    q: "以文本防止方式加载的关闭日期 :"
    options:
      - "没什么"
      - "日期过滤器、月组和趋势线"
      - "排序"
      - "加入时"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-4"
    q: "为什么要强制数字化的ID 以维度在负载?"
    options:
      - "保存空间"
      - "因为打字作为措施 产品会提供它们的总和, 最后有人接受"
      - "这是必要的"
      - "让他们可以过滤"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-5"
    q: "Bucket 边界应该来自:"
    options:
      - "射程的三分之一"
      - "企业——某人做不同事情的时刻"
      - "数据集的四分位数,总是"
      - "图表调色板"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-6"
    q: "在每个仪表板上而不是在食谱上划划划,导致:"
    options:
      - "更大的灵活性"
      - "'Large'在不同的屏幕上意味着不同的东西,两者都是可防的"
      - "快速查询"
      - "较小的数据集"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-7"
    q: "“平均折扣”作为每个交易利率的平均值计算是错误的,因为:"
    options:
      - "贴现不是数字"
      - "不论大小,每一笔交易都一样"
      - "null被排除在外"
      - "它需要一个明确的计数"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-8"
    q: "以零填入空白金额为:"
    options:
      - "总是正确"
      - "一项索赔——它声称这笔交易是一文不值的,它拖动了根据它得出的每个平均数"
      - "汇总前需要"
      - "仅显示选项"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-9"
    q: "加入后,收入增加了一倍。 \"重复\"为:"
    options:
      - "要删除的真实重复记录"
      - "结合的艺术——修补是结合,而不是重复的步骤"
      - "数据输入问题"
      - "无效导致"
    answer: 1
    topic: "data-preparation"
  - id: "data-preparation-graded-quiz-10"
    q: "在食谱中定位错误数字的最快方法是:"
    options:
      - "阅读 SAQL"
      - "走节点预览和观察行数变化之处"
      - "重建数据集"
      - "正在检查应用共享"
    answer: 1
    topic: "data-preparation"
  - id: "datasets-and-modelling-index-1"
    q: "最能决定一个数据集能回答哪些问题的是什么?"
    options:
      - "其行数"
      - "它的谷物——一行代表着"
      - "上面使用的图表类型"
      - "其更新时间表"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-index-2"
    q: "预先汇总为每月总计的数据集为:"
    options:
      - "严格地说,它更快"
      - "更快 永远无法回答问题"
      - "等於一个优雅的"
      - "只对出口有用"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-1"
    q: "加入608个机会到1,192个产品线,则给出1,192行. 是窃听器吗?"
    options:
      - "是的,加盟是错的"
      - "不——这是一对一的加入所起到的作用。 窃听器会把父母的金额拍下来"
      - "是的,行不应该增加"
      - "只有在密钥为文本时"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-2"
    q: "哪个固定方法可以提供产品级别的细节?"
    options:
      - "组合前的细列项目"
      - "保留线粒体,而不携带母体的量, 将线粒体组合起来"
      - "每个交易过滤到一个产品"
      - "使用内联"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-3"
    q: "总和你们期望的一样 你们怀疑什么?"
    options:
      - "安全前提"
      - "粉丝——父母的衡量标准,每条大约三排孩子"
      - "陈旧的数据集"
      - "货币兑换"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-grain-joins-and-fan-out-4"
    q: "调查可疑总数的最佳方法是:"
    options:
      - "重新检查图表配置"
      - "向下过滤到单个实体并用手数行"
      - "重建仪表板"
      - "增加行限制"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-1"
    q: "设计数据集的正确起点是:"
    options:
      - "现有来源表格"
      - "它必须回答的问题,写下来"
      - "计划的图表类型"
      - "更新时间表"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-2"
    q: "服务于两个不同谷物受众的数据集通常应当:"
    options:
      - "在中间的谷物上妥协"
      - "成为两个数据集,往往来自两个产出的一个配方"
      - "用最好的粮食"
      - "每个查看器过滤"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dataset-design-3"
    q: "在数据集内而不是在仪表板上应用的过滤器是正确的:"
    options:
      - "比较快"
      - "排除的行绝不应在任何问题中出现此数据集的答案"
      - "观众可能想要更改它"
      - "总是"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-1"
    q: "类似账户.csv的参考表格的特点是:"
    options:
      - "列数最多"
      - "加入而不是汇总——总结其中的任何内容通常是错误的"
      - "变化最频繁"
      - "没有密钥"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-2"
    q: "长格式(每个实体每公吨一行)在下列情况下更为可取:"
    options:
      - "没有什么标准是永远不变的"
      - "经常添加度量衡, 或者您想要用一个部件绘制其中的许多度量衡"
      - "储存有限"
      - "从不"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-modelling-patterns-3"
    q: "基于另一个数据集输出风险的衍生数据集:"
    options:
      - "没什么"
      - "运行链, 其中失败的三条链接在尾端是看不见的"
      - "失去安全保障"
      - "复制列"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-1"
    q: "为什么你不能单独从机会号上 建造一个管道移动仪表板?"
    options:
      - "对象太大了"
      - "它只持有当前价值——没有记录显示上个月的舞台和数额是什么"
      - "机会无法同步"
      - "你可以的,它已经建在"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-2"
    q: "按转换日期而不是创建日期排列的共线产生:"
    options:
      - "更准确的画面"
      - "一个扭曲的——最近一群人看起来不可能,老的看起来很可怕,而这两个数字都是个别正确的"
      - "没有区别"
      - "食谱错误"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-dates-history-and-snapshots-3"
    q: "一个快照数据集附加当前每次运行的状态 。 这对今天开始同步的球场意味着什么?"
    options:
      - "它的历史自动补满"
      - "今天之前没有历史,永远不会"
      - "无法快照"
      - "历史来源于审计日志"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-1"
    q: "字段的显示标签应该设置在哪里 ?"
    options:
      - "每个部件"
      - "在数据集的字段元数据上,每个镜头和部件都会继承它"
      - "在食谱的公式"
      - "在应用程序设置中"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-field-metadata-and-formatting-2"
    q: "一个货币量度显示每个仪表板上六个小数位. 高效的补救是:"
    options:
      - "格式化每个部件"
      - "在数据集字段中设定格式"
      - "转过来 SAQL"
      - "更改图表类型"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-1"
    q: "在608个机会中,1 192个产品线的产量为1 192行。 错误是:"
    options:
      - "参赛者自己"
      - "事后对父母的金额进行总结,现在每行重复一次"
      - "用看而不是内在"
      - "没有虫子"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-2"
    q: "保持产品层次细节的固定是:"
    options:
      - "组合前合计细列项目"
      - "保留线粒体和总和线粒体,而不是父体的金额"
      - "每笔交易过滤到一个产品"
      - "使用内部连接"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-3"
    q: "数据集的谷物应来自:"
    options:
      - "来源表格"
      - "最好的问题必须回答"
      - "图表类型"
      - "行限制"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-4"
    q: "在18个月的快照中,"
    options:
      - "公司ARR"
      - "大约18年的收入"
      - "每个账户的经常资源"
      - "错误"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-5"
    q: "今天开始同步的字段有:"
    options:
      - "回填历史"
      - "今天没有历史,永远"
      - "审计线索的历史"
      - "下一次重建之后的历史"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-6"
    q: "在类似账户的参考表格上汇总一栏如下:"
    options:
      - "标准做法"
      - "通常错误——参比表被合并,而不是汇总"
      - "ARR 所需资源"
      - "比事实表还快"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-7"
    q: "长格式的特征失败是:"
    options:
      - "慢查询"
      - "一个忽略过滤到一个度量的查询, 默默地在不相关的度量中进行聚合"
      - "缺少密钥"
      - "复制实体"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-8"
    q: "使用百分比字段( 默认的总和) 产生:"
    options:
      - "正确总数"
      - "一年960%,干净"
      - "错误"
      - "数值"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-9"
    q: "数据集内应用的过滤器应记录在案,因为:"
    options:
      - "这是必要的"
      - "它在下游是看不见的 所以与源头的调和会有所不同 没有明显的原因"
      - "影响业绩"
      - "查看者可能想要更改它"
    answer: 1
    topic: "datasets-and-modelling"
  - id: "datasets-and-modelling-graded-quiz-10"
    q: "数据集描述中最有用的单句是:"
    options:
      - "谁造的?"
      - "一行代表着什么"
      - "当它恢复时"
      - "在哪个应用上"
    answer: 1
    topic: "datasets-and-modelling"
---

数据层域的实践问题 CRM Analytics 和 Einstein Discovery 顾问考试.
