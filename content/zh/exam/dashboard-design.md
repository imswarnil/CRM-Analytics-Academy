---
title: "分析板设计-实践问题"
domain: "dashboard-design"
quiz:
  - id: "data-visualization-index-1"
    q: "在选择图表类型之前, 第一个问题是什么 ?"
    options:
      - "哪一种在品牌颜色中看起来最好?"
      - "读者应该作什么比较?"
      - "数据集中有多少行?"
      - "哪个类型 CRM Analytics 支持吗?"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-index-2"
    q: "条形图按字母顺序排序,而不是按数值排列:"
    options:
      - "变速"
      - "隐藏排名, 这通常是某人绘制条形图的原因 。"
      - "更准确一点"
      - "没有什么区别"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-1"
    q: "你有一个维度,有40个类别和一个度量。 最好的第一选择是:"
    options:
      - "一个派图"
      - "最高 N 的水平条形图, 标题限制"
      - "线条图"
      - "一个散开的图"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-2"
    q: "两个措施,你想知道它们是否一起移动。 图表如下:"
    options:
      - "双轴线图"
      - "一个散块图,每轴一个度量"
      - "两个单独的条形图"
      - "叠列"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-choosing-a-chart-3"
    q: "为什么横向通常优于纵向的绝对条?"
    options:
      - "变快了"
      - "分类名称是单词,单词按照水平轴读取,而不是在一个列下旋转"
      - "垂直条已贬值"
      - "空间少了"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-1"
    q: "栏(垂直)图表何时应比栏(横向)图表?"
    options:
      - "总是——垂直是标准"
      - "当分类被命令时, 比如几个月, 读者期望从左到右运行"
      - "有很多种类"
      - "当标签是长的"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-2"
    q: "分组或堆叠, 当读者需要比较各个分组的每个子类别时?"
    options:
      - "堆叠——显示总数"
      - "分组——只有堆栈的底层部分共享基线,所以其他部分无法用眼睛进行比较"
      - "两个都一样"
      - "都不是; 使用馅饼"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-bar-and-column-3"
    q: "一个条形图的轴从40而不是0开始. 这是:"
    options:
      - "罚款和标准"
      - "对条的误导——条长是编码,所以一个短轴错报了条之间的比例"
      - "可读性要求"
      - "只有打印问题"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-1"
    q: "双轴图表显示6月份的收入和人口统计交叉。 过关是什么意思?"
    options:
      - "超额收入"
      - "没什么 —— 过境点由您设置两轴的位置决定, 而不是数据"
      - "它们是相互关联的"
      - "六月是断月"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-2"
    q: "您的数据集在一个月内没有行, 没有活动 。 线路图应:"
    options:
      - "直接穿过缺口"
      - "如果零为真,则显示0, 如果值为真未知, 则显示间断—— 它们意味着不同的事物"
      - "隐藏月份"
      - "内插平均数"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-line-and-area-3"
    q: "线路图在停止工作前能携带多少系列?."
    options:
      - "一个"
      - "大约4个,只有以颜色和形状分隔"
      - "十个"
      - "无限制的传奇"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-1"
    q: "甜甜圈在读者停止比较前可以携带多少片?"
    options:
      - "大概三四个"
      - "大约10个"
      - "二十个标签"
      - "没有限制"
    answer: 0
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-2"
    q: "一个100%的叠条随时间推移最能显示:"
    options:
      - "绝对增长"
      - "MIX是否已经改变——以完全隐藏大小为代价"
      - "个人价值"
      - "用户"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-part-of-whole-3"
    q: "具体百分比物质的构成数据通常最好显示为:"
    options:
      - "一个甜甜圈"
      - "带有共享列的排序表"
      - "树图"
      - "仪表"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-1"
    q: "公司使用率为88%。 为什么这样可能没用?"
    options:
      - "这太精确了"
      - "它可能是平均30%和140%的账户,它们需要相反的行动,而且两者都看不见。"
      - "百分比完全不能平均"
      - "应该是中位数"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-2"
    q: "一个散乱的图解答了一个没有条形图能回答的问题?"
    options:
      - "哪个类别是最大的"
      - "是否同时在许多实体采取两项措施"
      - "时事变迁"
      - "每一个部分的共享是"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-scatter-and-distribution-3"
    q: "气泡图的第三度量编码为:"
    options:
      - "颜色"
      - "泡泡区"
      - "第三轴上的位置"
      - "标签大小"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-1"
    q: "是什么使一个 KPI 数字可操作?"
    options:
      - "一个更大的字体"
      - "比较和方向——对照计划或上一时期,用箭头"
      - "货币符号"
      - "颜色背景"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-2"
    q: "当:"
    options:
      - "显示任何单个数字"
      - "有个真正的固定目标 问题是\"我们有多近\""
      - "数字是百分比"
      - "空间有限"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-numbers-gauges-and-sparklines-3"
    q: "CAC的回报从15.3个月下降到14.2个月. 箭头应该是:"
    options:
      - "下红"
      - "绿色和绿色——善良是衡量标准的一部分,而不是方向"
      - "绿色"
      - "无箭头"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-1"
    q: "一张桌子什么时候跳完一张图?"
    options:
      - "从不"
      - "当每行的特性重要——哪个账户,哪个交易——或确切的值确实重要时,"
      - "当有超过20行"
      - "当数据为文本时"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-2"
    q: "在仪表盘上带有滚动条的表格通常意味着:"
    options:
      - "良好的信息密度"
      - "它已成为数据导出而非仪表板部件"
      - "这些行需要排序"
      - "字体太大了"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-tables-and-pivots-3"
    q: "表中的数字应为:"
    options:
      - "与文本左对齐"
      - "与十进制一致对齐,所以量值可以比较"
      - "居内"
      - "按数值颜色"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-1"
    q: "你们有六个销售区的收入 地图是正确的图吗?"
    options:
      - "是 -- -- 区域为地理区域"
      - "通常不会 —— 有六个类别, 一个排序的栏, 精确排列它们, 其中地图让读者估算颜色 。"
      - "是的,如果颜色是无障碍的"
      - "只有传说"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-2"
    q: "按国家划分的原始收入组合主要显示:"
    options:
      - "你的产品表现最好的地方"
      - "大部分人和最大的经济体"
      - "市场份额"
      - "增长"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-maps-3"
    q: "通常的解决方法是:"
    options:
      - "不同的颜色尺度"
      - "正常化——人均或市场规模人均收入"
      - "消除小国"
      - "使用泡泡图"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-1"
    q: "漏斗的长度为210万个课,直线范围为506个机会。 发生了什么事?"
    options:
      - "读得很清楚"
      - "第二步之后的每个阶段都是支点 最重要的阶段变得无形"
      - "图表错误"
      - "百分比错误"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-2"
    q: "瀑布图用于:"
    options:
      - "排名类别"
      - "显示一系列增减从一个总数到另一个总数的方式"
      - "比较两项措施"
      - "地理数据"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-funnels-and-waterfalls-3"
    q: "应订购漏斗级:"
    options:
      - "按规模"
      - "按程序顺序"
      - "按字母顺序"
      - "按换算率"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-1"
    q: "哪个是检验图表是否诚实的可靠标准?"
    options:
      - "上面的每个号码都没错"
      - "读者四秒钟后得出的结论是真的"
      - "它使用品牌调色板"
      - "有个传说"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-2"
    q: "截断y轴在留存的行图上可防守,但在条形图上则不可防守. 为什么?"
    options:
      - "酒吧是旧技术"
      - "条长是编码, 因此切线错误表示条间的比例; 一条线编码为坡度"
      - "线条不能显示小值"
      - "永远无法辩护"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-chart-honesty-3"
    q: "商业报告中最常见的不诚实图表是:"
    options:
      - "3D馅饼"
      - "需要分母的原始总数——计算一个费率是问题在哪里"
      - "日志比例"
      - "双轴"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-1"
    q: "在选择图表类型之前的第一个问题是:"
    options:
      - "这里有多少行"
      - "读者必须作什么比较"
      - "可用的颜色"
      - "哪些类型 CRM Analytics 支持"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-2"
    q: "通常应排列一个绝对条形图:"
    options:
      - "按字母顺序"
      - "按尺度递减"
      - "以维度的标识"
      - "随机"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-3"
    q: "分组而不是堆叠条,因为:"
    options:
      - "堆叠更难颜色"
      - "只有堆栈的底层部分共享基线,所以其他部分无法用眼睛进行比较"
      - "组合栏较窄"
      - "堆栈无法显示总计"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-4"
    q: "甜甜圈停止工作 大约:"
    options:
      - "两片"
      - "四块"
      - "十块"
      - "二十块"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-5"
    q: "哪个问题只有散乱的情节才能回答?"
    options:
      - "哪个类别是最大的"
      - "两项措施是否跨越许多实体"
      - "一个数值如何随时间而变化"
      - "每一部分的分担额"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-6"
    q: "页:1 KPI 数字在下列情况下可操作:"
    options:
      - "一个更大的字体"
      - "比较和方向"
      - "货币符号"
      - "颜色背景"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-7"
    q: "CAC回扣应显示为:"
    options:
      - "红色向下箭头"
      - "绿色向下箭头——善良属于度量衡,而不是方向"
      - "无箭头"
      - "向上箭头"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-8"
    q: "一个覆盖210万届的漏斗到506个线性机会:"
    options:
      - "阅读精细"
      - "把以后的阶段变成支点 隐藏最重要的阶段"
      - "错误"
      - "反转"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-9"
    q: "按国家划分的原始收入组合主要显示:"
    options:
      - "产品市场合适"
      - "人口和经济体最多的地方"
      - "增长"
      - "边距"
    answer: 1
    topic: "data-visualization"
  - id: "data-visualization-graded-quiz-10"
    q: "商业报告中最常见的不诚实图表是:"
    options:
      - "3D 派图"
      - "一个需要分母的原始总数"
      - "日志比例"
      - "堆叠区域"
    answer: 1
    topic: "data-visualization"
  - id: "lenses-and-explorations-index-1"
    q: "什么是镜片 最好的理解?"
    options:
      - "完成报告"
      - "一个数据集的可支配工作空间"
      - "仪表板模板"
      - "保存的查询, 只有管理员才能创建"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-index-2"
    q: "为什么切换到 SAQL 模式 :"
    options:
      - "运行得更快"
      - "你已经知道答案是什么了 所以阅读生成的查询是最便宜的学习语言的方法"
      - "图表在 SAQL 模式"
      - "保存前需要它"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-1"
    q: "CRM Analytics 默认情况下按分组排序组图。 为什么改变它?"
    options:
      - "字母顺序无效"
      - "组合图的点通常为排列顺序,按字母顺序隐藏"
      - "按度量排序的速度更快"
      - "面对面需要它"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-2"
    q: "在条形图中添加第二个分组通常:"
    options:
      - "双倍的洞察力"
      - "更难读 值得抵制 除非比较是重点"
      - "断面"
      - "更改计量"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-explorer-basics-3"
    q: "在线粒体中,“行数”表示:"
    options:
      - "交易次数"
      - "细列项目数量——交易使用交易密钥的明显计数"
      - "账户数"
      - "产品数量"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-1"
    q: "一张图表显示一个收入不可能很高的部分。 下一步最快的步骤是什么?"
    options:
      - "更改图表类型"
      - "切换到表格模式并查看其后面的行"
      - "重建镜头"
      - "检查仪表板过滤器"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-the-three-modes-2"
    q: "SAQL 模式对学习者最有价值,因为:"
    options:
      - "跑得比点击快"
      - "它显示您点击生成的查询, 与您已经知道的答案相对应"
      - "这是过滤的唯一方法"
      - "图表无法按日期分组"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-1"
    q: "最能决定自然语言查询是否有效呢?"
    options:
      - "所选图表类型"
      - "数据集的字段元数据的质量——标签,格式和隐藏管道"
      - "用户数"
      - "更新时间表"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-conversational-analytics-2"
    q: "自然语言答案的重要失败模式是:"
    options:
      - "运行缓慢"
      - "回答一个与所问问题截然不同的问题 流利而无差别"
      - "无法生成图表"
      - "需求 SAQL 知识"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-1"
    q: "镜头最好描述为:"
    options:
      - "完成报告"
      - "一个数据集的可支配工作空间"
      - "仪表板模板"
      - "一个保存 SAQL 脚本"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-2"
    q: "分组图上的默认排序由分组进行。 你通常改变它,因为:"
    options:
      - "字母顺序无效"
      - "排名一般是点数,按字母顺序隐藏"
      - "变快了"
      - "面对需要它"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-3"
    q: "在线粒体中,要计算交易,请使用:"
    options:
      - "行数"
      - "机会之关键"
      - "数额合计"
      - "平均数"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-4"
    q: "在条形图中添加第二个分组通常:"
    options:
      - "双倍的洞察力"
      - "更难读 值得抵制 除非比较是重点"
      - "断面"
      - "更改计量"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-5"
    q: "图表看起来不对 最快的诊断是:"
    options:
      - "更改图表类型"
      - "切换到表格模式并读取行"
      - "重建镜头"
      - "检查共享"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-6"
    q: "从探险家那里学习查询语言的最佳方式是:"
    options:
      - "读取函数引用结束为结束"
      - "点击,然后读取 SAQL 您点击一个您已经知道的答案"
      - "从零开始写入查询"
      - "复制论坛实例"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-7"
    q: "以“ Stage! = 关闭 Lost” 写成的过滤器也会删除:"
    options:
      - "没有别的了"
      - "阶段无效的行"
      - "关闭元行"
      - "来自其他数据集的行"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "lenses-and-explorations-graded-quiz-8"
    q: "自然语言查询结果应作为:"
    options:
      - "引用的最后答案"
      - "在表格模式下验证的起点, 因为它即使回答不同的问题也会流利回答"
      - "无法使用"
      - "等效于保存的镜片"
    answer: 1
    topic: "lenses-and-explorations"
  - id: "designing-dashboards-index-1"
    q: "是什么使一个仪表板完成?"
    options:
      - "每个请求的部件都存在"
      - "观众可以做决定 它的存在是为了, 快速和没有你"
      - "它使用公司颜色"
      - "它没有空格"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-index-2"
    q: "一个利益攸关方要求获得第九个部件。 第一个问题是:"
    options:
      - "你想要哪种图表类型?"
      - "你会怎么做不同 取决于它显示什么?"
      - "能等下个冲刺吗?"
      - "你有数据吗?"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-1"
    q: "最重要的号码在哪里?"
    options:
      - "中心,最大"
      - "左上, 读取顺序开始的地方"
      - "底部,作为结论"
      - "任何地方;人们随机扫描"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-layout-and-hierarchy-2"
    q: "为什么将相关的部件和组之间的空格组合在一起?"
    options:
      - "它看起来是tider"
      - "近似意味着关系——放在一起的部件被理解为属于一起,无论它们是否属于."
      - "它能提高性能"
      - "这需要面对面"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-1"
    q: "为什么有色三角洲也要带方向箭头或标签?"
    options:
      - "看上去比较专业"
      - "因为光彩就排除了色盲读取器,并且无法幸存打印或灰度截图"
      - "箭头变速"
      - "这是需要的 Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-2"
    q: "红色/琥珀/绿色阈值应来自何处?"
    options:
      - "射程的三分之一"
      - "生意——某人实际做不同事情的数字."
      - "调色板的默认值"
      - "平均数"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-conditional-formatting-3"
    q: "多数细胞有色的仪表板有:"
    options:
      - "最大信息密度"
      - "没有信号了——如果强调一切,什么也不是"
      - "改善无障碍环境"
      - "更快的加载时间"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-1"
    q: "桌子什么时候会比图表好?"
    options:
      - "从不"
      - "当每一行的身份都很重要时——哪个具体帐户,哪个具体处理."
      - "当有许多行"
      - "当数据为数字时"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-2"
    q: "变成什么 KPI 数字变成一个可操作的?"
    options:
      - "一个更大的字体"
      - "比较——与计划比较,与上一期间比较——和方向"
      - "货币符号"
      - "边框"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-tables-kpis-and-micro-charts-3"
    q: "显示所有140个账户的数值表通常是:"
    options:
      - "彻底"
      - "戴着仪表板的衣服的数据导出"
      - "要求准确性"
      - "比图表快"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-1"
    q: "仪表板载荷时间最大的单一杠杆通常是:"
    options:
      - "图表类型"
      - "不同的查询数量——可以共享一个查询但每个查询都运行自己的部件"
      - "浏览器选择"
      - "颜色深度"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-performance-2"
    q: "一个非常精细的谷物的数据集使仪表板变慢,因为:"
    options:
      - "精细的谷物储存效率低"
      - "每个部件在查询时间、每个负载、每个查看器上集合数百万行"
      - "面孔已禁用"
      - "它不能被索引"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-1"
    q: "为什么漏斗按舞台顺序而不是大小排序?"
    options:
      - "变快了"
      - "顺序是参数——相邻阶段之间的下降是发现"
      - "Salesforce 需要这个"
      - "来配合桌子"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-2"
    q: "为什么覆盖部件会关闭面部?"
    options:
      - "业绩"
      - "它与整个季度相对照——如果它过滤出其他一切,比较就会消失。"
      - "它使用不同的数据集"
      - "面临间断比率"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-hands-on-pipeline-dashboard-3"
    q: "管道趋势按创建月而不是接近月分类,原因是:"
    options:
      - "关闭日期不可靠"
      - "在错误日期上合起来扭曲了最近和过去的时期,但两者都保持个别正确"
      - "创建的月份会更快"
      - "没有区别"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-1"
    q: "当:"
    options:
      - "每个请求的部件都存在"
      - "它的观众可以做决定 它的存在,快速和没有你"
      - "它与品牌调色板相匹配"
      - "没有空格"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-2"
    q: "标题编号属于 :"
    options:
      - "中间"
      - "左上, 读取顺序开始的地方"
      - "下层"
      - "在过滤器旁边"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-3"
    q: "左上角的过滤器是一个错误,因为:"
    options:
      - "他们很慢"
      - "他们把最宝贵的空间花在屏幕上 控制别人,直到第二次访问"
      - "无法调整大小"
      - "他们无法约束"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-4"
    q: "部件标题应包含:"
    options:
      - "只有措施"
      - "测量、时间段、过滤器和任何限制——将在没有上下文的情况下进行截图"
      - "提交人的姓名"
      - "数据集名称"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-5"
    q: "漏斗图应当排序:"
    options:
      - "按大小递减"
      - "按程序顺序"
      - "按字母顺序"
      - "截至日期"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-6"
    q: "为什么有色三角洲还要带箭头或标签?"
    options:
      - "美学"
      - "仅彩色就排除彩色盲读器, 以灰度表示死亡"
      - "箭头变快"
      - "这是强制性的 Salesforce"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-7"
    q: "页:1 KPI 数字在下列情况下成为可操作:"
    options:
      - "一个更大的字体"
      - "比较和方向"
      - "边框"
      - "货币符号"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-8"
    q: "慢仪表盘上最大的杠杆通常是:"
    options:
      - "图表类型"
      - "合并可以共享一个查询的部件"
      - "颜色减少"
      - "更快的浏览器"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-9"
    q: "需要滚动的仪表板上的一个桌子有:"
    options:
      - "良好的信息密度"
      - "停止作为仪表板部件并成为数据导出"
      - "字体太大"
      - "排序错误"
    answer: 1
    topic: "designing-dashboards"
  - id: "designing-dashboards-graded-quiz-10"
    q: "共享仪表盘前的最后一张支票是:"
    options:
      - "拼写检查标题"
      - "打开它作为受限制的用户,并调和标题与独立真实的东西"
      - "导出为 PDF"
      - "添加更多部件"
    answer: 1
    topic: "designing-dashboards"
---

分析板设计领域的实践问题 CRM Analytics 和 Einstein Discovery 顾问考试.
