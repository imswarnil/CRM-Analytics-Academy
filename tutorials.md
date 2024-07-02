---
title: Tutorials
feature_text: Description
feature_image: "https://picsum.photos/2560/600?image=873"
description: "A demo of Markdown and HTML includes"
aside: true
sidebar_type: right  # Optional, defaults to 'right' if aside is true
---

<section class="section">
  <div class="container">
    <h2 class="title is-4 mb-5">All Lessons</h2>
    <div class="columns is-multiline">
      {% assign tutorials = site.tutorials %}
      {% for tutorial in tutorials %}
      <div class="column is-12">
        <div class="box">
          <div class="columns is-vcentered">
            <div class="column is-4">
              <a href="{{ tutorial.url }}">
                <img src="{{ tutorial.thumbnail | default: 'https://via.placeholder.com/256' }}" alt="{{ tutorial.title }}" class="image is-rounded" loading="lazy">
              </a>
            </div>
            <div class="column">
              <div class="content">
                <p class="has-text-weight-semibold">Lesson {{ tutorial.lesson_number }}</p>
                <h3 class="title is-5"><a href="{{ tutorial.url }}">{{ tutorial.title }}</a></h3>
                <p>{{ tutorial.description }}</p>
                <p class="has-text-grey-dark">{{ tutorial.duration }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>
