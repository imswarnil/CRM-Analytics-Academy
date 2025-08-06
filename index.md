---
layout: default
title: Bangalore Job Seekers Guide
description: "An open-source Jekyll theme crafted using the Bulma CSS framework. This theme utilizes Bulma SCSS, making it incredibly easy to customize and adapt to your specific needs. With over 7 layouts and 10+ collections"
---

<style>
    /* =============================================================================
    // PAGE-SPECIFIC STYLES: ENHANCED HOMEPAGE
    // ============================================================================= */
    .section {
        padding-block: clamp(4rem, 8vw, 6rem);
    }
    .section-title {
        text-align: center;
        max-width: 60ch;
        margin-inline: auto;
        margin-block-end: 3rem;
    }

    /* --- 1. Hero Section --- */
    .hero-grid {
        display: grid;
        align-items: center;
        gap: clamp(2rem, 5vw, 4rem);
        grid-template-columns: 1fr;
        text-align: center;
    }
    .hero-grid .post-heading__actions { justify-content: center; }
    .hero-image-wrapper img { max-width: 100%; height: auto; }

    @media (min-width: 64em) {
        .hero-grid {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            text-align: left;
        }
        .hero-grid .post-heading__actions { justify-content: flex-start; }
    }

    /* --- 2. Features Section --- */
    .features-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
        align-items: center; justify-content: center;
        width: 4rem; height: 4rem;
        margin-bottom: 1.5rem;
        border-radius: 50%;
        background-color: hsla(var(--spruce-base-color-primary), 0.1);
        color: var(--spruce-base-color-primary);
        font-size: 2rem;
    }
    
    /* --- 3. Learning Path Section (Timeline) --- */
    .l-timeline {
        --size: 1.25em;
        --offset: calc(1.8em / 6);
        position: relative;
        max-width: 60ch;
        margin-inline: auto;
    }
    .l-timeline::before {
        --inline-size: 0.15em;
        background-color: var(--spruce-base-color-border);
        content: "";
        inline-size: var(--inline-size);
        inset: var(--offset) auto var(--offset) calc(var(--size) / 2 - var(--inline-size) / 2);
        position: absolute;
        z-index: -1;
    }
    .l-timeline > * + * { margin-block-start: 2.5rem; }
    .l-timeline__item { display: flex; gap: 1rem; }
    .l-timeline__item::before {
        background-color: var(--spruce-base-color-primary);
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        content: "";
        display: flex;
        flex-shrink: 0;
        margin-block-start: var(--offset);
    }
    .l-timeline__content > * + * { margin-block-start: 0.5rem; }
    .l-timeline__content strong { color: var(--spruce-base-color-heading); }

    /* --- 4. Content Showcase (Post Cards) --- */
    .post-card {
        position: relative;
        overflow: hidden;
        padding: 2rem;
        z-index: 1;
    }
    .post-card__bg-icon {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 8rem;
        color: var(--spruce-base-color-border);
        opacity: 0.6;
        pointer-events: none;
        transform: translate(30%, 30%);
        transition: transform 0.4s ease, color 0.4s ease;
        z-index: 1;
    }
    .post-card > * {
        position: relative;
        z-index: 2;
    }
    .post-card:hover .post-card__bg-icon {
        color: var(--spruce-base-color-primary);
        transform: translate(15%, 15%) rotate(-15deg);
    }

    /* --- 5. Final CTA Section --- */
    .cta-section {
        background-color: var(--spruce-base-color-heading);
        color: var(--spruce-base-color-background);
        text-align: center;
        border-radius: var(--spruce-border-radius-lg);
        padding: clamp(3rem, 6vw, 4rem);
    }
    .cta-section .post-heading__title {
        color: inherit;
    }
    .cta-section .post-heading__description {
        color: inherit;
        opacity: 0.8;
        max-width: 50ch;
        margin-inline: auto;
    }
