---
title: Im Jekyll Theme
description: "An open-source Jekyll theme crafted using the Bulma CSS framework. This theme utilizes Bulma SCSS, making it incredibly easy to customize and adapt to your specific needs. With over 7 layouts and 10+ collections"
image: /assets/logos/logo.svg
layout: default
---

<!-- =================================================================
     SECTION 1: HERO WITH ANIMATED GRADIENT BACKGROUND
================================================================== -->
<section class="hero is-large homepage-hero-creative">
  <div class="hero-body">
    <div class="container has-text-centered">
      <p class="is-uppercase has-text-weight-bold has-text-primary mb-2 hero-eyebrow">A Better Way to Learn</p>
      <h1 class="title is-1 hero-title">
        Knowledge That Powers Your Career.
      </h1>
      <h2 class="subtitle is-4 hero-subtitle">
        Go from beginner to expert with project-based courses, a supportive community, and lifetime access to materials.
      </h2>
      <div class="buttons is-centered mt-6">
        <a href="#courses" class="button is-primary is-large hero-button-primary">
          <span>Explore All Courses</span>
        </a>
        <a href="#testimonials" class="button is-light is-large hero-button-secondary">
          <span>See What Others Say</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- =================================================================
     SECTION 2: "AS FEATURED IN" / SOCIAL PROOF
================================================================== -->
<section class="section social-proof-section">
  <div class="container">
    <div class="has-text-centered">
      <p class="is-size-7 is-uppercase has-text-weight-bold has-text-grey-light">TRUSTED BY PROFESSIONALS AT</p>
      <div class="columns is-vcentered is-mobile is-multiline is-centered mt-4">
        <!-- Replace with real logos of companies or publications -->
        <div class="column is-narrow"><img src="https://placehold.co/120x40/f3f3f3/b2b2b2/png?text=CompanyA" alt="Company A Logo"></div>
        <div class="column is-narrow"><img src="https://placehold.co/120x40/f3f3f3/b2b2b2/png?text=CompanyB" alt="Company B Logo"></div>
        <div class="column is-narrow"><img src="https://placehold.co/120x40/f3f3f3/b2b2b2/png?text=TechWeekly" alt="TechWeekly Logo"></div>
        <div class="column is-narrow"><img src="https://placehold.co/120x40/f3f3f3/b2b2b2/png?text=DataCorp" alt="DataCorp Logo"></div>
        <div class="column is-narrow"><img src="https://placehold.co/120x40/f3f3f3/b2b2b2/png?text=InnovateIO" alt="InnovateIO Logo"></div>
      </div>
    </div>
  </div>
</section>

<!-- =================================================================
     SECTION 3: ADVERTISEMENT PLACEHOLDER (LEADERBOARD)
================================================================== -->
<section class="section pt-0">
    <div class="container">
        {% include adsense.html format="leaderboard" %}
    </div>
</section>


<!-- =================================================================
     SECTION 4: DYNAMIC COURSE LISTING
================================================================== -->
<section class="section course-listing-section" id="courses">
  <div class="container">
    <div class="has-text-centered">
      <h2 class="title is-2">Find Your Path</h2>
      <p class="subtitle is-5">Whether you're starting fresh or leveling up, we have a course for you.</p>
    </div>
    {% assign courses = site.posts | group_by: "course_id" %}
    <div class="columns is-multiline is-variable is-5 mt-5">
      {% for course in courses %}
        {% if course.name %}
          {% assign first_lesson = course.items | sort: "order" | first %}
          <div class="column is-4-desktop is-6-tablet">
            <div class="card course-card-creative">
              <a href="{{ first_lesson.url | relative_url }}" class="course-card-link">
                <div class="card-image">
                  <figure class="image is-16by9">
                    <img src="{{ first_lesson.image | default: 'https://placehold.co/600x338/e53935/FFFFFF/png?text=Course' }}" alt="{{ course.name }} Course">
                  </figure>
                  <div class="course-card-overlay">
                    <span class="tag is-primary">{{ first_lesson.difficulty | default: 'All Levels' }}</span>
                  </div>
                </div>
                <div class="card-content">
                  <div class="content">
                    <p class="is-size-7 has-text-grey is-uppercase has-text-weight-bold">
                      {{ course.items | size }} Lessons • {{ first_lesson.duration }}
                    </p>
                    <h3 class="title is-4 course-title">
                      {{ course.name | replace: "-", " " | capitalize }}
                    </h3>
                  </div>
                </div>
              </a>
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>
</section>

<!-- =================================================================
     SECTION 5: TESTIMONIALS
