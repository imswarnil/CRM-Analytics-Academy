---
title: "Page with Right Sidebar"
description: "This page demonstrates the layout with a left sidebar."
permalink : /left
layout: page
left_sidebar: true
---

 <style>
    .sticky-sidebar {
      position: sticky;
      top: 1rem;
    }

    .mobile-doc-menu {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      background: white;
      z-index: 1000;
      overflow-y: auto;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }

    .mobile-doc-menu.is-active {
      transform: translateY(0);
    }

    .mobile-doc-menu-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .vertical-divider {
      border-right: 1px solid #dbdbdb;
      height: 100%;
    }

    .horizontal-divider {
      border-top: 1px solid #dbdbdb;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    .full-width-divider {
      border-top: 2px solid #b5b5b5;
      margin: 2rem 0;
    }

    .mobile-toc {
      display: none;
    }

    .mobile-menu-toggle {
      position: fixed;
      top: 4rem;
      left: 1rem;
      z-index: 2000;
      background: #00d1b2;
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .desktop-only {
        display: none;
      }
      .mobile-toc {
        display: block;
        margin-top: 1rem;
      }
      .vertical-divider {
        display: none;
      }
    }

    .ad-container {
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <!-- Mobile Documentation Menu Button -->
  <button class="mobile-menu-toggle" id="mobile-doc-menu-toggle">
    <span class="icon">
      <i class="fas fa-bars"></i>
    </span>
  </button>

  <main class="columns">
    <!-- Left Sidebar -->
    <aside class="column is-2 desktop-only">
      <div class="vertical-divider">
        <div class="sticky-sidebar">
          <div class="ad-container">
            <div class="ad ad-square" style="height: 250px; background: lightgray; text-align: center;">Ad 250x250</div>
          </div>
          <nav class="menu">
            <ul class="menu-list">
              <li>
                <a href="#">Menu Item 1</a>
                <ul>
                  <li><a href="#">Subitem 1</a></li>
                  <li><a href="#">Subitem 2</a></li>
                </ul>
              </li>
              <li><a href="#">Menu Item 2</a></li>
            </ul>
          </nav>
          <div class="ad-container">
            <div class="box">Sponsored Course Promotion</div>
          </div>
        </div>
      </div>
    </aside>
 <!-- Center Content -->
    <section class="column is-7">
      <section class="hero is-light">
        <div class="hero-body">
          <nav class="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li><a href="#">Home</a></li>
              <li class="is-active"><a href="#" aria-current="page">Docs</a></li>
            </ul>
          </nav>
          <h1 class="title">Documentation Title</h1>
          <h2 class="subtitle">Subtitle goes here</h2>
          <div class="media">
            <figure class="media-left">
              <img src="avatar.png" alt="Avatar" class="image is-48x48">
            </figure>
            <div class="media-content">
              <p>Author Name | <span>Category</span> | <span>Date</span></p>
            </div>
          </div>
        </div>
      </section>
      <div class="mobile-toc">
        <nav class="menu">
          <p class="menu-label">Table of Contents</p>
          <ul class="menu-list">
            <li><a href="#">Section 1</a></li>
            <li><a href="#">Section 2</a></li>
          </ul>
        </nav>
      </div>
      <div class="content">
        <p>Main content goes here...</p>
      </div>
      <div class="horizontal-divider"></div>
      <nav class="pagination">
        <a class="pagination-previous">Previous: Title</a>
        <a class="pagination-next">Next: Title</a>
      </nav>
      <div class="full-width-divider"></div>
      <section class="box">
        <h3>About the Author</h3>
        <div class="media">
          <figure class="media-left">
            <img src="avatar.png" alt="Author Avatar" class="image is-64x64">
          </figure>
          <div class="media-content">
            <p>Author profile and social links.</p>
          </div>
        </div>
      </section>
      <div class="content">
        <h3>Comment Section</h3>
        <p>Comments...</p>
      </div>
      <div class="ad ad-leaderboard" style="height: 90px; background: lightgray; text-align: center;">Leaderboard Ad 728x90</div>
    </section>
    <!-- Right Sidebar -->
    <aside class="column is-3">
      <div class="vertical-divider">
        <div class="sticky-sidebar">
          <div class="buttons">
            <button class="button is-info">Improve this page</button>
            <button class="button is-link">Contribute</button>
            <button class="button is-warning">History</button>
          </div>
          <nav class="menu">
            <p class="menu-label">Table of Contents</p>
            <ul class="menu-list">
              <li><a href="#">Section 1</a></li>
              <li><a href="#">Section 2</a></li>
            </ul>
          </nav>
          <div class="box">
            <div class="ad ad-skyscraper" style="height: 600px; background: lightgray; text-align: center;">Skyscraper Ad</div>
          </div>
        </div>
      </div>
    </aside>
  </main>
  <!-- Mobile Documentation Menu -->
  <div id="mobile-doc-menu" class="mobile-doc-menu">
    <button class="delete mobile-doc-menu-close"></button>
    <nav class="menu">
      <p class="menu-label">Documentation Menu</p>
      <ul class="menu-list">
        <li><a href="#">Menu Item 1</a></li>
        <li><a href="#">Menu Item 2</a></li>
      </ul>
    </nav>
  </div>

  <script>
    const docMenu = document.getElementById('mobile-doc-menu');
    const docMenuToggle = document.getElementById('mobile-doc-menu-toggle');

    docMenuToggle.addEventListener('click', () => {
      docMenu.classList.toggle('is-active');
    });

    document.querySelector('.mobile-doc-menu-close').addEventListener('click', () => {
      docMenu.classList.remove('is-active');
    });
  </script>