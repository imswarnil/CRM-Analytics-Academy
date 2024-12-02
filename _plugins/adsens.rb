module Jekyll
    class AdsenseTag < Liquid::Tag
      def initialize(tag_name, text, tokens)
        super
        @ad_type = text.strip
      end
  
      def render(context)
        ad_html = ""
        
        # Get the Adsense client ID from the site config
        client_id = context.registers[:site].config['adsense']['data-ad-client']
        
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
          <style>
            .square { width: auto; height: 250px; }
            @media (max-width: 799px) { .square { width: 300px; height: 250px; } }
            @media (max-width: 499px) { .square { width: 250px; height: 250px; } }
          </style>
          <div class="ads-container" id="lazy-ad-square">
            <ins class="adsbygoogle square"
                data-ad-client="#{client_id}"
                data-ad-slot="7663977887"></ins>
          </div>
        HTML
      end
  
      def generate_button_ad(client_id)
        <<-HTML
          <style>
            .button { width: auto; height: 60px; }
          </style>
          <div class="ads-container" id="lazy-ad-button">
            <ins class="adsbygoogle button"
                data-ad-client="#{client_id}"
                data-ad-slot="3836856744"></ins>
          </div>
        HTML
      end
  
      def generate_top_leaderboard_ad(client_id)
        <<-HTML
          <style>
            .top-leaderboard { height: 90px; width: 100%; }
            @media (max-width: 499px) { .top-leaderboard { height: 60px; } }
          </style>
          <div class="ads-container" id="lazy-ad-top-leaderboard">
            <ins class="adsbygoogle top-leaderboard"
                data-ad-client="#{client_id}"
                data-ad-slot="3487917390"></ins>
          </div>
        HTML
      end
  
      def generate_small_leaderboard_ad(client_id)
        <<-HTML
          <style>
            .small-leaderboard { width: 100%; height: 90px; }
            @media (max-width: 500px) { .small-leaderboard { height: 90px; } }
            @media (max-width: 800px) { .small-leaderboard { height: 50px; } }
          </style>
          <div class="ads-container" id="lazy-ad-small-leaderboard">
            <ins class="adsbygoogle small-leaderboard"
                data-ad-client="#{client_id}"
                data-ad-slot="3487917390"></ins>
          </div>
        HTML
      end
  
      def generate_large_leaderboard_ad(client_id)
        <<-HTML
          <style>
            .large-leaderboard { width: auto; height: 250px; }
            @media (max-width: 500px) { .large-leaderboard { height: 250px; } }
            @media (max-width: 800px) { .large-leaderboard { width: 300px; height: 100px; } }
          </style>
          <div class="ads-container" id="lazy-ad-large-leaderboard">
            <ins class="adsbygoogle large-leaderboard"
                data-ad-client="#{client_id}"
                data-ad-slot="3487917390"></ins>
          </div>
        HTML
      end
  
      def generate_skyscraper_ad(client_id)
        <<-HTML
          <style>
            .skyscraper { width: 250px; height: 250px; }
            @media (min-width: 500px) { .skyscraper { width: 320px; height: 480px; } }
            @media (min-width: 800px) { .skyscraper { width: 300px; height: 900px; } }
            @media (min-width: 1200px) { .skyscraper { width: 300px; height: 1050px; } }
          </style>
          <div class="ads-container" id="lazy-ad-skyscraper">
            <ins class="adsbygoogle skyscraper"
                data-ad-client="#{client_id}"
                data-ad-slot="8939839370"></ins>
          </div>
        HTML
      end
  
      def generate_skyscraper_small_ad(client_id)
        <<-HTML
          <style>
            .small-skyscraper { width: 200px; height: 200px; }
            @media (min-width: 500px) { .small-skyscraper { width: 320px; height: 480px; } }
            @media (min-width: 800px) { .small-skyscraper { width: 300px; height: 600px; } }
            @media (min-width: 1200px) { .small-skyscraper { width: 300px; height: 700px; } }
          </style>
          <div class="ads-container" id="lazy-ad-small-skyscraper">
            <ins class="adsbygoogle small-skyscraper"
                data-ad-client="#{client_id}"
                data-ad-slot="3487917390"></ins>
          </div>
        HTML
      end
  
      def generate_article_ad(client_id)
        <<-HTML
          <style>
            .article { border-radius: 10px; background-color: #f7f7f7; }
          </style>
          <div class="ads-container" id="lazy-ad-article">
            <ins class="adsbygoogle article"
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="#{client_id}"
                data-ad-slot="6501428979"></ins>
          </div>
        HTML
      end
  
      def generate_multiplex_ad(client_id)
        <<-HTML
          <div class="ads-container" id="lazy-ad-multiplex">
            <ins class="adsbygoogle"
                style="display:block"
                data-ad-format="autorelaxed"
                data-ad-client="#{client_id}"
                data-ad-slot="6808134701"></ins>
          </div>
        HTML
      end
    end
  end
  
  # Register the tag
  Liquid::Template.register_tag('adsense', Jekyll::AdsenseTag)
  