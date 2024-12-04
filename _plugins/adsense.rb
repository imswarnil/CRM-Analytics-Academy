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
      when "medium-skyscraper"
        ad_html = generate_medium_skyscraper_ad(client_id)
      when "large-skyscraper"
        ad_html = generate_large_skyscraper_ad(client_id)
      when "article"
        ad_html = generate_article_ad(client_id)
      when "multiplex"
        ad_html = generate_multiplex_ad(client_id)
      when "infeed"
        ad_html = generate_infeed_ad(client_id)
      else
        ad_html = "<p>Invalid ad type: #{@ad_type}</p>"
      end
      

      ad_html
    end

    private

    def generate_square_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-square">
          <ins class="adsbygoogle square"
               data-ad-client="#{client_id}"
               data-ad-slot="7663977887"></ins>
        </div>
      HTML
    end
    
    def generate_small_square_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-small-square">
          <ins class="adsbygoogle small-square"
               data-ad-client="#{client_id}"
               data-ad-slot="6066270853"></ins>
        </div>
      HTML
    end
    
    def generate_medium_square_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-medium-square">
          <ins class="adsbygoogle medium-square"
               data-ad-client="#{client_id}"
               data-ad-slot="9619442326"></ins>
        </div>
      HTML
    end
    
    def generate_large_square_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-large-square">
          <ins class="adsbygoogle large-square"
               data-ad-client="#{client_id}"
               data-ad-slot="1684851337"></ins>
        </div>
      HTML
    end
    
    def generate_small_leaderboard_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-small-leaderboard">
          <ins class="adsbygoogle small-leaderboard"
               data-ad-client="#{client_id}"
               data-ad-slot="8939839370"></ins>
        </div>
      HTML
    end
    
    def generate_large_leaderboard_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-large-leaderboard">
          <ins class="adsbygoogle large-leaderboard"
               data-ad-client="#{client_id}"
               data-ad-slot="8539588233"></ins>
        </div>
      HTML
    end
    
    def generate_skyscraper_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-skyscraper">
          <ins class="adsbygoogle skyscraper"
               data-ad-client="#{client_id}"
               data-ad-slot="4394096538"></ins>
        </div>
      HTML
    end
    
    def generate_skyscraper_small_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-skyscraper-small">
          <ins class="adsbygoogle small-skyscraper"
               data-ad-client="#{client_id}"
               data-ad-slot="9488965956"></ins>
        </div>
      HTML
    end
    
    def generate_large_skyscraper_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-large-skyscraper">
          <ins class="adsbygoogle large-skyscraper"
               data-ad-client="#{client_id}"
               data-ad-slot="2712169578"></ins>
        </div>
      HTML
    end
    
    def generate_article_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-article">
          <ins class="adsbygoogle article-ad"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="#{client_id}"
               data-ad-slot="6501428979"></ins>
        </div>
      HTML
    end
    
    def generate_multiplex_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-multiplex">
          <ins class="adsbygoogle multiplex-ad"
               data-ad-client="#{client_id}"
               data-ad-slot="3375031396"></ins>
        </div>
      HTML
    end
    
    def generate_infeed_ad(client_id)
      <<-HTML
        <div class="ads-container is-adsense" id="lazy-ad-infeed">
          <ins class="adsbygoogle infeed-ad"
               data-ad-format="fluid"
               data-ad-layout-key="-6v+f0-19-44+c6"
               data-ad-client="#{client_id}"
               data-ad-slot="9130894804"></ins>
        </div>
      HTML
    end    
  end
end

# Register the tag
Liquid::Template.register_tag('adsense', Jekyll::AdsenseTag)