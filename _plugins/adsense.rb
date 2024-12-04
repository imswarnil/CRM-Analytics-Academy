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
      when "small-square"
        ad_html = generate_small_square_ad(client_id)
      when "medium-square"
        ad_html = generate_medium_square_ad(client_id)
      when "large-square"
        ad_html = generate_large_square_ad(client_id)
      when "button"
        ad_html = generate_button_ad(client_id)
      when "top-leaderboard"
        ad_html = generate_top_leaderboard_ad(client_id)
      when "small-leaderboard"
        ad_html = generate_small_leaderboard_ad(client_id)
      when "medium-leaderboard"
        ad_html = generate_medium_leaderboard_ad(client_id)
      when "large-leaderboard"
        ad_html = generate_large_leaderboard_ad(client_id)
      when "skyscraper"
        ad_html = generate_skyscraper_ad(client_id)
      when "small-skyscraper"
        ad_html = generate_small_skyscraper_ad(client_id)
      when "medium-skyscraper"
        ad_html = generate_medium_skyscraper_ad(client_id)
      when "large-skyscraper"
        ad_html = generate_large_skyscraper_ad(client_id)
      when "billboard"
        ad_html = generate_billboard_ad(client_id)
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
        <div class="is-adsense" id="lazy-ad-square">
          <ins class="adsbygoogle square" data-ad-client="#{client_id}" data-ad-slot="7663977887"></ins>
        </div>
      HTML
    end

    def generate_small_square_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-small-square">
          <ins class="adsbygoogle small-square" data-ad-client="#{client_id}" data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_medium_square_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-medium-square">
          <ins class="adsbygoogle medium-square" data-ad-client="#{client_id}" data-ad-slot="1234567890"></ins>
        </div>
      HTML
    end

    def generate_large_square_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-large-square">
          <ins class="adsbygoogle large-square" data-ad-client="#{client_id}" data-ad-slot="9876543210"></ins>
        </div>
      HTML
    end

    def generate_button_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-button">
          <ins class="adsbygoogle button" data-ad-client="#{client_id}" data-ad-slot="3836856744"></ins>
        </div>
      HTML
    end

    def generate_top_leaderboard_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-top-leaderboard">
          <ins class="adsbygoogle top-leaderboard" data-ad-client="#{client_id}" data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_small_leaderboard_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-small-leaderboard">
          <ins class="adsbygoogle small-leaderboard" data-ad-client="#{client_id}" data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_medium_leaderboard_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-medium-leaderboard">
          <ins class="adsbygoogle medium-leaderboard" data-ad-client="#{client_id}" data-ad-slot="5678901234"></ins>
        </div>
      HTML
    end

    def generate_large_leaderboard_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-large-leaderboard">
          <ins class="adsbygoogle large-leaderboard" data-ad-client="#{client_id}" data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_skyscraper_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-skyscraper">
          <ins class="adsbygoogle skyscraper" data-ad-client="#{client_id}" data-ad-slot="8939839370"></ins>
        </div>
      HTML
    end

    def generate_small_skyscraper_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-small-skyscraper">
          <ins class="adsbygoogle small-skyscraper" data-ad-client="#{client_id}" data-ad-slot="3487917390"></ins>
        </div>
      HTML
    end

    def generate_medium_skyscraper_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-medium-skyscraper">
          <ins class="adsbygoogle medium-skyscraper" data-ad-client="#{client_id}" data-ad-slot="4321098765"></ins>
        </div>
      HTML
    end

    def generate_large_skyscraper_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-large-skyscraper">
          <ins class="adsbygoogle large-skyscraper" data-ad-client="#{client_id}" data-ad-slot="7654321098"></ins>
        </div>
      HTML
    end

    def generate_billboard_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-billboard">
          <ins class="adsbygoogle billboard" data-ad-client="#{client_id}" data-ad-slot="1234567890"></ins>
        </div>
      HTML
    end

    def generate_article_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-article">
          <ins class="adsbygoogle article" data-ad-client="#{client_id}" data-ad-slot="6501428979" data-ad-format="fluid"></ins>
        </div>
      HTML
    end

    def generate_multiplex_ad(client_id)
      <<-HTML
        <div class="is-adsense" id="lazy-ad-multiplex">
          <ins class="adsbygoogle multiplex" data-ad-client="#{client_id}" data-ad-slot="6808134701"></ins>
        </div>
      HTML
    end
  end
end

# Register the tag
Liquid::Template.register_tag('adsense', Jekyll::AdsenseTag)