</style>
   <div class="l-front-page">
        <!-- ======================= -->
        <!-- 1. HERO SECTION         -->
        <!-- ======================= -->
        <section class="section hero-section">
            <div class="container">
                <div class="hero-grid">
                    <div class="post-heading">
                        <p class="post-heading__headline">Eleventy / Spruce CSS</p>
                        <h1 class="post-heading__title">Document your next project a little bit better.</h1>
                        <p class="post-heading__description">Do you work on a project that requires documentation? This theme is for you. It's a simple, clean, and responsive theme for Eleventy.</p>
                        <div class="post-heading__actions">
                            <a class="btn btn--lg btn--primary btn--primary-shadow" href="/getting-started/introduction/">Get Started</a> 
                            <a class="btn btn--lg btn--outline-primary" href="/changelog/">View Changelog</a>
                        </div>
                    </div>
                    <div class="hero-image-wrapper">
                        <img src="/assets/hero.svg" alt="Illustration of people collaborating on documentation.">
                    </div>
                </div>
            </div>
        </section>
        <!-- ======================= -->
        <!-- 2. FEATURES SECTION     -->
        <!-- ======================= -->
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2 class="h2">Why Choose This Path?</h2>
                    <p>Built with modern tools and best practices to make your life easier.</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-card__icon"><i class="ph-bold ph-rocket-launch"></i></div>
                        <h3 class="h4">Blazing Fast</h3>
                        <p>Powered by Eleventy for a lightning-fast static site with no client-side JavaScript by default.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-card__icon"><i class="ph-bold ph-paint-brush-broad"></i></div>
                        <h3 class="h4">Easily Stylable</h3>
                        <p>Uses the sensible, modern Spruce CSS framework. Customize everything with CSS variables.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-card__icon"><i class="ph-bold ph-puzzle-piece"></i></div>
                        <h3 class="h4">Component-Based</h3>
                        <p>Modular and organized, making it easy to add new features or modify existing ones.</p>
                    </div>
                </div>
            </div>
        </section>
        <!-- ======================= -->
        <!-- 3. LEARNING PATH        -->
        <!-- ======================= -->
        <section class="section" style="background-color: var(--spruce-footer-color-background);">
            <div class="container">
                <div class="section-title">
                    <h2 class="h2">The Structured Approach</h2>
                    <p>Follow a clear, step-by-step process from setup to deployment.</p>
                </div>
                <div class="l-timeline">
                    <div class="l-timeline__item">
                        <div class="l-timeline__content">
                            <strong>1. Getting Started</strong>
                            <p>An introduction to the core concepts and project setup.</p>
                        </div>
                    </div>
                    <div class="l-timeline__item">
                        <div class="l-timeline__content">
                            <strong>2. Customization</strong>
                            <p>Learn how to change colors, fonts, and layouts to match your brand.</p>
                        </div>
                    </div>
                    <div class="l-timeline__item">
                        <div class="l-timeline__content">
                            <strong>3. Adding Content</strong>
                            <p>Discover how to write and organize your documentation using Markdown.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- ======================= -->
        <!-- 4. STORIES & VIDEOS     -->
        <!-- ======================= -->
        <section class="section">
            <div class="container">
                <div class="section-title">
                    <h2 class="h2">Latest Resources</h2>
                    <p>Check out our most recent articles and tutorials.</p>
                </div>
                <div class="l-card">
                    <div class="post-card">
                        <i class="ph-bold ph-article post-card__bg-icon"></i>
                        <h3 class="h4">How to Write Great Documentation</h3>
                        <p>A deep dive into creating content that is clear, concise, and helpful for your users.</p>
                        <a class="btn btn--primary" href="#" style="margin-top: 1.5rem; align-self: start;">Read Article</a>
                    </div>
                    <div class="post-card">
                        <i class="ph-bold ph-video post-card__bg-icon"></i>
                        <h3 class="h4">Video: Customizing Your Theme</h3>
                        <p>A 10-minute walkthrough on how to change the primary colors and typography of your site.</p>
                        <a class="btn btn--primary" href="#" style="margin-top: 1.5rem; align-self: start;">Watch Video</a>
                    </div>
                    <div class="post-card">
                        <i class="ph-bold ph-git-branch post-card__bg-icon"></i>
                        <h3 class="h4">Deploying to Netlify</h3>
                        <p>Follow our guide to get your new documentation site live on the web in minutes.</p>
                        <a class="btn btn--primary" href="#" style="margin-top: 1.5rem; align-self: start;">View Guide</a>
                    </div>
                </div>
            </div>
        </section>
        <!-- ======================= -->
        <!-- 5. FAQ SECTION          -->
        <!-- ======================= -->
        <div class="group container">
            <div class="section-title">
                <h2 class="h2">Frequently Asked Questions</h2>
            </div>
            <div class="accordion-list" style="max-width: 75ch; margin-inline: auto;">
                <!-- Your existing FAQ accordion items go here -->
                <div class="accordion-card accordion-card--js">
                    <h3 class="accordion-card__title">
                        <button class="accordion-card__toggle" aria-expanded="false">Why Make Another CSS Framework?<svg aria-hidden="true" focusable="false" height="18px" viewBox="0 0 18 18" width="18px"><path d="M13.5,8.625c0,-0.207 -0.168,-0.375 -0.375,-0.375l-8.25,0c-0.207,0 -0.375,0.168 -0.375,0.375l0,0.75c0,0.207 0.168,0.375 0.375,0.375l8.25,0c0.207,0 0.375,-0.168 0.375,-0.375l0,-0.75Z"></path><path class="vertical-line" d="M9.375,13.5c0.207,-0 0.375,-0.168 0.375,-0.375l0,-8.25c0,-0.207 -0.168,-0.375 -0.375,-0.375l-0.75,0c-0.207,0 -0.375,0.168 -0.375,0.375l-0,8.25c-0,0.207 0.168,0.375 0.375,0.375l0.75,-0Z"></path></svg></button>
                    </h3>
                    <div class="accordion-card__content" hidden><p>As you may know, there are many CSS frameworks. Everybody can choose one that suits their work style or project requirements. So why make another one? It is certainly not because we can do it better but because we want to do it our way.</p></div>
                </div>
                <div class="accordion-card accordion-card--js">
                    <h3 class="accordion-card__title">
                        <button class="accordion-card__toggle" aria-expanded="false">We Left the Grid Out<svg aria-hidden="true" focusable="false" height="18px" viewBox="0 0 18 18" width="18px"><path d="M13.5,8.625c0,-0.207 -0.168,-0.375 -0.375,-0.375l-8.25,0c-0.207,0 -0.375,0.168 -0.375,0.375l0,0.75c0,0.207 0.168,0.375 0.375,0.375l8.25,0c0.207,0 0.375,-0.168 0.375,-0.375l0,-0.75Z"></path><path class="vertical-line" d="M9.375,13.5c0.207,-0 0.375,-0.168 0.375,-0.375l0,-8.25c0,-0.207 -0.168,-0.375 -0.375,-0.375l-0.75,0c-0.207,0 -0.375,0.168 -0.375,0.375l-0,8.25c-0,0.207 0.168,0.375 0.375,0.375l0.75,-0Z"></path></svg></button>
                    </h3>
                    <div class="accordion-card__content" hidden><p>One controversial decision we made with Spruce is to leave a classical grid system out. Because of the late CSS layout model developments like Flexbox and Grid, we think it can be eliminated; this doesn’t mean that we won’t show you how to make layouts with ease, but we try to make it the modern way.</p></div>
                </div>
            </div>
        </div>
        <!-- ======================= -->
        <!-- 6. FINAL CTA SECTION    -->
        <!-- ======================= -->
        <section class="section">
            <div class="container">
                <div class="cta-section">
                    <div class="post-heading">
                        <h2 class="post-heading__title">Ready to Start Building?</h2>
                        <p class="post-heading__description">Jump into the introduction and get your documentation site up and running in minutes.</p>
                        <div class="post-heading__actions">
                            <a class="btn btn--lg btn--primary btn--primary-shadow" href="/getting-started/introduction/">Start My Journey</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