================================================================== -->
<section class="section testimonial-section" id="testimonials">
  <div class="container">
    <div class="columns is-vcentered">
      <div class="column is-5">
        <h2 class="title is-2">Don't Just Take Our Word For It.</h2>
        <p class="is-size-5 has-text-secondary">Our students have landed jobs, received promotions, and built amazing things. Here’s what they have to say.</p>
      </div>
      <div class="column is-6 is-offset-1">
        <div class="testimonial-box">
          <p class="testimonial-quote">"This wasn't just another course. The project-based approach meant I was building a real portfolio from day one. I landed a new role as a CRM Analyst three weeks after completion. I can't recommend it enough!"</p>
          <div class="media mt-5">
            <figure class="media-left">
              <p class="image is-64x64">
                <img class="is-rounded" src="https://placehold.co/128x128/000000/FFFFFF/png" alt="Jane Doe">
              </p>
            </figure>
            <div class="media-content">
              <p class="title is-5 mb-0">Jane Doe</p>
              <p class="subtitle is-6">Senior CRM Analyst, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- =================================================================
     SECTION 6: ADVERTISEMENT PLACEHOLDER (MULTIPLEX)
================================================================== -->
<section class="section">
    <div class="container">
        {% include adsense.html format="multiplex-h" %}
    </div>
</section>

<!-- =================================================================
     SECTION 7: FINAL CTA / NEWSLETTER SIGNUP
================================================================== -->
<section class="section final-cta-section">
    <div class="container">
        <div class="box final-cta-box">
            <div class="columns is-vcentered">
                <div class="column is-7">
                    <h3 class="title is-3">Ready to Start Your Journey?</h3>
                    <p class="subtitle is-5">Subscribe to our newsletter for free lessons, course updates, and exclusive discounts.</p>
                </div>
                <div class="column is-5">
                    <form action="YOUR_NEWSLETTER_FORM_ACTION_URL" method="post" target="_blank">
                        <div class="field has-addons">
                            <div class="control is-expanded">
                                <input class="input is-medium" type="email" name="EMAIL" placeholder="your.email@example.com" required>
                            </div>
                            <div class="control">
                                <button type="submit" class="button is-primary is-medium">Subscribe</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- =================================================================
     HERO SECTION
================================================================== -->
<section class="hero is-medium homepage-hero">
  <div class="hero-body">
    <div class="container has-text-centered">
      <h1 class="title is-1 hero-title">
        Master Your Craft.
      </h1>
      <h2 class="subtitle is-4 hero-subtitle">
        Unlock your potential with expert-led courses designed for the modern learner. <br>Start your journey today.
      </h2>
      <div class="buttons is-centered mt-5">
        <a href="#courses" class="button is-primary is-large">
          <span>Explore All Courses</span>
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"></path></svg>
          </span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- =================================================================
     FEATURES SECTION
