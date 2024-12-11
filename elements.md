---
layout: page
title: "Both Sidebars"
left_sidebar: true
sidebar: true
---

<!-- _includes/lessons.html -->
{% assign posts = site.posts | where_exp: "post", "post.categories contains 'Training Videos'" %}

<section class="">
  <div>
    <h2 class="title is-4 mb-5">All Lessons</h2>
    <div class="columns is-multiline">
      {% for post in posts %}
      <div class="column is-12">
        <div class="">
          <div class="columns is-vcentered">
            <div class="column is-4">
              <a href="{{ post.url }}">
                <img src="{{ post.thumbnail }}" alt="{{ post.title }}" class="image is-rounded" >
              </a>
            </div>
            <div class="column">
              <div class="content">
                <p class="has-text-weight-semibold">Lesson {{ post.lesson_number }}</p>
                <h3 class="title is-5"><a href="{{ post.url }}">{{ post.title }}</a></h3>
                <p>{{ post.description }}</p>
                <p class="has-text-grey-dark">{{ post.duration }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>


<style>
        .course-card {
            margin-bottom: 1.5rem;
        }
        .course-thumbnail img {
            width: 100%;
            height: auto;
        }
        .course-bookmark {
            position: absolute;
            top: 1rem;
            right: 1rem;
        }
        .course-meta {
            display: flex;
            justify-content: space-between;
        }
        .progress-circle {
            --size: 2.5rem;
            --pro: 0;
            width: var(--size);
            height: var(--size);
            border-radius: 50%;
            background: conic-gradient(#00d1b2 var(--pro), #f5f5f5 0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: bold;
        }
    </style>
  <section class="section">
        <div class="container">
            <div class="columns is-mobile is-multiline">
                <div class="column is-12">
                    <div class="is-flex is-justify-content-space-between">
                        <h1 class="title">Courses</h1>
                        <button class="button is-secondary">Filters</button>
                    </div>
                </div>
                <div class="column is-one-quarter">
                    <aside class="menu">
                        <p class="menu-label">Search</p>
                        <input class="input" type="text" placeholder="Search...">
                        <p class="menu-label">Category</p>
                        <ul class="menu-list">
                            <li><label><input type="checkbox"> Admin</label></li>
                            <li><label><input type="checkbox"> Business</label></li>
                            <li><label><input type="checkbox"> Design</label></li>
                            <li><label><input type="checkbox"> Development</label></li>
                        </ul>
                        <p class="menu-label">Tags</p>
                        <ul class="menu-list">
                            <li><label><input type="checkbox"> Admin</label></li>
                            <li><label><input type="checkbox"> Apex</label></li>
                            <li><label><input type="checkbox"> Basics</label></li>
                            <li><label><input type="checkbox"> Beginner</label></li>
                            <li><label><input type="checkbox"> Developer</label></li>
                            <li><label><input type="checkbox"> Fundamental</label></li>
                            <li><label><input type="checkbox"> Some Tags</label></li>
                        </ul>
                        <p class="menu-label">Level</p>
                        <ul class="menu-list">
                            <li><label><input type="checkbox"> All Levels</label></li>
                            <li><label><input type="checkbox"> Beginner</label></li>
                            <li><label><input type="checkbox"> Intermediate</label></li>
                            <li><label><input type="checkbox"> Expert</label></li>
                        </ul>
                        <p class="menu-label">Price</p>
                        <ul class="menu-list">
                            <li><label><input type="checkbox"> Free</label></li>
                            <li><label><input type="checkbox"> Paid</label></li>
                        </ul>
                        <button class="button is-small is-fullwidth">Clear All Filters</button>
                    </aside>
                </div>
                <div class="column is-three-quarters">
                    <div class="columns is-multiline">
                        <div class="column is-one-third course-card">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3 course-thumbnail">
                                        <img src="https://namastesalesforce.com/wp-content/uploads/2024/05/what-is-salesforce.png" alt="Salesforce Fundamentals: Master the Basics">
                                    </figure>
                                    <span class="icon is-small course-bookmark">
                                        <i class="fas fa-bookmark"></i>
                                    </span>
                                </div>
                                <div class="card-content">
                                    <div class="media">
                                        <div class="media-content">
                                            <p class="title is-4">Salesforce Fundamentals: Master the Basics</p>
                                            <p class="subtitle is-6">By <a href="#">Admin</a></p>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <p>Category: Admin</p>
                                        <div class="course-meta">
                                            <span><i class="fas fa-user"></i> 2</span>
                                            <span><i class="fas fa-clock"></i> 1h 30m</span>
                                        </div>
                                    </div>
                                    <button class="button is-primary is-fullwidth">Enroll Course</button>
                                </div>
                            </div>
                        </div>
                        <div class="column is-one-third course-card">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3 course-thumbnail">
                                        <img src="https://namastesalesforce.com/wp-content/uploads/2024/04/Black-Yellow-Modern-Guide-YouTube-Thumbnail.png" alt="My First Course">
                                    </figure>
                                    <span class="icon is-small course-bookmark">
                                        <i class="fas fa-bookmark"></i>
                                    </span>
                                </div>
                                <div class="card-content">
                                    <div class="media">
                                        <div class="media-content">
                                            <p class="title is-4">My First Course</p>
                                            <p class="subtitle is-6">By <a href="#">Admin</a></p>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <p>Categories: Business, Design</p>
                                        <div class="course-meta">
                                            <span><i class="fas fa-user"></i> 5</span>
                                            <span><i class="fas fa-clock"></i> 1h 27m</span>
                                        </div>
                                        <p class="has-text-weight-bold">Price: <del>₹21.00</del> ₹1.00</p>
                                        <div class="course-meta">
                                            <span class="progress-circle" style="--pro: 50;">50%</span>
                                            <span>50% Booked</span>
                                        </div>
                                    </div>
                                    <button class="button is-primary is-fullwidth">Add to cart</button>
                                </div>
                            </div>
                        </div>
                        <div class="column is-one-third course-card">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3 course-thumbnail">
                                        <img src="https://namastesalesforce.com/wp-content/uploads/2024/05/Copy-of-Courses-2.png" alt="Apex Beginner: Learn Salesforce Programming Language">
                                    </figure>
                                    <span class="icon is-small course-bookmark">
                                        <i class="fas fa-bookmark"></i>
                                    </span>
                                </div>
                                <div class="card-content">
                                    <div class="media">
                                        <div class="media-content">
                                            <p class="title is-4">Apex Beginner: Learn Salesforce Programming Language</p>
                                            <p class="subtitle is-6">By <a href="#">Admin</a></p>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <p>Category: Development</p>
                                        <div class="course-meta">
                                            <span><i class="fas fa-user"></i> 1</span>
                                            <span><i class="fas fa-clock"></i> 1h</span>
                                        </div>
                                    </div>
                                    <button class="button is-primary is-fullwidth">Enroll Course</button>
                                </div>
                            </div>
                        </div>
                        <!-- More course cards here -->
                    </div>
                </div>
            </div>
        </div>
    </section>
   

# Heading 1

{% raw %}
{% adsense square %}
{% endraw %}

## Heading 2

{% raw %}
{% adsense button %}
{% endraw %}


# Heading 1

 {% adsense square %}
 

## Heading 2

 {% adsense button %}

### Heading 3
 {% adsense small-leaderboard %}

#### Heading 4

 {% adsense large-leaderboard %}
##### Heading 5

 {% adsense multiplex %}

###### Heading 6

<small>A small element</small>

[A link](https://david.darn.es "A link")

Lorem ipsum dolor sit amet, consectetur adip* isicing elit, sed do eiusmod *tempor incididunt ut labore et dolore magna aliqua.



Duis aute irure dolor in [A link](https://david.darn.es "A link") reprehenderit in voluptate velit esse cillum **bold text** dolore eu fugiat nulla pariatur. Excepteur span element sint occaecat cupidatat non proident, sunt _italicised text_ in culpa qui officia deserunt mollit anim id `some code` est laborum.

* An item
* An item
* An item
* An item
* An item


1. Item one
2. Item two
3. Item three
4. Item four
5. Item five

> A simple blockquote

Some HTML...

``` html
<blockquote cite="http://www.imdb.com/title/tt0284978/quotes/qt1375101">
  <p>You planning a vacation, Mr. Sullivan?</p>
  <footer>
    <a href="http://www.imdb.com/title/tt0284978/quotes/qt1375101">Sunways Security Guard</a>
  </footer>
</blockquote>
```

...CSS...

``` css
blockquote {
  text-align: center;
  font-weight: bold;
}
blockquote footer {
  font-size: .8rem;
}
```

...and JavaScript

``` js
const blockquote = document.querySelector("blockquote")
const bolden = (keyString, string) =>
  string.replace(new RegExp(keyString, 'g'), '<strong>'+keyString+'</strong>')

blockquote.innerHTML = bolden("Mr. Sullivan", blockquote.innerHTML)
```

`Single line of code`

## HTML Includes

### Contact form

{% include site-form.html %}

``` html
{% raw %}{% include site-form.html %}{% endraw %}
```

### Demo map embed

{% include map.html id="1UT-2Z-Vg_MG_TrS5X2p8SthsJhc" title="Coffee shop map" %}

``` html
{% raw %}{% include map.html id="XXXXXX" title="Coffee shop map" %}{% endraw %}
```

### Button include

{% include button.html text="A button" link="https://david.darn.es" %}

{% include button.html text="A button with icon" link="https://twitter.com/daviddarnes" icon="twitter" %}

``` html
{% raw %}{% include button.html text="A button" link="https://david.darn.es" %}
{% include button.html text="A button with icon" link="https://twitter.com/daviddarnes" icon="twitter" %}{% endraw %}
```


### Icon include

{% include icon.html id="twitter" title="twitter" %} [{% include icon.html id="linkedin" title="twitter" %}](https://www.linkedin.com/in/daviddarnes)

``` html
{% raw %}{% include icon.html id="twitter" title="twitter" %}
[{% include icon.html id="linkedin" title="twitter" %}](https://www.linkedin.com/in/daviddarnes){% endraw %}
```

### Video include

{% include video.html id="zrkcGL5H3MU" title="Siteleaf tutorial video" %}

``` html
{% raw %}{% include video.html id="zrkcGL5H3MU" title="Siteleaf tutorial video" %}{% endraw %}
```


### Image includes

{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Image with caption" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Right aligned image" position="right" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Left aligned image" position="left" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/1600/800?image=894" alt="Image with just alt text" %}

``` html
{% raw %}{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Image with caption" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Right aligned image" position="right" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/600/800?image=894" caption="Left aligned image" position="left" width="300" height="800" %}

{% include figure.html image="https://picsum.photos/1600/800?image=894" alt="Image with just alt text" %}{% endraw %}
```
