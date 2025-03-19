---
layout: default
title: "Section - 0" 
order : 0 
---
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

   {% include training/stats.html %}

---
layout: default
title: Training Schedule
---

<div class="container is-fullhd">
  <h1 class="title is-size-2">Training Schedule</h1>
  <p class="subtitle is-size-4">Browse through all available courses and their lessons.</p>

  <div class="columns is-multiline">
    {% assign sections = site.training | where: "type", "section" | sort: "order" %}
    {% for section in sections %}
    <div class="column is-full">
      <div class="box">
        <!-- Section Title & Description -->
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <figure class="image is-64x64">
              <img src="{{ section.icon | relative_url }}" alt="{{ section.title }} Icon">
            </figure>
          </div>
          <div class="column">
            <h2 class="title is-4">
              <a href="{{ section.url | relative_url }}">{{ section.title }}</a>
            </h2>
            <p class="subtitle is-6">{{ section.description }}</p>
          </div>
          <div class="column is-narrow">
            <span class="tag is-info is-light">{{ section.lessons | size }} Lessons</span>
          </div>
        </div>
        <!-- Lessons List -->
        {% assign lessons = site.training | where_exp: "item", "item.parent == section.title" | sort: "order" %}
        <ul>
          {% for lesson in lessons %}
          <li class="box my-2">
            <div class="columns is-vcentered">
              <div class="column is-narrow">
                <figure class="image is-48x48">
                  <img src="{{ lesson.icon | default: '/assets/icons/default.svg' | relative_url }}" alt="Lesson Icon">
                </figure>
              </div>
              <div class="column">
                <p class="title is-5 mb-1">
                  <a href="{{ lesson.url | relative_url }}">{{ lesson.title }}</a>
                </p>
                <p class="subtitle is-6 has-text-grey mb-2">{{ lesson.description }}</p>
              </div>
              <div class="column is-narrow">
                <span class="tag is-info is-light">{{ lesson.type | capitalize }}</span>
              </div>
              <div class="column is-narrow">
                <a href="{{ lesson.url | relative_url }}" class="icon">
                  <i class="fas fa-link"></i>
                </a>
              </div>
            </div>
          </li>
          {% endfor %}
        </ul>
      </div>
    </div>
    {% endfor %}
  </div>
</div>


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
