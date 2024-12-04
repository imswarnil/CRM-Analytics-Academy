module Jekyll
  class AdsenseTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @ad_type = text.strip
    end

    def render(context)
      # Define your AdSense client ID (this will be passed from the site's config)
      client_id = context.registers[:site].config['adsense']['data-ad-client']
      
      ad_html = ""
      
      case @ad_type
      when "square"
        ad_html = generate_square_ad(client_id)
      when "button"
        ad_html = generate_button_ad(client_id)
      when "top-leaderboard"
        ad_html = generate_top_leaderboard_ad(client_id)
      when "small-leaderboard"
        ad_html = generate_small_leaderboard_ad(client_id)
      when "large-leaderboard"
        ad_html = generate_large_leaderboard_ad(client_id)
      when "skyscraper"
        ad_html = generate_skyscraper_ad(client_id)
      when "skyscraper-small"
        ad_html = generate_skyscraper_small_ad(client_id)
      when "article"
        ad_html = generate_article_ad(client_id)
      when "multiplex"
        ad_html = generate_multiplex_ad(client_id)
      else
        ad_html = "<p>Invalid ad type: #{@ad_type}</p>"
      end

      ad_html
    end

    private

    def generate_square_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-square">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:250px;"
               data-ad-client="#{client_id}"
               data-ad-slot="7663977887"></ins>
        </div>
      HTML
    end

    def generate_button_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-button">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:60px;"
               data-ad-client="#{client_id}"
               data-ad-slot="3836856744"></ins>
        </div>
      HTML
    end

    def generate_top_leaderboard_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-top-leaderboard">
          <ins class="adsbygoogle"
               style="display:block;width:100%;height:90px;"
               data-ad-client="#{client_id}"
               data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_small_leaderboard_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-small-leaderboard">
          <ins class="adsbygoogle"
               style="display:block;width:100%;height:90px;"
               data-ad-client="#{client_id}"
               data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_large_leaderboard_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-large-leaderboard">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:250px;"
               data-ad-client="#{client_id}"
               data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_skyscraper_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-skyscraper">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:250px;"
               data-ad-client="#{client_id}"
               data-ad-slot="8939839370"></ins>
        </div>
      HTML
    end

    def generate_skyscraper_small_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-small-skyscraper">
          <ins class="adsbygoogle"
               style="display:block;width:200px;height:200px;"
               data-ad-client="#{client_id}"
               data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_article_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-article">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:auto;"
               data-ad-client="#{client_id}"
               data-ad-slot="6501428979"
               data-ad-format="fluid"></ins>
        </div>
      HTML
    end

    def generate_multiplex_ad(client_id)
      <<-HTML
        <div class="ads-container" id="lazy-ad-multiplex">
          <ins class="adsbygoogle"
               style="display:block;width:auto;height:auto;"
               data-ad-client="#{client_id}"
               data-ad-slot="6808134701"></ins>
        </div>
      HTML
    end
  end
end

# Register the tag
Liquid::Template.register_tag('adsense', Jekyll::AdsenseTag)
