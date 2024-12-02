module Jekyll
    class LazyAdsenseTag < Liquid::Tag
      def initialize(tag_name, text, tokens)
        super
        @ad_type = text.strip
      end
  
      def render(context)
        adsense_client = context.registers[:site].config['adsense']['client']
        ad_script = <<-HTML
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=#{adsense_client}" crossorigin="anonymous"></script>
        <script>
          (function() {
            var adTypes = {
              'square': '7663977887',
              'button': '3836856744',
              'top-leaderboard': '3487917390',
              'small-leaderboard': '3487917390',
              'large-leaderboard': '3487917390',
              'skyscraper': '8939839370',
              'skyscraper-small': '3487917390',
              'article': '6501428979',
              'multiplex': '6808134701'
            };
            
            var adSlot = adTypes['#{@ad_type}'];
            if (adSlot) {
              var ins = document.createElement('ins');
              ins.className = 'adsbygoogle';
              ins.style = 'display:block';
              ins.setAttribute('data-ad-client', '#{adsense_client}');
              ins.setAttribute('data-ad-slot', adSlot);
              ins.setAttribute('data-ad-format', 'auto');
              
              var container = document.getElementById('lazy-ad-#{@ad_type}');
              if (container) {
                container.appendChild(ins);
                (adsbygoogle = window.adsbygoogle || []).push({});
              }
            }
          })();
        </script>
        HTML
        ad_script
      end
    end
  end
  
  Liquid::Template.register_tag('lazy_adsense', Jekyll::LazyAdsenseTag)
  