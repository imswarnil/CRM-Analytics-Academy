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

      # Lazy load images
      item.output = lazy_load_images(item.output)
      
      # Lazy load YouTube videos
      item.output = lazy_load_youtube(item.output)
      
      # Lazy load Ads
      item.output = lazy_load_ads(item.output)
    end

    # Lazy load images by replacing src with data-src
    def lazy_load_images(content)
      content.gsub(/<img([^>]*)src=["']([^"']*)["']([^>]*)>/i) do
        '<img\1data-src="\2"\3 loading="lazy" alt="Lazy Loaded Image">'
      end
    end

    # Lazy load YouTube videos by replacing iframe with a placeholder
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

    # Lazy load AdSense ads by replacing them with placeholders
    def lazy_load_ads(content)
      content.gsub(/<div class="ad-container"([^>]*)data-ad-client=["']([^"']*)["']([^>]*)><\/div>/i) do
        %(
          <div class="ad-placeholder" data-ad-client="#{$2}" data-ad-slot="#{$3}" data-ad-style="#{$4}">
            <p>Loading ad...</p>
          </div>
        )
      end
    end
  end
end
