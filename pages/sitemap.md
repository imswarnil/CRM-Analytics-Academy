---
layout: default
title: Site Overview
permalink: /site/
seo:
  title: Site Overview & Sitemap - A Holistic View of Our Content
  description: Discover everything on our site! Explore pages, blog posts, topics (categories), and keywords (tags) in a visually organized manner.
---

<style>
/* --- Sitemap Page General Styles --- */
.sitemap-page {
  background-color: hsl(0, 0%, 98%); /* Very light grey background for the whole page */
}

.sitemap-page .title.is-1 {
  color: hsl(0, 0%, 21%); /* Bulma's default title color */
}
.sitemap-page .subtitle.is-4 {
  color: hsl(0, 0%, 48%); /* Bulma's default subtitle color */
}

.sitemap-page .sitemap-section {
  background-color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 8px;
  box-shadow: 0 0.5em 1em -0.125em rgba(10,10,10,0.05), 0 0 0 1px rgba(10,10,10,0.02);
}

.sitemap-page .sitemap-section .title.is-3 {
  border-bottom: 2px solid hsl(204, 86%, 53%); /* Bulma primary color */
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem !important;
}
.sitemap-page .sitemap-section .title.is-3 .icon {
  margin-right: 0.5rem;
  color: hsl(204, 86%, 53%);
}

/* --- Key Destinations Tiles --- */
.sitemap-page .key-pages-section .tile.is-child {
  padding: 1.5rem;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}
.sitemap-page .key-pages-section .tile.is-child:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}
.sitemap-page .key-pages-section .tile.is-child .title .icon { margin-right: 0.5em; }

/* --- Post Cards Enhanced --- */
.sitemap-page .sitemap-post-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid hsl(0, 0%, 86%); /* Softer border */
  border-radius: 6px;
  overflow: hidden; /* Important for child border-radius and image fit */
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.sitemap-page .sitemap-post-card.raise-on-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.05);
}

.sitemap-page .sitemap-post-card .card-image {
  border-bottom: 1px solid hsl(0, 0%, 93%);
}
.sitemap-page .sitemap-post-card .card-image img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.sitemap-page .sitemap-post-card .card-content {
  flex-grow: 1;
  padding: 1rem;
}
.sitemap-page .sitemap-post-card .card-content .content { margin-bottom: 0;}
.sitemap-page .sitemap-post-card .card-content .card-post-title a {
  color: hsl(0, 0%, 29%);
}
.sitemap-page .sitemap-post-card .card-content .card-post-title a:hover { color: hsl(217, 71%, 53%); }
.sitemap-page .sitemap-post-card .card-content .post-excerpt {
  color: hsl(0, 0%, 48%);
  line-height: 1.5;
}

.sitemap-page .sitemap-post-card .card-footer {
  background-color: hsl(0, 0%, 98%);
  border-top: 1px solid hsl(0, 0%, 93%);
}
.sitemap-page .sitemap-post-card .card-footer a.card-footer-item {
  color: hsl(0, 0%, 48%);
  font-weight: 500;
  transition: color 0.2s ease;
}
.sitemap-page .sitemap-post-card .card-footer a.card-footer-item:hover {
  background-color: hsl(0, 0%, 96%);
  color: hsl(217, 71%, 53%);
}
.sitemap-page .sitemap-post-card .card-footer a.card-footer-item .icon { margin-right: 0.3em; }

/* --- Topic Tiles (Categories) --- */
.sitemap-page .topic-tile {
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  border-left: 4px solid transparent; /* Placeholder for hover effect */
}
.sitemap-page .topic-tile .media-left .icon {
  transition: transform 0.3s ease;
}
.sitemap-page .topic-tile:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 5px 12px rgba(0,0,0,0.08);
  border-left-color: hsl(171, 100%, 41%); /* Bulma success color */
}
.sitemap-page .topic-tile:hover .media-left .icon {
  transform: rotate(-5deg) scale(1.1);
}
.sitemap-page .topic-tile .title { color: hsl(0,0%,29%); }
.sitemap-page .topic-tile .subtitle { color: hsl(0,0%,48%); }

