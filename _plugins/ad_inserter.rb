module Jekyll
    class AdsenseInArticle < Jekyll::Generator
      safe true
      priority :low
  
      def generate(site)
        # Go through each post
        site.posts.each do |post|
          content = post.content
          paragraphs = content.split(/<\/p>/)  # Split content by paragraph end tag
          ads = []
  
          # Check if there are enough paragraphs
          if paragraphs.length > 3
            paragraphs.each_slice(3).to_a.each_with_index do |slice, i|
              # Every third paragraph, insert ad
              if i > 0
                ad_code = <<-HTML
                  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540"
                       crossorigin="anonymous"></script>
                  <ins class="adsbygoogle"
                       style="display:block; text-align:center;"
                       data-ad-layout="in-article"
                       data-ad-format="fluid"
                       data-ad-client="ca-pub-1291242080282540"
                       data-ad-slot="6501428979"></ins>
                  <script>
                       (adsbygoogle = window.adsbygoogle || []).push({});
                  </script>
                HTML
                # Add ad code after every 3rd paragraph
                slice.push(ad_code)
              end
              ads.push(slice.join('</p>'))
            end
          else
            ads = paragraphs
          end
          post.content = ads.join('</p>') # Rebuild the post content with inserted ads
        end
      end
    end
  end
  