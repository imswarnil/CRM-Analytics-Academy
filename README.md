# CRM Analytics Academy
[![Gem Version](https://badge.fury.io/rb/crm-analytics-academy.svg)](https://badge.fury.io/rb/crm-analytics-academy)

📊 A comprehensive platform to learn CRM Analytics from scratch.

![Screenshot](path_to_your_screenshot_image)

[<img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" width="217"/>](https://buymeacoffee.com/your_profile#support)

## Contents
- [About](#about)
- [Features](#features)
- [Examples](#examples)
- [Installation](#installation)
- [Customizing](#customizing)
- [Configuration](#configuration)
  - [Gem dependency settings](#gem-dependency-settings)
  - [Site settings](#site-settings)
  - [Site performance settings](#site-performance-settings)
  - [Site navigation](#site-navigation)
  - [Custom fonts](#custom-fonts)
- [Using includes](#using-includes)
- [Page layouts](#page-layouts)
- [Page and Post options](#page-and-post-options)
- [Credits](#credits)

## About

**CRM Analytics Academy is a platform designed to teach CRM analytics to beginners and advanced users. The courses cover various aspects of CRM analytics, including data management, analysis techniques, reporting, and more.**

## Features

- Clear and engaging design to enhance the learning experience
- Built with **Bulma CSS** for a responsive and modern interface
- Comprehensive course content covering all aspects of CRM analytics
- User authentication and progress tracking
- Interactive quizzes and assignments
- Built-in support for contact forms using [Formspree](https://formspree.io/) or [Netlify Forms](https://www.netlify.com/features/#forms)
- Modular components for easy customization
- SEO optimized with JSON-LD structured data

## Examples

Here are a few examples of how CRM Analytics Academy can be used:

- [example1.com](https://example1.com)
- [example2.com](https://example2.com)
- [example3.com](https://example3.com)

## Installation

### Quick setup

To get started quickly, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/crm-analytics-academy.git
    cd crm-analytics-academy
    ```

2. Install the dependencies:
    ```sh
    bundle install
    ```

3. Build and serve the site:
    ```sh
    bundle exec jekyll serve
    ```

4. Open your browser and go to `http://localhost:4000` to see your site in action.

## Customizing

You can customize the CRM Analytics Academy to fit your needs. Here are some common customizations:

### Custom styles

To add your own styles, create a `styles.scss` file in your project with the same path (`assets/styles.scss`). You can add your custom styles there.

### Custom colors and fonts

To set your own colors and fonts, you can overwrite the variables in the `_settings.scss` file. Make sure to define them before the `@import "bulma";` line so they take effect.

## Configuration

There are several settings you can configure in the `_config.yml` file:

### Gem dependency settings

Update the `twitter`, `author`, and `social` values to match your project's information. These are used by the [jekyll-seo-tag](https://github.com/jekyll/jekyll-seo-tag) plugin.

### Site settings

Update the `description`, `title`, and `url` to match your project. Replace the logos and default images in the `/assets/` directory with your own graphics. Set the `email` to the address where you want to receive contact form inquiries.

### Site performance settings

Enable the built-in Service Worker by setting `service_worker` to `true` in the `_config.yml` file. To enable inline CSS, set `css_inline` to `true`.

### Site navigation

Configure the site navigation by updating the `navigation_header`, `navigation_footer`, `social_links`, and `sharing_links` in the `_config.yml` file.

### Custom fonts

Configure custom fonts by updating the `custom_fonts` key in the `_config.yml` file. Add the URLs provided by your font provider.

## Using includes

CRM Analytics Academy includes several shortcodes for common elements:

### `button.html`
A button that links to a page.

Example usage: `{% include button.html text="Start Learning" link="https://example.com" %}`

### `figure.html`
An image with an optional caption.

Example usage: `{% include figure.html image="/uploads/image.jpg" caption="Example Image" %}`

### `icon.html`
An icon.

Example usage: `{% include icon.html id="twitter" %}`

### `video.html`
A YouTube video.

Example usage: `{% include video.html id="dQw4w9WgXcQ" %}`

## Page layouts

CRM Analytics Academy includes several page layouts:

- `course`: Displays a course with all its modules and lessons
- `lesson`: Displays an individual lesson
- `quiz`: Displays a quiz with interactive questions
- `blog`: Displays a blog page with posts

## Page and Post options

You can customize individual pages and posts with the following options:

- `aside: true`: Adds a sidebar to the page or post
- `comments: false`: Disables comments for that post
- `feature_image: "/uploads/feature-image.jpg"`: Adds a feature image to the page

## Credits

- Thanks to [Bulma](https://bulma.io/) for the CSS framework
- Thanks to [Jekyll](https://jekyllrb.com/) for the static site generator
- Thanks to [Simple Icons](https://simpleicons.org/) for the icons
- Thanks to [Formspree](https://formspree.io/) and [Netlify Forms](https://www.netlify.com/features/#forms) for the contact form solutions

