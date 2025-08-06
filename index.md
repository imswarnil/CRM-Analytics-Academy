---
layout: default
title: Bangalore Job Seekers Guide
description: "An open-source Jekyll theme crafted using the Bulma CSS framework. This theme utilizes Bulma SCSS, making it incredibly easy to customize and adapt to your specific needs. With over 7 layouts and 10+ collections"
---

<!-- 
================================================================================
FINAL HOMEPAGE (with enhanced hero and card styles)
================================================================================
This file contains the complete HTML structure and embedded CSS for the homepage.
It includes a two-column hero and advanced card styling with decorative icons
and a hover texture effect, all built on SpruceCSS.
-->


<style>
    /* =============================================================================
    // PAGE-SPECIFIC STYLES: ENHANCED HOMEPAGE
    // ============================================================================= */

    /* --- 1. Hero Section Styles --- */
    .hero-section {
        padding-block: clamp(3rem, 7vw, 5rem);
    }
    .hero-grid {
        display: grid;
        align-items: center;
        gap: clamp(2rem, 5vw, 4rem);
        grid-template-columns: 1fr; /* Mobile-first */
        text-align: center;
    }
    .hero-grid .post-heading__actions {
        justify-content: center; /* Center buttons on mobile */
    }
    .hero-image-wrapper img {
        max-width: 100%;
        height: auto;
    }
    @media (min-width: 64em) {
        .hero-grid {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            text-align: left;
        }
        .hero-grid .post-heading__actions {
            justify-content: flex-start;
        }
    }

    /* --- 2. Enhanced Card Styles --- */
    .post-card {
        position: relative; /* Crucial for positioning the icon and texture */
        overflow: hidden;   /* Crucial for the "half-hidden" icon effect */
        padding: 2rem;
        z-index: 1; /* Establishes a stacking context */
    }

    /* The subtle background pattern that appears on hover */
    .post-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(var(--spruce-base-color-border) 1px, transparent 1px);
        background-size: 10px 10px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        z-index: -1; /* Place it behind the content */
    }

    /* The decorative icon in the top-right corner */
    .post-card__icon {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 10rem; /* Large size */
        color: var(--spruce-base-color-border);
        opacity: 0.7;
        pointer-events: none; /* Allows clicks to pass through */
        transform: translate(30%, -30%); /* Moves it partially out of view */
        transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        z-index: 1; /* Behind the content, but can be above the texture */
    }

    /* All direct children of the card need a higher z-index to appear above the icon */
    .post-card > * {
        position: relative;
        z-index: 2;
    }
    
    /* Hover effects for the entire card */
    .post-card:hover::before {
        opacity: 1; /* Fade in the background texture */
    }
    .post-card:hover .post-card__icon {
        opacity: 1; /* Make the icon slightly more visible */
        transform: translate(25%, -25%) rotate(-5deg); /* Move it slightly and rotate */
    }
