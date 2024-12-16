---
layout: default
title: "Salesforce CRM Analytics Training"
permalink : /training
---

<section class="section">
  <div class="container">
    <h1 class="title">{{ page.title }}</h1>
    <div class="content">
      <ul>
        {% for section in site.data.training.sections %}
        <li>
          <a href="/training/section{{ section.number }}/">
            {{ section.title }}
          </a>
        </li>
        {% endfor %}
      </ul>
    </div>
  </div>
</section>
<style>
  .is-scroll-column {
  overflow-y: auto;
  max-height: calc(100vh - 4rem);
  padding: 1rem;
}
.left-shadowed {
  box-shadow: inset -4px 0px 6px -4px rgba(0, 0, 0, 0.2);
}

  </style>