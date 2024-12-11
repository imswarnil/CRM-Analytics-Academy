require 'nokogiri'

module Jekyll
  class OptimizeHTML < Jekyll::Generator
    priority :lowest

    def generate(site)
      site.pages.each { |page| process_html(page) if page.output_ext == ".html" }
    end

    private

    def process_html(doc)
      # Parse the HTML
      html = Nokogiri::HTML5(doc.output)

      # Add lazy loading to images
      html.css('img').each { |img| img['loading'] ||= 'lazy' }
      html.css('iframe').each { |iframe| iframe['loading'] ||= 'lazy' }

      # Minify HTML output
      doc.output = html.to_html.gsub(/\n+/, '').gsub(/\s{2,}/, ' ').gsub(/>\s+</, '><')
    end
  end
end