</style>
   <div class="l-front-page">
        <!-- ======================= -->
        <!-- 1. HERO SECTION         -->
        <!-- ======================= -->
        <section class="hero-section">
            <div class="hero-grid">
                <!-- Left Column: Text Content -->
                <div class="post-heading">
                    <p class="post-heading__headline">Eleventy / Spruce CSS</p>
                    <h1 class="post-heading__title">Document your next project a little bit better.</h1>
                    <p class="post-heading__description">Do you work on a project that requires a documentation? This theme is for you. It's a simple, clean and responsive theme for Eleventy.</p>
                    <div class="post-heading__actions">
                        <a class="btn btn--lg btn--primary btn--primary-shadow" href="/getting-started/introduction/">Introduction</a> 
                        <a class="btn btn--lg btn--outline-primary" href="/changelog/">Changelog</a>
                    </div>
                </div>
                <!-- Right Column: Image -->
                <div class="hero-image-wrapper">
                    <img src="/assets/hero.svg" alt="An illustration showing people collaborating on a project.">
                    <!-- Make sure this path points to your actual image! -->
                </div>
            </div>
        </section>
        <!-- ======================= -->
        <!-- 2. OVERVIEW SECTION     -->
        <!-- ======================= -->
        <div class="group">
            <h2>Overview</h2>
            <div class="l-card">
                <!-- Getting Started Card -->
                <div class="post-card">
                <i class="ph-bold ph-airplane-takeoff"></i>
                    <span class="post-card__serial-number"></span>
                    <h2 class="post-card__title">Getting Started</h2>
                    <p>Start here and get to know this minimalistic Eleventy theme.</p>
                    <a class="btn btn--primary btn--primary-shadow" href="/getting-started/">Read More <span class="sr-only">about Getting Started</span></a>
                </div>
                <!-- Customization Card -->
                <div class="post-card">
                    <i class="ph-paint-brush-broad post-card__icon"></i>
                    <span class="post-card__serial-number"></span>
                    <h2 class="post-card__title">Customization</h2>
                    <p>Built on the top of Spruce CSS, you can easily customize its look.</p>
                    <a class="btn btn--primary btn--primary-shadow" href="/customization/">Read More <span class="sr-only">about Customization</span></a>
                </div>
            </div>
        </div>
        <!-- ======================= -->
        <!-- 3. FAQ SECTION          -->
        <!-- ======================= -->
        <div class="group">
            <h2>Frequently Asked Questions</h2>
            <div class="accordion-list">
                <div class="accordion-card accordion-card--js">
                    <h3 class="accordion-card__title">
                        <button class="accordion-card__toggle" aria-expanded="false">
                            Why Make Another CSS Framework?
                            <svg aria-hidden="true" focusable="false" height="18px" viewBox="0 0 18 18" width="18px"><path d="M13.5,8.625c0,-0.207 -0.168,-0.375 -0.375,-0.375l-8.25,0c-0.207,0 -0.375,0.168 -0.375,0.375l0,0.75c0,0.207 0.168,0.375 0.375,0.375l8.25,0c0.207,0 0.375,-0.168 0.375,-0.375l0,-0.75Z"></path><path class="vertical-line" d="M9.375,13.5c0.207,-0 0.375,-0.168 0.375,-0.375l0,-8.25c0,-0.207 -0.168,-0.375 -0.375,-0.375l-0.75,0c-0.207,0 -0.375,0.168 -0.375,0.375l-0,8.25c-0,0.207 0.168,0.375 0.375,0.375l0.75,-0Z"></path></svg>
                        </button>
                    </h3>
                    <div class="accordion-card__content" hidden><p>As you may know, there are many CSS frameworks (hundreds of them, and a lot of them are not maintained today). Everybody can choose one that suits their work style or project requirements. So why make another one? It is certainly not because we can do it better but because we want to do it our way. We want to be in control and make decisions.</p></div>
                </div>
                <div class="accordion-card accordion-card--js">
                    <h3 class="accordion-card__title">
                        <button class="accordion-card__toggle" aria-expanded="false">
                            It Is Opinionated
                            <svg aria-hidden="true" focusable="false" height="18px" viewBox="0 0 18 18" width="18px"><path d="M13.5,8.625c0,-0.207 -0.168,-0.375 -0.375,-0.375l-8.25,0c-0.207,0 -0.375,0.168 -0.375,0.375l0,0.75c0,0.207 0.168,0.375 0.375,0.375l8.25,0c0.207,0 0.375,-0.168 0.375,-0.375l0,-0.75Z"></path><path class="vertical-line" d="M9.375,13.5c0.207,-0 0.375,-0.168 0.375,-0.375l0,-8.25c0,-0.207 -0.168,-0.375 -0.375,-0.375l-0.75,0c-0.207,0 -0.375,0.168 -0.375,0.375l-0,8.25c-0,0.207 0.168,0.375 0.375,0.375l0.75,-0Z"></path></svg>
                        </button>
                    </h3>
                    <div class="accordion-card__content" hidden><p>Each system is opinionated but on a different level; this is valid for Spruce too. We don’t want to vote for (strictly) any particular solution (because there is always more than one), but we will show you what we think is the best for us (and maybe for you too). We don’t believe there is a good or bad solution, but we can learn from any of them.</p></div>
                </div>
                <!-- ... other accordion items ... -->
            </div>
        </div>
    </div>
