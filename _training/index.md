---
layout: default
title: "Salesforce CRM Analytics Training - Free"
description: "Master Salesforce CRM Analytics with this comprehensive training series."
permalink : /training
---

<section class="section">
  <div class="container">
    <h1 class="title">{{ page.title }}</h1>
    <p class="subtitle">{{ page.description }}</p>
    
    <div class="content">
      <h2>Sections</h2>
      {% for section in site.data.training.sections %}
        <div class="box">
          <h3 class="title is-4"><a href="/training/{{ section.number }}/">{{ section.title }}</a></h3>
          <p>{{ section.description }}</p>
        </div>
      {% endfor %}
    </div>
  </div>
</section>
