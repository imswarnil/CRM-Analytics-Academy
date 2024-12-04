module Jekyll
  class LazyAdsenseTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      @ad_type = text.strip
    end

    def render(context)
      # Default class for lazy-loaded ads
      container_class = 'is-adsense lazy-load'

      # Determine ad code based on the ad type
      ad_html = case @ad_type
                when "square"
                  ad_code("square")
                when "small-square"
                  ad_code("small-square")
                when "medium-square"
                  ad_code("medium-square")
                when "large-square"
                  ad_code("large-square")
                when "leaderboard"
                  ad_code("leaderboard")
                when "small-leaderboard"
                  ad_code("small-leaderboard")
                when "medium-leaderboard"
                  ad_code("medium-leaderboard")
                when "large-leaderboard"
                  ad_code("large-leaderboard")
                when "skyscraper"
                  ad_code("skyscraper")
                when "small-skyscraper"
                  ad_code("small-skyscraper")
                when "medium-skyscraper"
                  ad_code("medium-skyscraper")
                when "large-skyscraper"
                  ad_code("large-skyscraper")
                when "billboard"
                  ad_code("billboard")
                when "small-billboard"
                  ad_code("small-billboard")
                when "medium-billboard"
                  ad_code("medium-billboard")
                when "large-billboard"
                  ad_code("large-billboard")
                when "multiplex"
                  ad_code("multiplex")
                when "infeed"
                  ad_code("infeed")
                when "article"
                  ad_code("article")
                else
                  ad_code("leaderboard")  # Default to leaderboard if none specified
                end

      # HTML for the ad block with lazy load functionality and advertisement text
      "<div class=\"#{container_class}\" data-ad-type=\"#{@ad_type}\" style=\"display:block; margin:0 auto; text-align:center;\">" +
        "<ins class=\"adsbygoogle lazy-load\" data-ad-client=\"ca-pub-1291242080282540\" data-ad-slot=\"#{ad_slot(@ad_type)}\" data-ad-format=\"auto\"></ins>" +
        "<div class=\"ad-label\" style=\"font-size: 14px; color: #888; margin-top: 5px;\">Advertisement</div>" +
      "</div>"
    end

    def ad_code(type)
      case type
      when "square"
        "square"
      when "small-square"
        "small-square"
      when "medium-square"
        "medium-square"
      when "large-square"
        "large-square"
      when "leaderboard"
        "leaderboard"
      when "small-leaderboard"
        "small-leaderboard"
      when "medium-leaderboard"
        "medium-leaderboard"
      when "large-leaderboard"
        "large-leaderboard"
      when "skyscraper"
        "skyscraper"
      when "small-skyscraper"
        "small-skyscraper"
      when "medium-skyscraper"
        "medium-skyscraper"
      when "large-skyscraper"
        "large-skyscraper"
      when "billboard"
        "billboard"
      when "multiplex"
        "multiplex"
      when "infeed"
        "infeed"
      when "article"
        "article"
      else
        "leaderboard" # Default
      end
    end

    def ad_slot(ad_type)
      # Return the correct ad slot based on the ad type
      case ad_type
      when "square"
        "7663977887"
      when "small-square"
        "6066270853"
      when "medium-square"
        "9619442326"
      when "large-square"
        "1684851337"
      when "leaderboard"
        "1864856299"
      when "small-leaderboard"
        "8939839370"
      when "medium-leaderboard"
        "8539588233"
      when "large-leaderboard"
        "8539588233"
      when "skyscraper"
        "4394096538"
      when "small-skyscraper"
        "4394096538"
      when "medium-skyscraper"
        "9488965956"
      when "large-skyscraper"
        "2712169578"
      when "billboard"
        "4921873558"
      when "multiplex"
        "3375031396"
      when "infeed"
        "9130894804"
      when "article"
        "6501428979"
      else
        "1864856299" # Default to leaderboard
      end
    end
  end
end

# Register the tag in Liquid
Liquid::Template.register_tag('lazy_adsense', Jekyll::LazyAdsenseTag)
