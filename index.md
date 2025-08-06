---
layout: default
title: Bangalore Job Seekers Guide
description: "An open-source Jekyll theme crafted using the Bulma CSS framework. This theme utilizes Bulma SCSS, making it incredibly easy to customize and adapt to your specific needs. With over 7 layouts and 10+ collections"
---
<style>
    /*
    ==========================================================================
    PAGE-SPECIFIC STYLES: HOME
    ==========================================================================
    */

    /* --- General Section Styling --- */
    .section {
        padding-block: clamp(4rem, 8vw, 6rem);
    }
    .section-title {
        text-align: center;
        max-width: 60ch;
        margin-inline: auto;
        margin-block-end: 3rem;
    }
    .section-title h2 {
        font-size: clamp(1.8rem, 4vw, 2.5rem);
        margin-bottom: 0.75rem;
    }
    .section-title p {
        font-size: var(--spruce-font-size-lead);
        color: var(--spruce-base-color-text);
        max-width: 50ch;
        margin-inline: auto;
    }

    /* --- 1. Hero Section --- */
    .hero-section {
        padding-block: clamp(3rem, 7vw, 5rem);
        text-align: center;
    }
    .hero-grid {
        display: grid;
        align-items: center;
        gap: 3rem;
        grid-template-columns: 1fr; /* Mobile first */
    }
    .hero-image-wrapper {
        display: none; /* Hidden on mobile */
    }
    .hero-image-attribution {
        font-size: 0.75rem;
        margin-top: 1rem;
        opacity: 0.7;
    }
    .hero-image-attribution a {
        color: inherit;
        text-decoration: none;
    }
    .hero-image-attribution a:hover {
        text-decoration: underline;
    }

    @media (min-width: 64em) {
        .hero-section {
            text-align: left;
        }
        .hero-grid {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        }
        .hero-grid .post-heading__actions {
            justify-content: flex-start;
        }
        .hero-image-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .hero-image-wrapper img {
            max-width: 100%;
            height: auto;
        }
    }

    /* --- 2. Features Section --- */
    .features-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }
    .feature-card {
        text-align: center;
        padding: 2rem 1.5rem;
        background-color: var(--spruce-footer-color-background);
        border: 1px solid var(--spruce-base-color-border);
        border-radius: var(--spruce-border-radius-lg);
    }
    .feature-card__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        block-size: 3.5rem;
        inline-size: 3.5rem;
        margin-bottom: 1.5rem;
        border-radius: 50%;
        background-color: hsla(var(--spruce-base-color-primary), 0.1);
        color: var(--spruce-base-color-primary);
    }
    .feature-card__icon svg {
        block-size: 1.75rem;
        inline-size: 1.75rem;
    }
    .feature-card h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
    }
    .feature-card p {
        line-height: var(--spruce-line-height-md);
    }

    /* --- 3. Learning Path (Timeline) --- */
    .timeline {
        position: relative;
        max-width: 750px;
        margin: 0 auto;
        padding: 2rem 0;
    }
    .timeline::after {
        content: '';
        position: absolute;
        width: 3px;
        background-color: var(--spruce-base-color-border);
        top: 0;
        bottom: 0;
        left: 50%;
        margin-left: -1.5px;
    }
    .timeline-container {
        padding: 10px 40px;
        position: relative;
        background-color: inherit;
        width: 50%;
    }
    .timeline-container.left {
        left: 0;
    }
    .timeline-container.right {
        left: 50%;
    }
    .timeline-container::after {
        content: '';
        position: absolute;
        width: 25px;
        height: 25px;
        right: -12.5px;
        background-color: var(--spruce-base-color-background);
        border: 4px solid var(--spruce-base-color-primary);
        top: 15px;
        border-radius: 50%;
        z-index: 1;
    }
    .timeline-container.right::after {
        left: -12.5px;
    }
    .timeline-content {
        padding: 20px 30px;
        background-color: var(--spruce-card-color-background);
        position: relative;
        border-radius: var(--spruce-border-radius);
        border: 1px solid var(--spruce-base-color-border);
    }
    .timeline-content h3 {
        margin-top: 0;
        color: var(--spruce-base-color-primary);
    }
    @media screen and (max-width: 600px) {
      .timeline::after {
        left: 31px;
      }
      .timeline-container {
        width: 100%;
        padding-left: 70px;
        padding-right: 25px;
      }
      .timeline-container.right, .timeline-container.left {
        left: 0%;
      }
      .timeline-container.left::after, 
      .timeline-container.right::after {
        left: 18px;
      }
    }
    
    /* --- 4. Final CTA Section --- */
    .cta-section {
        background-color: var(--spruce-footer-color-background);
        text-align: center;
    }
</style>
<section class="hero-section">
        <div class="container">
            <div class="hero-grid">
                <div class="post-heading">
                    <span class="post-heading__headline">CRM ANALYTICS ACADEMY</span>
                    <h1 class="post-heading__title">Master Salesforce CRM Analytics</h1>
                    <p class="post-heading__description">
                        Go from beginner to expert with our step-by-step tutorials, hands-on projects, and career-focused training. Turn complex data into powerful business insights.
                    </p>
                    <div class="post-heading__actions">
                        <a href="{{ '/courses/' | relative_url }}" class="btn btn--primary btn--lg btn--primary-shadow">Start Learning Now</a>
                        <a href="{{ '/tutorials/' | relative_url }}" class="btn btn--outline-primary btn--lg">View Free Tutorials</a>
                    </div>
                </div>
                <div class="hero-image-wrapper">
                    <img src="{{ '/assets/hero.svg' | relative_url }}" alt="Illustration of a person analyzing charts and data on a dashboard.">
                    <p class="hero-image-attribution">
                        <a href="https://storyset.com/business" target="_blank" rel="noopener">Business illustrations by Storyset</a>
                    </p>
                </div>
            </div>
        </div>
    </section>
