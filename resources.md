---
# This is the main page for your resource library
layout: resources
title: Resource Library
description: "A curated collection of helpful articles, tools, and videos. Use the filters to find exactly what you need."
---

<!-- ============================================================ -->
<!-- STYLES for the resource page - these could be moved to SCSS -->
<!-- ============================================================ -->
<style>
  .resource-page-header { text-align: center; max-width: 60ch; margin: 0 auto 4rem auto; }
  .resource-sidebar { height: fit-content; position: sticky; top: 2.5rem; display: flex; flex-direction: column; gap: 2.5rem; }
  .resource-filter-group { padding: 0; margin: 0; }
  .resource-filter-group__title { font-family: var(--spruce-font-family-heading, sans-serif); font-size: 1.1rem; font-weight: 700; color: var(--spruce-base-color-heading, #111); margin: 0 0 1.25rem 0; }
  .resource-filter-options { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
  .resource-filter-label { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--spruce-base-color-border, #e0e0e0); border-radius: var(--spruce-border-radius-lg, 12px); background-color: var(--spruce-card-color-background, #fff); cursor: pointer; transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
  .resource-filter-label:hover { border-color: var(--spruce-base-color-primary, #e53935); transform: translateY(-2px); }
  .resource-filter-input { position: absolute; opacity: 0; width: 0; height: 0; }
  .resource-filter-icon { flex-shrink: 0; display: inline-flex; font-size: 1.75rem; color: var(--spruce-base-color-primary, #e53935); }
  .resource-filter-text { flex-grow: 1; font-weight: 600; color: var(--spruce-base-color-heading); }
  .resource-filter-text__title { font-weight: 600; font-size: 1rem; color: var(--spruce-base-color-heading); margin: 0 0 0.1rem 0; }
  .resource-filter-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--spruce-form-color-border, #ccc); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease-in-out; }
  .resource-filter-check svg { width: 14px; height: 14px; color: #fff; transform: scale(0); transition: transform 0.15s ease-in-out; }
  .resource-filter-input:checked + .resource-filter-label { border-color: var(--spruce-base-color-primary, #e53935); box-shadow: 0 0 0 2px hsla(var(--spruce-base-color-primary-hsl, 355, 77%, 56%), 0.25); }
  .resource-filter-input:checked + .resource-filter-label .resource-filter-check { background-color: var(--spruce-base-color-primary, #e53935); border-color: var(--spruce-base-color-primary, #e53935); }
  .resource-filter-input:checked + .resource-filter-label .resource-filter-check svg { transform: scale(1); }
  .resource-sidebar__footer { display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--spruce-base-color-border, #e0e0e0); }
  .resource-content { display: flex; flex-direction: column; gap: 1.25rem; }
  .resource-row { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; background-color: var(--spruce-card-color-background, #fff); border: 1px solid var(--spruce-base-color-border, #e0e0e0); border-radius: var(--spruce-border-radius-lg, 12px); text-decoration: none; color: var(--spruce-base-color-text); transition: border-color 0.2s ease; }
  .resource-row:hover { border-color: var(--spruce-base-color-primary, #e53935); }
  .resource-row__icon { flex-shrink: 0; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background-color: var(--spruce-base-color-code-background, #f1f1f1); border-radius: var(--spruce-border-radius, 8px); font-size: 1.75rem; color: var(--spruce-base-color-primary, #e53935); }
  .resource-row__icon img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--spruce-border-radius, 8px); }
  .resource-row__content { flex-grow: 1; }
  .resource-row__title { font-family: var(--spruce-font-family-heading, sans-serif); font-size: 1.125rem; font-weight: 600; color: var(--spruce-base-color-heading, #111); margin: 0 0 0.25rem 0; }
  .resource-row__description { font-size: 0.9rem; margin: 0; line-height: 1.6; }
  @media (max-width: 768px) { .resource-row { flex-direction: column; align-items: flex-start; text-align: center; } .resource-row__icon { width: 100%; height: 160px; margin-bottom: 1rem; font-size: 2.5rem; } .resource-row__content { width: 100%;} }
</style>

<!-- This is where the Liquid logic finds and displays the resource cards -->
{%- comment -%}
  1. Create a new variable `all_resources` that contains ONLY
     the posts where the category is "Resources".
{%- endcomment -%}
{% assign all_resources = site.posts | where: "category", "Resources" %}
{% for resource in all_resources %}
  <a href="{{ resource.url | relative_url }}" class="resource-row">
    <div class="resource-row__icon">
      {% if resource.image %}
        <img src="{{ resource.image | relative_url }}" alt="">
      {% elsif resource.icon %}
        <i class="{{ resource.icon }}"></i>
      {% else %}
        <i class="ph-duotone ph-book-bookmark"></i>
      {% endif %}
    </div>
    <div class="resource-row__content">
      <h3 class="resource-row__title">{{ resource.title }}</h3>
      {% if resource.description %}
        <p class="resource-row__description">{{ resource.description }}</p>
      {% endif %}
    </div>
  </a>
{% endfor %}