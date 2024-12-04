module Jekyll
  class AdsenseTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @ad_type = text.strip
    end

    def render(context)
      ad_html = ""
      ad_client = context.registers[:site].config['adsense']['data-ad-client'] # Get from config.yml

      case @ad_type
      when "square"
        ad_html = generate_ad("square", "7663977887", ad_client)
      when "small-square"
        ad_html = generate_ad("small-square", "2345678901", ad_client)
      when "medium-square"
        ad_html = generate_ad("medium-square", "3456789012", ad_client)
      when "large-square"
        ad_html = generate_ad("large-square", "4567890123", ad_client)
      when "leaderboard"
        ad_html = generate_ad("leaderboard", "5678901234", ad_client)
      when "small-leaderboard"
        ad_html = generate_ad("small-leaderboard", "6789012345", ad_client)
      when "skyscraper"
        ad_html = generate_ad("skyscraper", "8901234567", ad_client)
      when "small-skyscraper"
        ad_html = generate_ad("small-skyscraper", "9012345678", ad_client)
      when "medium-skyscraper"
        ad_html = generate_ad("medium-skyscraper", "1234567890", ad_client)
      when "large-skyscraper"
        ad_html = generate_ad("large-skyscraper", "2345678901", ad_client)
      when "billboard"
        ad_html = generate_ad("billboard", "3456789012", ad_client)
      when "infeed"
        ad_html = generate_infeed_ad("5678901234", ad_client)
      when "article"
        ad_html = generate_article_ad("6789012345", ad_client)
      else
        ad_html = "<p>Invalid ad type provided</p>"
      end
      ad_html
    end

    private

    def generate_ad(ad_class, slot, ad_client)
      <<-HTML
      <div class="adsense">
        <ins class="adsbygoogle #{ad_class}"
            style="display:block"
            data-ad-client="#{ad_client}"
            data-ad-slot="#{slot}"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
      </div>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
      HTML
    end

    def generate_infeed_ad(slot, ad_client)
      <<-HTML
      <div class="adsense">
        <ins class="adsbygoogle infeed-ad"
            style="display:block;"
            data-ad-format="fluid"
            data-ad-client="#{ad_client}"
            data-ad-slot="#{slot}"></ins>
      </div>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
      HTML
    end

    def generate_article_ad(slot, ad_client)
      <<-HTML
      <div class="adsense">
        <ins class="adsbygoogle article-ad"
            style="display:block; text-align:center;"
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client="#{ad_client}"
            data-ad-slot="#{slot}"></ins>
      </div>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
      HTML
    end
  end
end

Liquid::Template.register_tag('adsense', Jekyll::AdsenseTag)
