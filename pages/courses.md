---
layout: page
title: "Courses"
description : All CRM Analytics Courses
permalink: /courses
---

<div class="container">
  <h1 class="title">Our Courses</h1>
  <p>Explore our curated collection of Salesforce CRM Analytics courses to help you learn and grow in your career.</p>

  <div class="columns is-multiline">
    {% for course in site.courses %}
      <div class="column is-12-mobile is-6-tablet is-4-desktop">
        <div class="box">
          <h2 class="subtitle is-size-4">{{ course.title }}</h2>
          <p><strong>Instructor:</strong> {{ course.author }}</p>
          <p><strong>Platform:</strong> {{ course.platform }}</p>
          <p><strong>Price:</strong> {{ course.price }}</p>
          <p><strong>Duration:</strong> {{ course.duration }}</p>
          <p><strong>Lessons:</strong> {{ course.lessons }}</p>
          <a href="{{ course.link }}" class="button is-primary" target="_blank">Enroll Now</a>
        </div>
      </div>
    {% endfor %}
  </div>
</div>
