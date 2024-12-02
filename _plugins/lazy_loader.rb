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

    # Lazy load images by replacing src with data-src and adding a placeholder
    def lazy_load_images(content)
      content.gsub(/<img([^>]*)src=["']([^"']*)["']([^>]*)>/i) do
        <<~HTML
          <img\1data-src="\2"\3 loading="lazy" class="lazy-image" alt="Lazy Loaded Image">
        HTML
      end
    end

    # Lazy load YouTube iframes by replacing them with a placeholder
    def lazy_load_youtube(content)
      content.gsub(/<iframe([^>]*)src=["']https:\/\/www\.youtube\.com\/embed\/([^"']*)["']([^>]*)><\/iframe>/i) do
        <<~HTML
          <div class="youtube-placeholder" data-video-id="#{$2}">
            <img class="youtube-thumbnail" data-src="https://img.youtube.com/vi/#{$2}/hqdefault.jpg" alt="YouTube Video Thumbnail">
            <button class="youtube-play-button" aria-label="Play Video"></button>
          </div>
        HTML
      end
    end

    # Lazy load AdSense ads by replacing them with a placeholder
    def lazy_load_ads(content)
      content.gsub(/<ins class="adsbygoogle"([^>]*)><\/ins>/i) do
        attributes = Hash[$1.scan(/\s*(\w+)="([^"]*)"/)]
        <<~HTML
          <div class="ad-placeholder" 
               data-ad-client="#{attributes['data-ad-client']}" 
               data-ad-slot="#{attributes['data-ad-slot']}" 
               data-ad-style="#{attributes['style']}" 
               #{attributes['data-ad-format'] ? "data-ad-format=\"#{attributes['data-ad-format']}\"" : ''}
               #{attributes['data-ad-layout'] ? "data-ad-layout=\"#{attributes['data-ad-layout']}\"" : ''}>
          </div>
        HTML
      end
    end
  end
end
