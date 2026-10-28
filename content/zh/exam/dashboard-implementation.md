---
title: "分析板-实践问题"
domain: "dashboard-implementation"
quiz:
  - id: "saql-index-1"
    q: "SAQL定义与 SQL 这是:"
    options:
      - "它没有综合功能"
      - "这是一个流变换——每个语句会改变上一个结果,所以语句命令 IS 查询计划"
      - "无法过滤"
      - "它只读一个数据集"
    answer: 1
    topic: "saql"
  - id: "saql-index-2"
    q: "最便宜的学习方式 SAQL 为:"
    options:
      - "读取函数引用结束为结束"
      - "通过点击构建图表,然后根据您已经知道的答案读取生成的查询"
      - "从零开始写入查询"
      - "复制论坛实例"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-1"
    q: "怎么样 SAQL 最重要的区别在于 SQL? 。 。 。"
    options:
      - "无法过滤"
      - "这是一个流变换——每个语句会改变上一个语句的结果,所以语句 ORDER 是查询计划"
      - "它没有综合功能"
      - "只有一个数据集"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-2"
    q: "你想要每个部分在总收入中的份额。 为什么单凭点击就尴尬?"
    options:
      - "无支持的百分比"
      - "它需要每行与所有行的总和进行比较——一个查询的两个层次的汇总"
      - "无法组合部件"
      - "这不是尴尬的"
    answer: 1
    topic: "saql"
  - id: "saql-saql-when-clicks-run-out-3"
    q: "过滤器属于哪一个 SAQL 询问最佳表现?"
    options:
      - "最后,在分组之后"
      - "尽早减少以下报表中的数据流量"
      - "没关系"
      - "在前排内"
    answer: 1
    topic: "saql"
  - id: "saql-functions-1"
    q: "要在您使用的行项谷类中计数处理 :"
    options:
      - "计数( )"
      - "唯一( 机会) 我会的。"
      - "和 (“ 数额”)"
      - "avg () (中文(简体) )."
    answer: 1
    topic: "saql"
  - id: "saql-functions-2"
    q: "等于40%的单返回列的和():"
    options:
      - "无"
      - "非无线行的总和,没有显示其余被跳过"
      - "无"
      - "错误"
    answer: 1
    topic: "saql"
  - id: "saql-functions-3"
    q: "分两个总和的安全方法是什么?"
    options:
      - "每行比例的avg"
      - "和(计数器)/和(计数器),以零分母计值"
      - "两者均相等"
      - "不支持分部"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-1"
    q: "最佳表现的过滤器应该放在哪里?"
    options:
      - "组后,过滤的更少"
      - "越早越少的排队 越多越多"
      - "最终"
      - "秩序没有区别"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-2"
    q: "`filter q by 'Stage' != \"Closed Lost\"` 也删除 :"
    options:
      - "没有别的了"
      - "阶段无效的每行"
      - "关闭元行"
      - "来自其他数据集的行"
    answer: 1
    topic: "saql"
  - id: "saql-filters-and-nulls-3"
    q: "使用 conesce 取代 0 的无效值为:"
    options:
      - "永远安全"
      - "一种权利要求——它把“未知的”变成“无”,这改变了平均,也可能是错误的。"
      - "汇总前需要"
      - "只有显示选择"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-1"
    q: "为了计算每个部门在您需要的公司收入中的份额:"
    options:
      - "按部门分列的一组"
      - "每个组的数值与所有行的总数相比——两个层次的汇总"
      - "一个单独的仪表板"
      - "双轴"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-2"
    q: "窗口运行总数与普通总和不同,原因是:"
    options:
      - "比较快"
      - "它跨越命令的行,而不是将其折叠成一个值"
      - "它忽略了虚无"
      - "需要两个数据集"
    answer: 1
    topic: "saql"
  - id: "saql-grouping-and-windowing-3"
    q: "每个区域的代表的排名要求窗口为:"
    options:
      - "横跨各行"
      - "按区域划分,因此每个区域从1个独立排行"
      - "仅排序"
      - "由代表分组"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-1"
    q: "你需要把10个仪表板上的两套数据集结合起来的量子。 密码在哪里?"
    options:
      - "每个部件 SAQL"
      - "在一个食谱中,所有10个都同意建筑, 计算一次"
      - "在电子表格中"
      - "在仪表板上 JSON"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-2"
    q: "在一个查询中将不同谷物的两个流组合在一起,会产生:"
    options:
      - "错误"
      - "同样的粉丝,你得到一个食谱—— 跨匹配行重复的量度"
      - "一个正确的结果自动"
      - "仅无"
    answer: 1
    topic: "saql"
  - id: "saql-working-across-datasets-3"
    q: "双流查询的一个良好用途是:"
    options:
      - "界定公司收入"
      - "在一个单一仪表板上进行特别的比较——与一个小目标表的实际比较"
      - "随便加入"
      - "替换食谱层"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-1"
    q: "一个查询返回一个数字,这个数字通过一个干净的倍数太高。 嫌犯为:"
    options:
      - "过滤器"
      - "乘数行的组合, 后面加一个总和"
      - "订单说明"
      - "无效"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-2"
    q: "了解一个返回错误事物的查询的最快方式是:"
    options:
      - "从零开始重写"
      - "切回负载, 一次添加一个语句, 检查行数后每行数"
      - "添加更多过滤器"
      - "切换到不同的图表类型"
    answer: 1
    topic: "saql"
  - id: "saql-debugging-a-query-3"
    q: "无数据变化的运行间变化的数字通常是指:"
    options:
      - "缓存错误"
      - "相对日期范围, 或未明确订购的窗口"
      - "权限问题"
      - "一个渲染问题"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-1"
    q: "SAQL 语句执行 :"
    options:
      - "按照选手选择的顺序"
      - "按书写的顺序——每个字都改变上一个结果"
      - "平行"
      - "按字母顺序"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-2"
    q: "过滤器属于 :"
    options:
      - "在小组之后"
      - "尽快"
      - "里面的东西"
      - "最终"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-3"
    q: "在项目谷物中,交易计有:"
    options:
      - "计数( )"
      - "唯一( 机会) 我会的。"
      - "和 (“ 数额”)"
      - "中间值( )"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-4"
    q: "等于40%的单返回列的和():"
    options:
      - "无"
      - "非裸线的总数,没有显示其余的被跳过"
      - "无"
      - "错误"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-5"
    q: "加权贴现率为:"
    options:
      - "avg (“ 贴现Pct ”)"
      - "sum('Discounter')/ sum('ListTotal'), 防守为零"
      - "中位数 (“ 贴现Pct ”)"
      - "最大值 (“ 贴现Pct ”)"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-6"
    q: "`'Stage' != \"Closed Lost\"` 也删除 :"
    options:
      - "没有别的了"
      - "阶段无效的行"
      - "关闭元行"
      - "来自其他数据集的行"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-7"
    q: "各区域的排名代表需要窗口:"
    options:
      - "横跨各行"
      - "按区域划分"
      - "仅订购"
      - "由代表分组"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-8"
    q: "未明确订购的运行总数是:"
    options:
      - "罚款——可推断出订单"
      - "一个稳定到下一次刷新,然后悄悄改变的bug"
      - "无法写入"
      - "按日期自动排序"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-9"
    q: "两个数据集需要组合10个仪表板. 这是属于:"
    options:
      - "每个部件 SAQL"
      - "在食谱中"
      - "在仪表板上 JSON"
      - "在电子表格中"
    answer: 1
    topic: "saql"
  - id: "saql-graded-quiz-10"
    q: "以一个干净的倍数计的总数表明:"
    options:
      - "无效的问题"
      - "行乘法, 后面是父度量总和"
      - "过滤器"
      - "渲染问题"
    answer: 1
    topic: "saql"
  - id: "interactions-index-1"
    q: "在同一数据集上建有两个部件 。 默认情况下,点击 1:"
    options:
      - "对别人无动于衷"
      - "过滤其它——同数据集部件自动对面"
      - "需要装订"
      - "打开新镜头"
    answer: 1
    topic: "interactions"
  - id: "interactions-index-2"
    q: "互动的主要理由是:"
    options:
      - "它看起来令人印象深刻"
      - "大部分人永远不会建立镜头,但几乎每个人都点击一个栏杆——互动是仪表板如何回答你没有预料到的问题."
      - "它能提高性能"
      - "这需要分享"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-1"
    q: "在同一数据集上建有两个部件。 默认情况下,点击 1:"
    options:
      - "对别人无动于衷"
      - "过滤对方——它们自动对面"
      - "打开新镜头"
      - "需要绑定交互"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-2"
    q: "为什么你会故意把正面转向一个部件?"
    options:
      - "改善业绩"
      - "因为它是一个参考——一个公司总数,它必须保持固定 同时其他的一切过滤, 所以读者可以看到 部分对整体"
      - "面对总是不对劲"
      - "隐藏数据"
    answer: 1
    topic: "interactions"
  - id: "interactions-faceting-and-filters-3"
    q: "查看器过滤到一个区域,部件则空白。 最相似的原因是:"
    options:
      - "一个中断的查询"
      - "该部件的数据集对该地区没有行——需要标签而不是固定的诚实空态"
      - "面孔已禁用"
      - "安全前提"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-1"
    q: "一个仪表板打开显示所有区域和所有的时间。 就区域主任而言,这意味着:"
    options:
      - "最大灵活性"
      - "每天早上在屏幕说出任何相关内容前 都点击三次"
      - "更快的加载"
      - "加强安保"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-2"
    q: "浏览器点击一段后,屏幕会被过滤. 最重要的内容是:"
    options:
      - "动画"
      - "显示当前选择的明显迹象和明确选择的明显方式"
      - "工具提示"
      - "第二个图表"
    answer: 1
    topic: "interactions"
  - id: "interactions-selection-and-initial-state-3"
    q: "一个保存的视图是:"
    options:
      - "仪表板副本"
      - "被记住的状态——过滤和选择,所以有人返回他们的切片而无需重点击"
      - "预定的电子邮件"
      - "权限设置"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-1"
    q: "从一个汇总的仪表板到一个细节的链接可以让你:"
    options:
      - "避免建立摘要"
      - "简表小一点,因为细节是一击即逝 而不是挤在"
      - "跳过安全性"
      - "提高查询性能"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-2"
    q: "从例外表格中进行钻探最有用的目的地通常是:"
    options:
      - "一个不同的仪表板的主状态"
      - "那个 Salesforce 记录在那一行, 工作实际上发生的地方"
      - "PDF 导出"
      - "数据集"
    answer: 1
    topic: "interactions"
  - id: "interactions-drill-down-and-navigation-3"
    q: "在未过滤细节仪表板上降落的钻头是:"
    options:
      - "精细"
      - "断开的钻头——整点是目的地继承您点击的上下文"
      - "更灵活"
      - "快点"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-1"
    q: "同一数据集的两个部件 。 单击一个:"
    options:
      - "无所事事"
      - "默认过滤另一个"
      - "需要绑定"
      - "打开镜头"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-2"
    q: "您在部件上切换面部, 主要是当 :"
    options:
      - "慢一点"
      - "它是一个必须固定的参考物,而其他的一切过滤"
      - "这是一张桌子"
      - "没有标题"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-3"
    q: "一半的部件响应过滤器,一半不响应。 这是:"
    options:
      - "常规"
      - "危险状态——屏幕是虚假的,而每个部件都个别正确"
      - "一个缓存问题"
      - "许可证限制"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-4"
    q: "仪表板应打开:"
    options:
      - "未过滤,显示一切"
      - "在常见的情况下——本期,观众的范围,排序和有限."
      - "在一片空白状态"
      - "在去年的时候"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-5"
    q: "显示除完整月份以外的部分当月:"
    options:
      - "是最新视图"
      - "每月制造量明显下降,除非排除或标出"
      - "提高准确性"
      - "没有效果"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-6"
    q: "过滤仪表板必须显示其选择,因为:"
    options:
      - "它看起来是tider"
      - "它将被截图,过滤器在图像中看不见"
      - "面对面需要它"
      - "能加速查询"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-7"
    q: "保存的视图对于:"
    options:
      - "管理员"
      - "任何人的切片总是一样, 否则谁会每天重点击它"
      - "仅移动用户"
      - "导出"
    answer: 1
    topic: "interactions"
  - id: "interactions-graded-quiz-8"
    q: "在未过滤的目的地降落的钻井:"
    options:
      - "给予更大的灵活性"
      - "在实际操作中被打破——被点击一次然后被放弃"
      - "装入速度更快"
      - "是标准模式"
    answer: 1
    topic: "interactions"
  - id: "bindings-index-1"
    q: "面部和绑定之间的区别是:"
    options:
      - "没有"
      - "面对面是同一数据集部件之间的自动;绑定是您配置的明确线条"
      - "装订更快"
      - "面对需要 SAQL"
    answer: 1
    topic: "bindings"
  - id: "bindings-index-2"
    q: "加入任何仪表板的最好的第一个装订是:"
    options:
      - "有条件的部件可见度"
      - "显示当前选择的动态标题"
      - "嵌入式过滤链"
      - "跨数据集面"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-1"
    q: "什么是约束?"
    options:
      - "数据集之间的结合"
      - "一个部件的状态为另一个部件的查询或显示"
      - "安全设置"
      - "图表类型"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-2"
    q: "捆绑物的最佳第一用途通常是:"
    options:
      - "有条件的部件可见度"
      - "显示当前选择的动态标题"
      - "嵌入式依赖过滤器"
      - "跨数据集对面"
    answer: 1
    topic: "bindings"
  - id: "bindings-bindings-basics-3"
    q: "捆绑的仪表板的主要长期成本是:"
    options:
      - "查询性能"
      - "没有人能够安全地改变它——逻辑存在于难以读取且无法调试的部件配置中"
      - "许可证消费"
      - "浏览器内存"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-1"
    q: "一个选择约束最重要的边缘案例是:"
    options:
      - "多个选择"
      - "无选中内容 — 当源代码为空时绑定部件会做什么"
      - "慢查询"
      - "颜色对比"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-2"
    q: "依赖过滤器( 区域缩小代表列表) 值得构建 :"
    options:
      - "总是"
      - "依赖名单足够长,扫描它确实需要花费40名代表,而不是4名代表。"
      - "从不"
      - "只针对管理员"
    answer: 1
    topic: "bindings"
  - id: "bindings-selection-bindings-3"
    q: "动态标题约束很有价值,主要是因为:"
    options:
      - "它看起来很活跃"
      - "仪表板的过滤状态在没有上下文的情况下被截取到信件中"
      - "它能提高性能"
      - "面对面需要它"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-1"
    q: "具有约束力的结果如下:"
    options:
      - "观众选择的"
      - "另一个部件查询返回的值"
      - "数据集的元数据"
      - "那个 URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-2"
    q: "具有约束力的结果的性能成本是:"
    options:
      - "将数据量翻倍"
      - "它会创建执行命令—— 依赖的部件在源头返回之前无法启动"
      - "它禁用缓存"
      - "没有"
    answer: 1
    topic: "bindings"
  - id: "bindings-results-bindings-3"
    q: "调试结果绑定比选择绑定更难,因为:"
    options:
      - "语法不同"
      - "输入在屏幕上是隐形的——您必须跟踪查询而不是查看选择"
      - "无法测试"
      - "它要求管理权"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-1"
    q: "连锁绑定的主要风险是:"
    options:
      - "数据准确性"
      - "连续处决和依赖 无人能见,所以更改为 A 断裂 C 的原因看不见"
      - "许可证费用"
      - "浏览器兼容性"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-2"
    q: "一个仪表板有太多束缚的实际信号是:"
    options:
      - "文件大小"
      - "作者以外的人不能安全地改变它 所以他们建造了一个新的仪表板"
      - "部件数量"
      - "缓慢的渲染"
    answer: 1
    topic: "bindings"
  - id: "bindings-nesting-and-limits-3"
    q: "最便宜的 保持捆绑的仪表盘 维护是:"
    options:
      - "减少部件"
      - "每一捆绑物的描述中有一行——什么能提供什么,为什么"
      - "更多颜色"
      - "查询的命名公约"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-1"
    q: "捆绑与面对面不同的原因是:"
    options:
      - "比较快"
      - "它是您配置的清晰的线条, 在相同数据集部件之间自动显示面部"
      - "这需要 SAQL"
      - "横跨半兽人"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-2"
    q: "任何仪表板上最好的第一装订是:"
    options:
      - "有条件的可见度"
      - "带有选择的动态标题"
      - "嵌入式过滤链"
      - "切换措施"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-3"
    q: "具有约束力的结果如下:"
    options:
      - "观众的选择"
      - "返回另一个查询的值"
      - "数据集元数据"
      - "页面 URL"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-4"
    q: "结果约束使仪表板缓慢,因为它们:"
    options:
      - "增加数据量"
      - "序列执行 — 依赖部件等待源"
      - "禁用缓存"
      - "强制全新刷新"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-5"
    q: "必须始终定义的边框是:"
    options:
      - "过多行"
      - "无选择"
      - "缓慢的网络"
      - "一个小屏幕"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-6"
    q: "先前选定的代表不再在范围之内的附属过滤器应:"
    options:
      - "继续过滤到那个代表"
      - "清除 Stale 选择"
      - "显示错误"
      - "重新装入页面"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-7"
    q: "5个部件绑在一个过滤器上,对一个链中3个。 哪个更可靠?"
    options:
      - "链条——约束较少"
      - "五——广度是可预测的,深度不是的."
      - "二者等同,无异"
      - "也不能维持"
    answer: 1
    topic: "bindings"
  - id: "bindings-graded-quiz-8"
    q: "公司衡量标准应采用对每一负载有约束力的结果来计算,而不是:"
    options:
      - "在浏览器中缓存"
      - "在食谱中计算一次并存储为字段"
      - "输入为常数"
      - "删除"
    answer: 1
    topic: "bindings"
  - id: "dashboard-json-index-1"
    q: "编辑仪表板的最佳理由 JSON 直接为:"
    options:
      - "这比建筑师的日常工作要快"
      - "批量和重复的修改 构建器使您一次做一个部件"
      - "它解锁隐藏图表类型"
      - "它绕过安全"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-index-2"
    q: "一个仪表板 JSON 有助于审查,因为:"
    options:
      - "它在浏览器中制作"
      - "这是文字——它很模糊,所以修改是可审查的,而不是在会议上描述的"
      - "它比仪表板还小"
      - "它包含数据"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-1"
    q: "在仪表板文档中,“步骤”是:"
    options:
      - "一个向导页面"
      - "查询定义——部件从中提取的数据"
      - "排版断点"
      - "允许"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-2"
    q: "多个部件显示的大小不同。 理想的情况是:"
    options:
      - "每个人决定自己的步骤"
      - "共享一步, 因为不同的查询次数是负载时间的主要杠杆"
      - "使用单独的数据集"
      - "合并为一个部件"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-anatomy-3"
    q: "部件和布局是分开的,因为:"
    options:
      - "历史事故"
      - "一个部件是绘制的;一个布局是它坐的地方——所以一个部件可以不同屏幕大小地放置"
      - "布局存储数据"
      - "无法定位部件"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-1"
    q: "手写的一步 SAQL 而不是点击定义为:"
    options:
      - "无效"
      - "Fine, 建设者更难进行往返——界面可能无法重新编辑它"
      - "快点"
      - "自动共享"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-2"
    q: "静态步骤用于:"
    options:
      - "缓存查询结果"
      - "未从数据集查询的固定值列表——切换选项,阈值"
      - "安全规则"
      - "版式定义"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-steps-and-queries-3"
    q: "仪表板载荷时间的主要杠杆,可见于 JSON,即:"
    options:
      - "部件数量"
      - "不同步骤的数量——可以共享查询但每个步骤定义自己的部件"
      - "文件大小"
      - "版式数量"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-1"
    q: "一个部件在桌面上看对,在电话上看错. 问题在于:"
    options:
      - "步骤"
      - "一个布局——每个断点分别定义位置和大小"
      - "数据集"
      - "安全前提"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-widgets-and-layouts-2"
    q: "作为文本编辑部件属性对于:"
    options:
      - "建造一个新的仪表板"
      - "对许多部件同时应用相同的格式变化"
      - "更改数据集"
      - "添加安全性"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-1"
    q: "在手工编辑仪表板之前,你应该:"
    options:
      - "清除缓存"
      - "导出副本 —— 撤消故事是您事先保存的 。"
      - "通知所有观众"
      - "禁用调度"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-2"
    q: "保持仪表板的主要治理效益 JSON 在存储器中:"
    options:
      - "更快的加载"
      - "更改改为可复核的 diff 而不是在会议上的句子"
      - "加强安保"
      - "较小的文件大小"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-editing-safely-3"
    q: "经过手编辑后,往返测试为:"
    options:
      - "检查数据正确"
      - "在构建器中重新装入以确认它仍然打开, 并且仍然在视觉上编辑"
      - "运行配方"
      - "清除选择"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-1"
    q: "仪表板文件的一个步骤是:"
    options:
      - "一个向导页面"
      - "命名查询定义"
      - "排版断点"
      - "共享规则"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-2"
    q: "部件通过下列方式引用其数据:"
    options:
      - "包含 SAQL 内嵌"
      - "命名一个步骤"
      - "指向数据集 ID"
      - "从布局中继承"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-3"
    q: "仪表板只在电话上看错了 查看内容 :"
    options:
      - "步骤"
      - "版式"
      - "数据集"
      - "前提"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-4"
    q: "12个部件的11个步骤建议:"
    options:
      - "不错的分离"
      - "几乎没有什么是共享的, 屏幕正在做11个往返"
      - "一个腐败的文件"
      - "部件太少"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-5"
    q: "在继承的仪表板上找到每个装订物的最快方法是:"
    options:
      - "打开每个部件的面板"
      - "搜索 JSON 用于绑定语法"
      - "问作者"
      - "检查数据集"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-6"
    q: "在手动编辑之前,你应该总是:"
    options:
      - "清除选择"
      - "导出副本"
      - "暂停调度"
      - "通知观众"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-7"
    q: "往返测试检查:"
    options:
      - "数据准确"
      - "构建者仍然可以在您编辑后打开并视像编辑仪表板"
      - "文件很小"
      - "仍然适用安保措施"
    answer: 1
    topic: "dashboard-json"
  - id: "dashboard-json-graded-quiz-8"
    q: "哪些改动最好留给构建者而不是作为文本进行?"
    options:
      - "将字段重命名到部件之间"
      - "添加或删除部件, 因为每个布局都必须一致"
      - "更改数字格式"
      - "编辑标题"
    answer: 1
    topic: "dashboard-json"
---

分析板执行领域的实践问题 CRM Analytics 和 Einstein Discovery 顾问考试.
