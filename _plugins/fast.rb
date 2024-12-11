require 'nokogiri'

module Jekyll
  class OptimizeHTML < Jekyll::Generator
    priority :lowest

    def generate(site)
      site.posts.docs.each { |post| optimize_html(post) }
      site.pages.each { |page| optimize_html(page) }
    end

    private

    def optimize_html(doc)
      return unless doc.output_ext == ".html"

      # Parse the HTML with Nokogiri
      html = Nokogiri::HTML5(doc.output)

      # Add lazy loading to images and iframes
      html.css('img:not([loading])').each { |img| img['loading'] = 'lazy' }
      html.css('iframe:not([loading])').each { |iframe| iframe['loading'] = 'lazy' }

      # Minify the HTML
      doc.output = minify_html(html.to_html)
    end

    def minify_html(html)
      html.gsub(/\n+/, '')       # Remove newlines
          .gsub(/\s{2,}/, ' ')  # Remove excessive spaces
          .gsub(/>\s+</, '><')  # Remove spaces between tags
    end
  end
end
