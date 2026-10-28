---
title: "为什么要建一个快照数据集?"
description: "因为 Salesforce 对象只持有当前状态。 一个机会知道今天的数量和舞台, 和三月无关, 所以管道运动,滑落..."
type: "conceptual"
topic: "datasets-and-modelling"
level: "junior"
source: "academy"
---

因为 Salesforce 对象只持有当前状态。 一个机会知道今天的数量和舞台 和关于三月的事情, 所以管道运动, 滑动交易,预测准确度 和ARR瀑布 都无法从对象中解答。 一个快照附加了当前每个运行的状态,并积累了以后无法重建的历史——这也是为什么我从一开始就设置它和同步的日期,主人,阶段和金额. 三月添加的字段没有二月值,是永久的.