================================================================== -->
<section class="section">
  <div class="container">
    <div class="columns is-multiline is-centered is-variable is-6">
      <div class="column is-12 has-text-centered">
        <h2 class="title is-3">Why Learn With Us?</h2>
        <p class="subtitle is-5">We provide more than just lessons; we provide a path to success.</p>
      </div>
      <div class="column is-4 has-text-centered">
        <div class="feature-box">
          <div class="icon is-large has-text-primary mb-4">
            <!-- Icon: Expert -->
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.5c.3 0 .5.2.5.5v2.2c0 .3-.2.5-.5.5s-.5-.2-.5-.5V4c0-.3.2-.5.5-.5m6.1 2.3c.2.2.5.2.7 0l1.6-1.6c.2-.2.2-.5 0-.7s-.5-.2-.7 0l-1.6 1.6c-.2.2-.2.5 0 .7M5.9 5.8c.2.2.5.2.7 0l1.6-1.6c.2-.2.2-.5 0-.7s-.5-.2-.7 0L5.9 5.1c-.2.2-.2.5 0 .7m12.3 6.2h-2.2c-.3 0-.5.2-.5.5s.2.5.5.5h2.2c.3 0 .5-.2.5-.5s-.2-.5-.5-.5M6.2 12h-2.2c-.3 0-.5.2-.5.5s.2.5.5.5h2.2c.3 0 .5-.2.5-.5s-.2-.5-.5-.5m6.3 8.5c-.3 0-.5-.2-.5-.5v-2.2c0-.3.2-.5.5-.5s.5.2.5.5v2.2c0 .3-.2.5-.5.5m-.5-7.7c-2.3 0-4.2 1.9-4.2 4.2v.2c0 .2.2.4.4.4h7.5c.2 0 .4-.2.4-.4v-.2c.1-2.3-1.8-4.2-4.1-4.2M5.9 18.2c-.2-.2-.5-.2-.7 0l-1.6 1.6c-.2.2-.2.5 0 .7s.5.2.7 0l1.6-1.6c.2-.2.2-.5 0-.7m12.3 0c-.2-.2-.5-.2-.7 0l-1.6 1.6c-.2.2-.2.5 0 .7s.5.2.7 0l1.6-1.6c.2-.2.2-.5 0-.7"/></svg>
          </div>
          <h3 class="title is-4">Expert Instructors</h3>
          <p>Learn from industry veterans who bring real-world experience and insights into every lesson.</p>
        </div>
      </div>
      <div class="column is-4 has-text-centered">
        <div class="feature-box">
          <div class="icon is-large has-text-primary mb-4">
            <!-- Icon: Interactive -->
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M21.5 13.5h-1c-.3 0-.5.2-.5.5s.2.5.5.5h1c.3 0 .5-.2.5-.5s-.2-.5-.5-.5m-19 0h1c.3 0 .5.2.5.5s-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5s.2-.5.5-.5M8.5 4.5c.3 0 .5.2.5.5v1c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-1c0-.3.2-.5.5-.5m7 0c.3 0 .5.2.5.5v1c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-1c0-.3.2-.5.5-.5m-3.5 15c-.3 0-.5-.2-.5-.5v-1c0-.3.2-.5.5-.5s.5.2.5.5v1c0 .3-.2.5-.5.5m-1.4-13.4c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7l-.7.7c-.2.2-.5.2-.7 0zm4.2 0c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7l-.7.7c-.2.2-.5.2-.7 0zM7.1 16.1c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7l-.7.7c-.2.2-.5.2-.7 0zm8.4 0c-.2-.2-.2-.5 0-.7l.7-.7c.2-.2.5-.2.7 0l.7.7c.2.2.2.5 0 .7l-.7.7c-.2.2-.5.2-.7 0zM12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4s4-1.8 4-4s-1.8-4-4-4"/></svg>
          </div>
          <h3 class="title is-4">Interactive Learning</h3>
          <p>Engage with hands-on projects, quizzes, and a supportive community to solidify your knowledge.</p>
        </div>
      </div>
      <div class="column is-4 has-text-centered">
        <div class="feature-box">
          <div class="icon is-large has-text-primary mb-4">
            <!-- Icon: Flexible -->
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2m0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8"/><path fill="currentColor" d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/></svg>
          </div>
          <h3 class="title is-4">Flexible Pacing</h3>
          <p>Learn at your own speed with lifetime access to all course materials, anywhere, anytime.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- =================================================================
     DYNAMIC COURSE LISTING SECTION
================================================================== -->
<section class="section has-background-light" id="courses">
  <div class="container">
    <div class="has-text-centered">
      <h2 class="title is-3">Our Courses</h2>
      <p class="subtitle is-5">Choose a course and start your learning adventure.</p>
    </div>
    <!-- Liquid logic to group posts by course_id -->
    {% assign courses = site.posts | group_by: "course_id" %}
    <div class="columns is-multiline is-centered mt-5">
      {% for course in courses %}
        {% if course.name %} <!-- Ensure we don't render empty course_id groups -->
          <!-- Find the first lesson to get course-wide details -->
          {% assign first_lesson = course.items | sort: "order" | first %}
          <div class="column is-4-desktop is-6-tablet">
            <div class="card course-card">
              <div class="card-image">
                <figure class="image is-16by9">
                  <a href="{{ first_lesson.url | relative_url }}">
                    <img src="{{ first_lesson.image | default: 'https://placehold.co/600x338/e53935/FFFFFF/png?text=Course' }}" alt="{{ course.name }} Course">
                  </a>
                </figure>
              </div>
              <div class="card-content">
                <div class="content">
                  <p class="is-size-7 has-text-grey-light has-text-weight-bold is-uppercase">
                    {{ course.items | size }} Lessons
                  </p>
                  <h3 class="title is-4">
                    <a href="{{ first_lesson.url | relative_url }}">
                      <!-- A little magic to make the course name look nice -->
                      {{ course.name | replace: "-", " " | capitalize }}
                    </a>
                  </h3>
                  <p>{{ first_lesson.description | truncate: 120 }}</p>
                  <a href="{{ first_lesson.url | relative_url }}" class="button is-primary is-outlined is-fullwidth mt-4">
                    Start Learning
                  </a>
                </div>
              </div>
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>
</section>

<!-- =================================================================
     FINAL CALL TO ACTION SECTION
================================================================== -->
<section class="section">
  <div class="container">
    <div class="box final-cta">
        <div class="columns is-vcentered">
            <div class="column is-8">
                <h3 class="title is-3">Ready to Begin?</h3>
                <p class="subtitle is-5">Your next skill is just a click away. Join thousands of learners and advance your career today.</p>
            </div>
            <div class="column is-4 has-text-right-desktop">
                <a href="#courses" class="button is-primary is-large">
                    View All Courses
                </a>
            </div>
        </div>
    </div>
  </div>
</section>