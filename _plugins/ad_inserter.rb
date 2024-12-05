# _plugins/adsense_insert_in_post.rb
module Jekyll
    class AdsenseInsert < Jekyll::Generator
      safe true
      priority :low
  
      def generate(site)
        # Go through each post
        site.posts.each do |post|
          # Get content and split into paragraphs
          paragraphs = post.content.split("\n").select { |line| !line.strip.empty? }
  
          # Insert AdSense code after every 1st and 2nd paragraph
          updated_content = insert_adsense_code(paragraphs)
  
          # Update post content with inserted AdSense code
          post.content = updated_content
        end
      end
  
      private
  
      def insert_adsense_code(paragraphs)
        new_content = []
        paragraphs.each_with_index do |paragraph, index|
          # Add the paragraph to the new content
          new_content << paragraph
  
          # Insert AdSense after every 1st and 2nd paragraph
          if (index + 1) % 2 == 0 # Insert after every 2nd paragraph
            new_content << adsense_code
          end
        end
  
        # Join the new content into a string and return
        new_content.join("\n")
      end
  
      def adsense_code
        <<-HTML
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
      end
    end
  end
  
  # Register the plugin
  Liquid::Template.register_tag('adsense_insert', Jekyll::AdsenseInsert)
  