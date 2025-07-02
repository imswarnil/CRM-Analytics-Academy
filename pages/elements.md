---
title: Elements
feature_text:  A demo of Markdown and HTML includes
feature_image: "https://picsum.photos/2560/600?image=873"
description: "A demo of Markdown and HTML includes"
sidebar: true
layout : page
permalink : /elements/
---

{% include components/qna.html q="My first question?" a="<p>This is the <strong>answer</strong> to the first question.</p>" %}
{% include components/qna.html q="Another question..." a="<p>Another answer here.</p>" %}

---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
  resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
  i18n with plurals support and easy syntax.

You will like those projects!

---

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar


## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```js
Sample text here...
```

Syntax highlighting

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"


## Plugins

The killer feature of `markdown-it` is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


### [Emojies](https://github.com/markdown-it/markdown-it-emoji)

> Classic markup: :wink: :cry: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.


### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

- 19^th^
- H~2~O


### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++


### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==


### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.


### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b


### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.

*[HTML]: Hyper Text Markup Language

### [Custom containers](https://github.com/markdown-it/markdown-it-container)

::: warning
*here be dragons*
:::

<div class="im-video-embed im-video-embed--16-9">
    <iframe
        src="https://www.youtube.com/embed/VIDEO_ID"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        title="Embedded YouTube Video">
    </iframe>
</div>

<!-- For 4:3 aspect ratio -->
<div class="im-video-embed im-video-embed--4-3">
    <iframe src="..." ...></iframe>
</div>

<aside class="im-ad-placeholder" aria-label="Advertisement">
    <span class="im-ad-placeholder__label">Advertisement</span>
    <p>Your ad content or a placeholder image/text would go here.</p>
    <a href="#" class="im-ad-placeholder__link">Learn More</a>
</aside>

<div class="im-takeaways-box">
    <h4 class="im-takeaways-box__title"><i class="ph ph-list-checks"></i> Key Takeaways</h4>
    <ul class="im-takeaways-box__list">
        <li>First important point that readers should remember.</li>
        <li>Another crucial insight from the article.</li>
        <li>And a final summary item.</li>
    </ul>
</div>

<blockquote class="im-pull-quote">
    <p>"This is an impactful statement that deserves to be highlighted and pulled out from the main text flow."</p>
    <cite class="im-pull-quote__cite">— Author Name, Source</cite>
</blockquote>

<div class="im-code-block">
    <div class="im-code-block__header">
        <span class="im-code-block__language">JavaScript</span>
        <button class="im-code-block__copy-btn button is-small">
            <span class="icon"><i class="ph ph-copy"></i></span>
            <span>Copy</span>
        </button>
    </div>
    <pre class="im-code-block__pre"><code class="language-javascript">// Your code here
function greet() {
  console.log("Hello, component!");
}</code></pre>
</div>

<div class="im-image-carousel-section section"> <!-- Optional: Apply section grid -->
    <div class="container">
        <h3 class="title is-4 has-text-centered">Image Gallery Showcase</h3>

        <!-- Carousel Visual Representation -->
        <div class="im-image-carousel columns is-multiline is-mobile">
            <!-- Item 1 -->
            <div class="column is-one-third-tablet is-half-mobile">
                <a href="#im-image-modal" class="im-carousel-item" data-modal-trigger data-image-src="https://picsum.photos/1200/800?image=101" data-thumbnail-src="https://picsum.photos/400/300?image=101" aria-label="Open image 1 in modal">
                    <figure class="image is-4by3">
                        <img src="https://picsum.photos/400/300?image=101" alt="Gallery Image 1">
                    </figure>
                    <span class="im-carousel-item__overlay">
                        <span class="icon is-large">
                            <i class="ph ph-eye"></i>
                        </span>
                    </span>
                </a>
            </div>
            <!-- Item 2 -->
            <div class="column is-one-third-tablet is-half-mobile">
                <a href="#im-image-modal" class="im-carousel-item" data-modal-trigger data-image-src="https://picsum.photos/1200/800?image=102" data-thumbnail-src="https://picsum.photos/400/300?image=102" aria-label="Open image 2 in modal">
                    <figure class="image is-4by3">
                        <img src="https://picsum.photos/400/300?image=102" alt="Gallery Image 2">
                    </figure>
                    <span class="im-carousel-item__overlay">
                        <span class="icon is-large">
                            <i class="ph ph-eye"></i>
                        </span>
                    </span>
                </a>
            </div>
            <!-- Item 3 -->
            <div class="column is-one-third-tablet is-half-mobile">
                <a href="#im-image-modal" class="im-carousel-item" data-modal-trigger data-image-src="https://picsum.photos/1200/800?image=103" data-thumbnail-src="https://picsum.photos/400/300?image=103" aria-label="Open image 3 in modal">
                    <figure class="image is-4by3">
                        <img src="https://picsum.photos/400/300?image=103" alt="Gallery Image 3">
                    </figure>
                    <span class="im-carousel-item__overlay">
                        <span class="icon is-large">
                            <i class="ph ph-eye"></i>
                        </span>
                    </span>
                </a>
            </div>
            <!-- Add more items as needed (Item 4, 5, 6 for a full row on desktop) -->
            <div class="column is-one-third-tablet is-half-mobile">
                 <a href="#im-image-modal" class="im-carousel-item" data-modal-trigger data-image-src="https://picsum.photos/1200/800?image=104" data-thumbnail-src="https://picsum.photos/400/300?image=104" aria-label="Open image 4 in modal">
                    <figure class="image is-4by3">
                        <img src="https://picsum.photos/400/300?image=104" alt="Gallery Image 4">
                    </figure>
                    <span class="im-carousel-item__overlay">
                        <span class="icon is-large">
                            <i class="ph ph-eye"></i>
                        </span>
                    </span>
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Modal Structure (Hidden by default with CSS) -->
<!-- For pure CSS :target trick, the ID must be on the modal itself -->
<div class="im-image-modal modal" id="im-image-modal"> <!-- Bulma's .modal class for basic structure -->
    <div class="modal-background" data-modal-close></div> <!-- For closing modal by clicking background -->
    <div class="im-modal-card modal-card"> <!-- Custom modal card for our layout -->
        <header class="im-modal-header modal-card-head">
            <p class="modal-card-title">Image Preview</p>
            <a href="#" class="im-modal-close delete" aria-label="close" data-modal-close></a>
            <!-- Or using Phosphor icon for close -->
            <!-- <a href="#" class="im-modal-close icon is-medium" aria-label="close" data-modal-close>
                <i class="ph ph-x"></i>
            </a> -->
        </header>
        <section class="im-modal-body modal-card-body">
            <div class="im-modal-layout">
                <!-- Left Side: Image Selection Panel (Thumbnails) -->
                <div class="im-modal-sidebar">
                    <h4 class="im-modal-sidebar__title subtitle is-6">Select Image:</h4>
                    <div class="im-modal-thumbnail-list">
                        <a href="#" class="im-modal-thumbnail is-active" data-select-image="https://picsum.photos/1200/800?image=101">
                            <img src="https://picsum.photos/100/75?image=101" alt="Thumbnail 1">
                        </a>
                        <a href="#" class="im-modal-thumbnail" data-select-image="https://picsum.photos/1200/800?image=102">
                            <img src="https://picsum.photos/100/75?image=102" alt="Thumbnail 2">
                        </a>
                        <a href="#" class="im-modal-thumbnail" data-select-image="https://picsum.photos/1200/800?image=103">
                            <img src="https://picsum.photos/100/75?image=103" alt="Thumbnail 3">
                        </a>
                        <a href="#" class="im-modal-thumbnail" data-select-image="https://picsum.photos/1200/800?image=104">
                            <img src="https://picsum.photos/100/75?image=104" alt="Thumbnail 4">
                        </a>
                        <!-- Thumbnails here would ideally be populated by JS based on the gallery -->
                    </div>
                </div>
                <!-- Right Side: Main Image Display -->
                <div class="im-modal-main-image">
                    <figure class="image">
                        <!-- JS would set this src -->
                        <img id="im-modal-displayed-image" src="https://picsum.photos/1200/800?image=101" alt="Selected gallery image">
                    </figure>
                </div>
            </div>
        </section>
        <footer class="modal-card-foot">
            <button class="button is-success">Save changes</button>
            <button class="button" data-modal-close>Cancel</button>
        </footer>
    </div>
</div>