---
layout: default
title: "Section - 0" 
---
{% assign total_lessons = site.training | size %}
{% assign article_count = 0 %}
{% assign video_count = 0 %}
{% assign quiz_count = 0 %}

{% for lesson in site.training %}
  {% if lesson.type == "article" %}
    {% assign article_count = article_count | plus: 1 %}
  {% elsif lesson.type == "video" %}
    {% assign video_count = video_count | plus: 1 %}
  {% elsif lesson.type == "quiz" %}
    {% assign quiz_count = quiz_count | plus: 1 %}
  {% endif %}
{% endfor %}
<nav class="level">
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Total Lessons</p>
      <p class="title">{{ total_lessons }}</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Articles</p>
      <p class="title">{{ article_count }}</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Videos</p>
      <p class="title">{{ video_count }}</p>
    </div>
  </div>
  <div class="level-item has-text-centered">
    <div>
      <p class="heading">Quizzes</p>
      <p class="title">{{ quiz_count }}</p>
    </div>
  </div>
</nav>

<section class="hero is-primary">
  <div class="hero-body">
    <div class="container">
      <div class="columns is-vcentered">
        <!-- Left Column: Training Content -->
        <div class="column is-9">
          <h1 class="title is-2 has-text-white">Salesforce CRM Analytics Training</h1>
          <h2 class="subtitle is-4 has-text-white">Master the skills to leverage CRM analytics for better decision-making and enhanced business insights.</h2>
          <div class="content has-text-white mt-5">
            <p>Our comprehensive training program takes you through everything from the basics to advanced Salesforce CRM Analytics, covering real-time insights, AI integrations, and much more.</p>
          </div>
          <!-- CTA Buttons -->
          <div class="buttons mt-5">
            <a href="#start-now" class="button is-primary is-large">Start Now</a>
            <a href="#learn-more" class="button is-light is-large">Learn More</a>
          </div>
        </div>
        <!-- Right Column: Sticky Training Card Section -->
        <div class="column is-3">
          <div class="sticky-training-card">
            <!-- Training Card -->
            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <div class="skelton-placeholder"></div> <!-- Placeholder for image -->
                </figure>
              </div>
              <div class="card-content">
                <h3 class="title is-4">Training Overview</h3>
                <p class="subtitle is-6">Get a deep dive into the Salesforce CRM ecosystem, including analytics, AI, and real-time data processing.</p>
                <ul>
                  <li>Introduction to Salesforce CRM</li>
                  <li>Hands-on with Analytics Tools</li>
                  <li>AI Features and Predictive Analytics</li>
                  <li>Creating Custom Dashboards</li>
                </ul>
                <!-- Additional CTA Button -->
                <a href="#start-now" class="button is-primary is-fullwidth">Start Your Journey</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Sticky Sidebar Styles -->
<style>
  .sticky-training-card {
    position: sticky;
    top: 20px;
  }

  .skelton-placeholder {
    background-color: #e0e0e0;
    width: 100%;
    height: 200px; /* Example height, adjust as needed */
  }
</style>
