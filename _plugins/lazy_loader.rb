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
        '<img\1data-src="\2"\3 loading="lazy" alt="Lazy Loaded Image">'
      end
    end

    # Lazy load YouTube iframes by replacing them with a placeholder
    def lazy_load_youtube(content)
      content.gsub(/<iframe([^>]*)src=["']https:\/\/www\.youtube\.com\/embed\/([^"']*)["']([^>]*)><\/iframe>/i) do
        %(
          <div class="youtube-placeholder" data-video-id="#{$2}">
            <img class="youtube-thumbnail" data-src="https://img.youtube.com/vi/#{$2}/hqdefault.jpg" alt="YouTube Video Thumbnail">
            <button class="youtube-play-button" aria-label="Play Video"></button>
          </div>
        )
      end
    end

    # Lazy load AdSense ads by replacing them with a placeholder
    def lazy_load_ads(content)
      content.gsub(/<ins class="adsbygoogle"([^>]*)><\/ins>/i) do
        %(
          <div class="ad-placeholder" data-ad-client="ca-pub-YOUR_AD_CLIENT" data-ad-slot="YOUR_AD_SLOT"></div>
        )
      end
    end
  end
end
