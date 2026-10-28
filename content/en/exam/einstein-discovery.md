---
title: Einstein Discovery Story Design — practice questions
domain: einstein-discovery
quiz:
  - id: einstein-discovery-index-1
    q: "A story and a model differ in that:"
    options:
      - A story is a chart
      - A story is the analysis of what correlates with an outcome; a model is a deployed story that scores records
      - A model is less accurate
      - They are the same thing
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-index-2
    q: Why must a deployed prediction carry its top factors?
    options:
      - Compliance requires it
      - A bare probability gives a rep nothing to do, and gets ignored within a month
      - It improves accuracy
      - It reduces compute cost
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-what-a-story-is-1
    q: "A story reports that 'discount above 30%' is associated with losing. This means:"
    options:
      - Discounting causes losses
      - Deals with heavy discounts lost more often — the direction of causation is not established by the story
      - Discounts should be banned
      - The model is broken
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-what-a-story-is-2
    q: "A factor appearing at the top of a story is:"
    options:
      - Necessarily the most actionable
      - The most strongly associated with the outcome, which is not the same as the most useful to act on
      - Guaranteed causal
      - A data error
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-preparing-data-1
    q: "Training on 'Closed Won' including renewals teaches the model that:"
    options:
      - Renewals are valuable
      - The best predictor of winning is already being a customer — which is true and useless
      - Nothing; renewals are neutral
      - New business is riskier
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-preparing-data-2
    q: "Leakage means:"
    options:
      - Data loss during sync
      - A field recorded at or after the outcome, which predicts it almost perfectly and is unavailable when you would need the prediction
      - A security breach
      - Duplicate rows
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-preparing-data-3
    q: "The grain of the training dataset should be:"
    options:
      - As fine as possible
      - One row per thing you want to score — one opportunity, one account, one lead
      - Aggregated monthly
      - Whatever the recipe already produces
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-reading-a-story-honestly-1
    q: "3% of leads convert. A model predicting 'no' for everything is:"
    options:
      - Useless and 3% accurate
      - 97% accurate and useless — which is why accuracy alone is the wrong measure on a rare outcome
      - Impossible
      - The correct baseline to deploy
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-reading-a-story-honestly-2
    q: "The first question to ask of any impressive accuracy figure is:"
    options:
      - How large was the dataset?
      - What would a trivial baseline score — always predicting the majority class?
      - Which algorithm was used?
      - How long did it take to train?
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-reading-a-story-honestly-3
    q: "A model's accuracy drifts downward over a year. The most likely cause is:"
    options:
      - A software bug
      - The business changed — new products, new segments, a different sales motion — and the training data no longer describes it
      - The dataset shrank
      - Too many users
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-deploying-and-write-back-1
    q: Where should a deployed prediction appear?
    options:
      - On an analytics dashboard only
      - Where the work happens — the record page the person already opens
      - In a weekly email
      - In the dataset only
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-deploying-and-write-back-2
    q: What must travel with the score?
    options:
      - The training data
      - The top factors behind it, so there is a next action
      - The algorithm name
      - Nothing else
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-deploying-and-write-back-3
    q: "After deployment, the essential ongoing task is:"
    options:
      - Retraining weekly regardless
      - Monitoring whether the model still predicts, and whether anybody acts on it
      - Increasing the score's precision
      - Adding more factors
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-auditing-a-score-1
    q: "Conversion rate by score band is flat. The score is:"
    options:
      - Working as intended
      - Not predicting conversion — it is a number without a claim behind it
      - Miscalibrated but useful
      - Too granular
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-auditing-a-score-2
    q: "The essential comparison in a score audit is against:"
    options:
      - A more complex model
      - A trivial baseline — a field you already had, like lead source
      - Last year's score
      - The vendor's published accuracy
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-auditing-a-score-3
    q: "A score band with nine leads shows 60% conversion. This is:"
    options:
      - Strong evidence the score works
      - Almost certainly noise — rates need their volumes beside them
      - Proof of a threshold effect
      - A data error
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-1
    q: "A story is:"
    options:
      - A deployed model
      - The analysis of what correlates with an outcome
      - A dashboard template
      - A narrative widget
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-2
    q: "Training on Closed Won including renewals teaches the model that:"
    options:
      - Renewals are valuable
      - The best predictor of winning is already being a customer — true and useless
      - New business is riskier
      - Nothing useful can be learned
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-3
    q: "Leakage is:"
    options:
      - Data loss in sync
      - A field recorded at or after the outcome, unavailable when a prediction is needed
      - Duplicate rows
      - A security issue
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-4
    q: "3% of leads convert. A model predicting 'no' for all is:"
    options:
      - 3% accurate
      - 97% accurate and useless
      - Invalid
      - The right baseline to ship
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-5
    q: "The training dataset's grain should be:"
    options:
      - As fine as possible
      - One row per thing you intend to score
      - Monthly aggregates
      - Whatever the recipe produces
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-6
    q: "A deployed prediction must be accompanied by:"
    options:
      - The training data
      - Its top factors
      - The algorithm name
      - Nothing
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-7
    q: "Conversion rate by score band climbs then flattens above 70. This means the score:"
    options:
      - Works perfectly
      - Separates bad from average and says nothing about the top — where the team spends its time
      - Is inverted
      - Needs more bands
    answer: 1
    topic: einstein-discovery
  - id: einstein-discovery-graded-quiz-8
    q: "The essential comparison when auditing a score is against:"
    options:
      - A more complex model
      - A trivial baseline such as a field you already had
      - The vendor's claim
      - Last quarter's score
    answer: 1
    topic: einstein-discovery
---

Practice questions for the Einstein Discovery Story Design domain of the CRM Analytics and Einstein Discovery Consultant exam.
