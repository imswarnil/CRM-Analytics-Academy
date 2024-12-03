---
layout: page
title: "Courses"
permalink: /courses/
---

<section class="section">
  <div class="container">
    <h1 class="title has-text-centered">Courses</h1>

<!-- Filter Section -->
<div class="filters">
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Filter by</label>
        </div>
        <div class="field-body">
          <!-- Course Provider Filter -->
          <div class="field">
            <label class="label">Provider</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select id="provider-filter">
                  <option value="">All Providers</option>
                  <option value="Udemy">Udemy</option>
                  <option value="Coursera">Coursera</option>
                  <option value="LinkedIn Learning">LinkedIn Learning</option>
                </select>
              </div>
            </div>
          </div>

 <!-- Free/Paid Filter -->
  <div class="field">
            <label class="label">Price</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select id="price-filter">
                  <option value="">All Prices</option>
                  <option value="true">Free</option>
                  <option value="false">Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

<!-- Course List -->
<div id="course-list" class="columns is-multiline">
      {% for course in site.courses %}
        <div class="column is-12-mobile is-6-tablet is-4-desktop course-card" 
             data-provider="{{ course.course_provider | downcase }}" 
             data-price="{{ course.is_free }}">
          <div class="card">
            <div class="card-content">
              <p class="title">{{ course.title }}</p>
              <p class="subtitle">{{ course.course_provider }}</p>
              <p>{{ course.description }}</p>
              <p class="has-text-weight-semibold">{{ course.price }} | Duration: {{ course.duration }}</p>
              <a href="{{ course.link }}" class="button is-primary" target="_blank">Take the Course</a>
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

<!-- Add the JavaScript for Filtering -->
<script>
  document.addEventListener('DOMContentLoaded', function () {
    const providerFilter = document.getElementById('provider-filter');
    const priceFilter = document.getElementById('price-filter');
    const courseList = document.getElementById('course-list');
    const courses = document.querySelectorAll('.course-card');

    // Function to filter courses
    function filterCourses() {
      const provider = providerFilter.value.toLowerCase();
      const price = priceFilter.value;

      courses.forEach(course => {
        const courseProvider = course.getAttribute('data-provider').toLowerCase();
        const isFree = course.getAttribute('data-price') === 'true';

        // Show or hide the course based on the filter values
        if ((provider === "" || courseProvider.includes(provider)) &&
            (price === "" || (price === "true" && isFree) || (price === "false" && !isFree))) {
          course.style.display = 'block';
        } else {
          course.style.display = 'none';
        }
      });
    }

    // Event listeners for filter changes
    providerFilter.addEventListener('change', filterCourses);
    priceFilter.addEventListener('change', filterCourses);

    // Initial filtering
    filterCourses();
  });
</script>
