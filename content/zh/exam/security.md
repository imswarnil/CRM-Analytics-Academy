---
title: "安全——实践问题"
domain: "security"
quiz:
  - id: "setup-index-1"
    q: "为什么 CRM Analytics 访问是通过权限设定而不是配置?"
    options:
      - "配置文件已贬值"
      - "分析允许船舶作为许可设定许可 以添加剂方式授予, 因此访问是由 而不是烤成一个剖面"
      - "配置文件不能允许对象访问"
      - "这是一个许可证错误"
    answer: 1
    topic: "setup"
  - id: "setup-index-2"
    q: "一个仪表板对你是正确的,对销售团队来说是空的。 最可能的原因是:"
    options:
      - "断开的部件查询"
      - "行级安全——上游或共享遗产正在过滤他们的行"
      - "数据集更新失败"
      - "他们需要一个不同的浏览器"
    answer: 1
    topic: "setup"
  - id: "setup-index-3"
    q: "何时设计安全?"
    options:
      - "在仪表板被批准后"
      - "在建立第一个数据集之前,因为上游依赖于必须同步的字段,有时还依赖于一个使角色等级平分的食谱节点"
      - "只有在数据敏感时"
      - "是自动的"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-1"
    q: "系统管理员无法看到 Analytics Studio 瓷砖 发生什么事了?"
    options:
      - "他们的配置有错"
      - "没什么不对的... CRM Analytics 访问通过权限设定进行,管理权限不包括"
      - "矿石没有数据"
      - "他们必须是一个 Salesforce 平台用户"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-2"
    q: "哪些能力处于较高的(Plus)级别,而不是基础一级?"
    options:
      - "大楼仪表板"
      - "Einstein Discovery 培训故事和部署预测模型"
      - "创建数据集"
      - "共享应用程序"
    answer: 1
    topic: "setup"
  - id: "setup-licences-and-permission-sets-3"
    q: "发现用户缺失的最快方法是:"
    options:
      - "把他们的档案和你的比较"
      - "打开他们的用户记录并阅读权限设定任务,然后检查Org的许可权限"
      - "重建仪表板"
      - "叫他们登出和登入"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-1"
    q: "集成用户缺乏对Discount c的外地一级访问. 发生什么事了?"
    options:
      - "同步失败并出错"
      - "现场从未到来;食谱和仪表板建立干净而悄悄的计算数字,没有折扣."
      - "球场是空的,标有标记"
      - "Salesforce 自动授权访问"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-2"
    q: "为什么这种失败特别危险?"
    options:
      - "它腐蚀了数据集"
      - "它沉默不语,产生可信的数字, 所以它活下来的审查"
      - "它删除记录"
      - "只影响管理员"
    answer: 1
    topic: "setup"
  - id: "setup-the-integration-user-3"
    q: "上个月添加了一个新的自定义字段, 但没有在数据集中 。 先检查一下?"
    options:
      - "仪表盘的部件查询"
      - "字段是否添加到数据同步选择中, 是否为集成用户可见"
      - "安全前提"
      - "应用程序共享设置"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-1"
    q: "安全前提在哪里适用?"
    options:
      - "设计时在每个部件上"
      - "在数据集中, 查询时, 每个查看器"
      - "在食谱中,在建设时"
      - "在应用程序的共享设置上"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-2"
    q: "为什么角色等级的上游通常在食谱中需要\"夸大\"节点?"
    options:
      - "减少行数"
      - "由于一个上游无法在查询时间行走等级——祖先必须预先计算成一个可以比较的列."
      - "排序数据"
      - "没有,扁平是可选的样式"
    answer: 1
    topic: "setup"
  - id: "setup-row-level-security-3"
    q: "你加一个上游,你自己的仪表板就空了 最相似的解释是:"
    options:
      - "数据集已经腐败了"
      - "上游也为你评估,而您的用户不能满足它"
      - "食谱失败"
      - "只能为管理员工作"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-1"
    q: "分享遗产相对于手写上游的主要优势是什么?"
    options:
      - "查询速度快"
      - "它重用Org现有的共享,因此分析学不能随着业务重组从CRM中漂移"
      - "它支持更多对象"
      - "它取消了对集成用户的需要"
    answer: 1
    topic: "setup"
  - id: "setup-sharing-inheritance-2"
    q: "为什么分享遗产需要回落的前提?"
    options:
      - "仅限非销售量数据"
      - "因为继承是有限度的——当用户的分享过于复杂无法评价时,倒置者决定他们所看到的."
      - "加速仪表板"
      - "不需要一个"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-1"
    q: "一个新的 CRM Analytics 特性切换在发布后出现。 你该从哪里开始?"
    options:
      - "生产,所以每个人都立即受益"
      - "沙盒或开发者 Og, 行为变化不能影响实时仪表板"
      - "无处——永远不启用新功能."
      - "没有区别"
    answer: 1
    topic: "setup"
  - id: "setup-org-settings-and-rollout-2"
    q: "新仪表板的第一观众是什么?"
    options:
      - "整个公司,最大限度地反馈"
      - "有两三个人会做出它支持的决定"
      - "仅主管"
      - "没有人——默出版"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-1"
    q: "安全上游配置在哪里?"
    options:
      - "在仪表板上"
      - "在数据集上"
      - "在应用程序上"
      - "在用户配置文件上"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-2"
    q: "你自己的仪表板在添加了上游后就空了 发生了什么事?"
    options:
      - "数据集已中断"
      - "上游也适用于你,而你的用户不能满足它"
      - "指定禁用仪表板"
      - "食谱需要重新运行"
    answer: 1
    topic: "setup"
  - id: "setup-hands-on-locking-down-the-academy-3"
    q: "用户的区域字段为空白 。 他们看到了什么?"
    options:
      - "所有的东西"
      - "什么都没有——一无所有"
      - "只有他们自己的记录"
      - "错误消息"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-1"
    q: "系统管理员没有 Analytics Studio 瓷砖 为什么?"
    options:
      - "他们的档案坏了"
      - "CRM Analytics 访问通过权限设定; 管理权限不包括"
      - "矿石没有数据"
      - "他们必须是平台用户"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-2"
    q: "Einstein Discovery 要求:"
    options:
      - "基本增长水平"
      - "高级加级"
      - "根本没有许可证"
      - "单独的表格许可证"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-3"
    q: "集成用户无法看到自定义字段 。 发生了什么事?"
    options:
      - "同步大声失败"
      - "田地从未到来,下游的一切建筑都是干净的,而数字是悄悄的不完整的"
      - "球场是空的,被标记"
      - "自动授权访问"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-4"
    q: "安全前提在哪里适用?"
    options:
      - "在设计时间仪表板上"
      - "每个查看器在查询时间的数据集"
      - "在建造时间的食谱中"
      - "在应用程序的共享上"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-5"
    q: "你加一个上游,你自己的仪表板就空了 为什么?"
    options:
      - "数据集已经腐败了"
      - "上游也为您评估, 您的用户不能满足它"
      - "永久禁用管理员访问"
      - "食谱必须重新运行"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-6"
    q: "用户的上游字段为空白. 他们看到了什么?"
    options:
      - "所有的东西"
      - "无 - 无效关闭"
      - "他们自己的记录"
      - "错误"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-7"
    q: "为什么一个角色等级的上游需要一个平坦的节点?"
    options:
      - "缩小数据集大小"
      - "上游无法在查询时走过一个等级, 因此祖先被预先计算成一个可比的列"
      - "要按字母排序角色"
      - "没有"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-8"
    q: "与手写上游分享遗产的主要优势是:"
    options:
      - "快速查询"
      - "它重用Org现有的共享, 所以分析不能漂移 随着业务重组"
      - "它能处理所有外部数据"
      - "它取消了对集成用户的需求"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-9"
    q: "为什么分享遗产需要回落的前提?"
    options:
      - "用于业绩"
      - "因为继承是有限度的,有些东西必须决定 观众在无法评价时所看到的"
      - "支持仪表板"
      - "没有"
    answer: 1
    topic: "setup"
  - id: "setup-graded-quiz-10"
    q: "在发布安全仪表盘之前,您应当:"
    options:
      - "作为管理员审查"
      - "请检查access-date=中的日期值 (帮助)"
      - "导出为电子表格"
      - "启用每个特性切换"
    answer: 1
    topic: "setup"
---

联合国安全领域的实践问题 CRM Analytics 和 Einstein Discovery 顾问考试.