/* --- Tag Cloud (Tags) --- */
.sitemap-page .tags-section .tags .tag {
  padding: 0.5em 1em;
  font-size: 0.9rem;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.sitemap-page .tags-section .tags .tag:hover {
  background-color: hsl(141, 53%, 53%) !important; /* Bulma success (stronger) */
  color: white !important;
  transform: scale(1.05);
}
.sitemap-page .tags-section .tags .tag .icon { margin-right: 0.3em; }

/* --- Other Pages List --- */
.sitemap-page .other-pages-section .sitemap-list {
  list-style: none;
  margin-left: 0;
  padding-left: 0;
}
.sitemap-page .other-pages-section .sitemap-list li a {
  display: inline-flex; /* For icon alignment */
  align-items: center;
  padding: 0.4em 0;
  font-size: 1rem;
  color: hsl(217, 71%, 53%);
  transition: color 0.2s ease;
}
.sitemap-page .other-pages-section .sitemap-list li a .icon { margin-right: 0.5em; color: hsl(217, 71%, 65%);}
.sitemap-page .other-pages-section .sitemap-list li a:hover {
  color: hsl(217, 71%, 48%);
  text-decoration: underline;
}
.sitemap-page .other-pages-section .sitemap-list li a:hover .icon {color: hsl(217, 71%, 48%);}

/* Helper for icon usage in titles etc. */
.sitemap-page .icon-text .icon {
  vertical-align: middle;
}

/* General link styling for sitemap tiles */
.sitemap-page a.sitemap-tile-link {
  display: block; /* Make the whole tile clickable */
  text-decoration: none !important; /* Remove underline from tile links */
}
.sitemap-page a.sitemap-tile-link p.title,
.sitemap-page a.sitemap-tile-link p.subtitle {
  transition: color 0.2s ease;
}
.sitemap-page a.sitemap-tile-link:hover p.title {
  color: hsl(217, 71%, 48%) !important; /* Adjust hover color if needed */
}
</style>

<section class="section sitemap-page">
  <div class="container">
    <div class="has-text-centered mb-6">
      <span class="icon is-large has-text-primary">
        <i class="ph-bold ph-compass ph-3x"></i>
      </span>
      <h1 class="title is-1 mt-2">Site Overview</h1>
      <p class="subtitle is-4">
        Your guide to all the content, topics, and resources available here.
      </p>
    </div>
    <!-- Section for Key Pages -->
    <div class="sitemap-section key-pages-section mb-6">
      <h2 class="title is-3 has-text-weight-semibold">
        <span class="icon-text">
          <span class="icon"><i class="ph ph-star"></i></span>
          <span>Key Destinations</span>
        </span>
      </h2>
      <div class="tile is-ancestor">
        <div class="tile is-parent">
          <a href="{{ "/" | relative_url }}" class="tile is-child box has-background-primary-light has-text-primary-dark sitemap-tile-link">
            <p class="title is-5"><span class="icon"><i class="ph ph-house"></i></span> Homepage</p>
            <p class="subtitle is-6">Start your journey here.</p>
          </a>
        </div>
        {%- assign about_page = site.pages | where_exp: "item", "item.url == '/about/'" | first -%}
        {%- if about_page -%}
        <div class="tile is-parent">
          <a href="{{ about_page.url | relative_url }}" class="tile is-child box has-background-info-light has-text-info-dark sitemap-tile-link">
            <p class="title is-5"><span class="icon"><i class="ph ph-users"></i></span> {{ about_page.title | default: "About Us" }}</p>
            <p class="subtitle is-6">Learn more about us.</p>
          </a>
        </div>
        {%- endif -%}
        {%- assign blog_page = site.pages | where_exp: "item", "item.url == '/blog/'" | first -%}
        {%- if blog_page -%}
        <div class="tile is-parent">
          <a href="{{ blog_page.url | relative_url }}" class="tile is-child box has-background-link-light has-text-link-dark sitemap-tile-link">
            <p class="title is-5"><span class="icon"><i class="ph ph-article"></i></span> {{ blog_page.title | default: "Blog" }}</p>
            <p class="subtitle is-6">Read our latest articles.</p>
          </a>
        </div>
        {%- else -%}
         <div class="tile is-parent">
          <a href="#latest-posts-anchor" class="tile is-child box has-background-link-light has-text-link-dark sitemap-tile-link">
            <p class="title is-5"><span class="icon"><i class="ph ph-article"></i></span> Latest Articles</p>
            <p class="subtitle is-6">Catch up on our posts.</p>
          </a>
        </div>
        {%- endif -%}
        {%- assign contact_page = site.pages | where_exp: "item", "item.url == '/contact/'" | first -%}
        {%- if contact_page -%}
        <div class="tile is-parent">
          <a href="{{ contact_page.url | relative_url }}" class="tile is-child box has-background-warning-light has-text-warning-dark sitemap-tile-link">
            <p class="title is-5"><span class="icon"><i class="ph ph-chats-circle"></i></span> {{ contact_page.title | default: "Contact" }}</p>
            <p class="subtitle is-6">Get in touch with us.</p>
          </a>
        </div>
        {%- endif -%}
      </div>
    </div>
    <!-- Blog Posts Section -->
    <div class="sitemap-section posts-section mb-6" id="latest-posts-anchor">
      <h2 class="title is-3 has-text-weight-semibold">
        <span class="icon-text">
          <span class="icon"><i class="ph ph-notebook"></i></span>
          <span>Recent Articles</span>
        </span>
      </h2>
      {%- if site.posts.size > 0 -%}
        <div class="columns is-multiline is-desktop">
          {%- for post in site.posts limit:8 -%}
            <div class="column is-one-quarter-desktop is-half-mobile">
              <div class="card sitemap-post-card raise-on-hover">
                {%- if post.image -%}
                  <a href="{{ post.url | relative_url }}" aria-label="Read more about {{ post.title | escape }}">
                    <div class="card-image">
                      <figure class="image is-16by9">
                        <img src="{{ post.image | relative_url }}" alt="{{ post.title | escape }}" loading="lazy">
                      </figure>
                    </div>
                  </a>
                {%- endif -%}
                <div class="card-content">
                  <div class="content">
                    <p class="title is-5 mb-1 card-post-title"><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></p>
                    <p class="subtitle is-7 has-text-grey mb-2">
                      <time datetime="{{ post.date | date_to_xmlschema }}">
                        <span class="icon is-small"><i class="ph ph-calendar-blank"></i></span>
                        {{ post.date | date: "%b %d, %Y" }}
                      </time>
                    </p>
                    {%- if post.excerpt -%}
                      <p class="is-size-7 post-excerpt">{{ post.excerpt | strip_html | truncatewords: 15 }}</p>
                    {%- endif -%}
                  </div>
                </div>
                <footer class="card-footer">
                  {%- if post.categories.size > 0 -%}
                    {%- assign post_first_category_raw = post.categories | first -%}
                    {%- if post_first_category_raw and post_first_category_raw != "" -%}
                        {%- assign post_first_category = post_first_category_raw | downcase | strip -%}
                        {%- if post_first_category != "" -%}
                            {%- assign cat_slug = post_first_category | slugify -%}
                            {%- assign cat_url = "/category/" | append: cat_slug | append: "/" | relative_url -%}
                            <a href="{{ cat_url }}" class="card-footer-item is-size-7">
                                <span class="icon is-small"><i class="ph ph-tag"></i></span>{{ post_first_category_raw | capitalize }}
                            </a>
                        {%- endif -%}
                    {%- endif -%}
                  {%- endif -%}
                   <a href="{{ post.url | relative_url }}" class="card-footer-item is-size-7 has-text-link">
                     Read More <span class="icon is-small"><i class="ph ph-arrow-right"></i></span>
                   </a>
                </footer>
              </div>
            </div>
          {%- endfor -%}
        </div>
        {%- if site.posts.size > 8 or site.pages | where_exp: "item", "item.url == '/blog/'" | size > 0 -%}
          <div class="has-text-centered mt-5">
            <a href="{{ (site.pages | where_exp: "item", "item.url == '/blog/'" | first).url | default: "/#latest-posts-anchor" | relative_url }}" class="button is-primary is-outlined is-rounded">
              <span class="icon"><i class="ph ph-books"></i></span>
              <span>View All Articles</span>
            </a>
          </div>
        {%- endif -%}
      {%- else -%}
        <div class="notification is-warning">No blog posts found yet. Stay tuned!</div>
      {%- endif -%}
    </div>
<!-- Topics (Categories) Section - SIMPLIFIED DEBUG -->
    {%- if site.categories.size > 0 -%}
    <div class="sitemap-section topics-section mb-6">
      <h2 class="title is-3 has-text-weight-semibold">
        <span class="icon-text"><span class="icon"><i class="ph ph-folders"></i></span><span>DEBUG: Topics (Categories)</span></span>
      </h2>
      <p>Raw site.categories count: {{ site.categories.size }}</p>
      <ul>
        {%- for category_item_array in site.categories -%}
          {%- assign category_name_raw = category_item_array[0] -%}
          {%- assign category_posts_count = category_item_array[1].size -%}
          <li>
            <strong>Name (Raw):</strong> {{ category_name_raw | inspect }} <br>
            <strong>Is String?:</strong> {{ category_name_raw | is_a:"String" }} <br>
            <strong>Posts Count:</strong> {{ category_posts_count }} <br>
            {%- if category_name_raw and category_name_raw != "" -%}
              {%- assign category_name_str = category_name_raw | is_a:"String" ? category_name_raw : category_name_raw | join: "," | default:"" -%}
              {%- assign category_name_clean = category_name_str | strip | downcase -%}
              <strong>Cleaned Name for Slug:</strong> {{ category_name_clean }} <br>
              {%- if category_name_clean != "" -%}
                {%- assign category_slug = category_name_clean | slugify -%}
                <strong>Slug:</strong> {{ category_slug }}
                {%- if category_slug != "" -%}
                  (Link would go here for {{ category_name_raw | capitalize }})
                {%- else -%}
                  (Slug is empty after slugify)
                {%- endif -%}
              {%- else -%}
                (Cleaned name is empty)
              {%- endif -%}
            {%- else -%}
              (Raw name is nil or empty)
            {%- endif -%}
            <hr>
          </li>
        {%- endfor -%}
      </ul>
    </div>
    {%- else -%}
        <p class="notification is-warning">DEBUG: site.categories is empty or size is 0.</p>
    {%- endif -%}
    <!-- Keywords (Tags) Section - SIMPLIFIED DEBUG -->
    {%- if site.tags.size > 0 -%}
    <div class="sitemap-section tags-section mb-6">
      <h2 class="title is-3 has-text-weight-semibold">
        <span class="icon-text"><span class="icon"><i class="ph ph-tags"></i></span><span>DEBUG: Keywords (Tags)</span></span>
      </h2>
      <p>Raw site.tags count: {{ site.tags.size }}</p>
      <ul>
        {%- for tag_item_array in site.tags -%}
          {%- assign tag_name_raw = tag_item_array[0] -%}
          {%- assign tag_posts_count = tag_item_array[1].size -%}
          <li>
            <strong>Name (Raw):</strong> {{ tag_name_raw | inspect }} <br>
            <strong>Is String?:</strong> {{ tag_name_raw | is_a:"String" }} <br>
            <strong>Posts Count:</strong> {{ tag_posts_count }} <br>
            {%- if tag_name_raw and tag_name_raw != "" -%}
                {%- assign tag_name_str = tag_name_raw | is_a:"String" ? tag_name_raw : tag_name_raw | join: "," | default:"" -%}
                {%- assign tag_name_clean = tag_name_str | strip | downcase -%}
                <strong>Cleaned Name for Slug:</strong> {{ tag_name_clean }} <br>
                {%- if tag_name_clean != "" -%}
                    {%- assign tag_slug = tag_name_clean | slugify -%}
                    <strong>Slug:</strong> {{ tag_slug }}
                    {%- if tag_slug != "" -%}
                        (Link would go here for {{ tag_name_raw }})
                    {%- else -%}
                        (Slug is empty after slugify)
                    {%- endif -%}
                {%- else -%}
                    (Cleaned name is empty)
                {%- endif -%}
            {%- else -%}
                (Raw name is nil or empty)
            {%- endif -%}
            <hr>
          </li>
        {%- endfor -%}
      </ul>
    </div>
    {%- else -%}
        <p class="notification is-warning">DEBUG: site.tags is empty or size is 0.</p>
    {%- endif -%}
    <!-- All Other Pages Section -->
    <div class="sitemap-section other-pages-section">
      <h2 class="title is-3 has-text-weight-semibold">
        <span class="icon-text">
          <span class="icon"><i class="ph ph-files"></i></span>
          <span>Other Site Pages</span>
        </span>
      </h2>
      <div class="content">
        <ul class="sitemap-list columns is-multiline">
          {%- assign excluded_urls = "/,/sitemap/,/site/,/about/,/contact/,/blog/,/404.html" | split: ',' -%}
          {%- assign regular_pages = site.html_pages | where_exp: "item", "item.layout != 'post'" -%}
          {%- for p in regular_pages sort: "title" -%}
            {%- unless excluded_urls contains p.url or p.sitemap == false -%}
              <li class="column is-one-third-desktop is-half-tablet">
                <a href="{{ p.url | relative_url }}">
                  <span class="icon is-small"><i class="ph ph-file-text"></i></span>
                  {{ p.title | default: p.name | escape }}
                </a>
              </li>
            {%- endunless -%}
          {%- endfor -%}
        </ul>
      </div>
    </div>

  </div>
</section>