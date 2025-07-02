require 'nokogiri' # For parsing HTML

module Jekyll
  module AdInserter
    # --- Configuration ---
    PARAGRAPHS_BEFORE_AD = 2
    DUMMY_AD_HTML = <<-HTML
      <div class="dummy-ad-placeholder" style="width: 300px; height: 250px; background: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 20px auto; text-align: center; font-family: sans-serif; color: #777;">
        <p style="margin: 0;">Dummy Ad<br>(300x250)</p>
      </div>
    HTML
    # --- End Configuration ---

    # Define a list of potential CSS selectors for the main content area
    # Order them from most specific/likely to most general if needed.
    CONTENT_CONTAINER_SELECTORS = [
      'article.content div.content.is-medium', # For your blog layout
      'article div.content.is-medium',         # A slightly more general version for blog
      '.article .content .content.is-medium',  # Another variation for blog
      'div.description-content',               # For your video layout
      'main .column > .content.is-medium',     # Potential for project/course if directly in column
      '.project-content-area .content.is-medium', # Add a specific class if needed
      '.course-content-area .content.is-medium',  # Add a specific class if needed
      'article .content',                      # Original fallback
      'article > .content',                    # Another general one
      '.content.is-medium'                     # A more generic one, use with caution
    ]

    def self.insert_ad_into_content(doc_object)
      return unless doc_object.collection&.label == "posts"
      return unless doc_object.output_ext == ".html"

      html_content = doc_object.output
      parsed_doc = Nokogiri::HTML.parse(html_content)
      content_container = nil

      # Try each selector until one is found
      CONTENT_CONTAINER_SELECTORS.each do |selector|
        content_container = parsed_doc.at_css(selector)
        break if content_container # Stop if found
      end

      unless content_container
        Jekyll.logger.warn "AdInserter:", "Could not find a suitable content container using any of the defined selectors in #{doc_object.relative_path}. Ad not inserted. Tried: #{CONTENT_CONTAINER_SELECTORS.join(', ')}"
        return
      end

      # Nokogiri's css 'p' will find all descendant paragraphs.
      # We want direct children paragraphs of the content_container for more predictable insertion.
      # If your paragraphs are nested deeper, you might need to adjust.
      # Using XPath for direct children: ./p
      paragraphs = content_container.xpath('./p') # Get direct child paragraphs

      if paragraphs.length > PARAGRAPHS_BEFORE_AD
        target_paragraph_index = PARAGRAPHS_BEFORE_AD - 1
        # Ensure the target paragraph actually exists (it should if length check passed)
        if paragraphs[target_paragraph_index]
            paragraphs[target_paragraph_index].add_next_sibling(DUMMY_AD_HTML)
            Jekyll.logger.info "AdInserter:", "Inserted dummy ad in #{doc_object.relative_path} (using container: '#{content_container.name}#{content_container['class'] ? '.' + content_container['class'].split.join('.') : ''}')"
        else
            Jekyll.logger.warn "AdInserter:", "Target paragraph index out of bounds in #{doc_object.relative_path}, though paragraph count seemed sufficient. Ad not inserted."
        end
      else
        Jekyll.logger.info "AdInserter:", "Not enough direct child paragraphs (#{paragraphs.length}) in the found content container to insert ad in #{doc_object.relative_path} (requires > #{PARAGRAPHS_BEFORE_AD})."
      end

      doc_object.output = parsed_doc.to_html
    end

    Jekyll::Hooks.register :documents, :post_render do |doc|
      insert_ad_into_content(doc)
    end
  end
end