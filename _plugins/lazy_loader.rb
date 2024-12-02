module Jekyll
  class LazyLoader < Generator
    safe true
    priority :low

    def generate(site)
      site.pages.each { |page| process_content(page) }
      site.posts.docs.each { |post| process_content(post) }
    end

    private

    def process_content(item)
      return unless item.output_ext == ".html" && item.output

      item.output = lazy_load_images(item.output)
      item.output = lazy_load_youtube(item.output)
      item.output = lazy_load_ads(item.output)
    end

    # Lazy load images by replacing src with data-src
    def lazy_load_images(content)
      content.gsub(/<img([^>]*)src=["']([^"']*)["']([^>]*)>/i) do
        '<img\1data-src="\2"\3 class="lazy-image" loading="lazy" alt="Lazy Loaded Image">'
      end
    end

    # Lazy load YouTube iframes with styled placeholders
    def lazy_load_youtube(content)
      content.gsub(/<iframe([^>]*)src=["']https:\/\/www\.youtube\.com\/embed\/([^"']*)["']([^>]*)><\/iframe>/i) do
        %(
          <div class="youtube-placeholder box has-text-centered" data-video-id="#{$2}">
            <figure class="image is-16by9">
              <img class="lazy-image youtube-thumbnail"
                   data-src="https://img.youtube.com/vi/#{$2}/hqdefault.jpg"
                   alt="YouTube Thumbnail">
              <button class="button youtube-play-button is-primary">Play Video</button>
            </figure>
          </div>
        )
      end
    end

    # Lazy load AdSense ads with placeholders
    def lazy_load_ads(content)
      content.gsub(/<ins class="adsbygoogle"([^>]*)><\/ins>/i) do
        %(
          <div class="ad-placeholder box has-text-centered is-flex is-justify-content-center is-align-items-center"
               data-ad-client="ca-pub-1291242080282540"
               data-ad-slot="YOUR_AD_SLOT"
               data-ad-style="display:block">
            <span class="icon is-large">
              <i class="fas fa-ad fa-2x"></i>
            </span>
            <p class="has-text-grey-light">Loading ad...</p>
          </div>
        )
      end
    end
  end
end
