module Jekyll
    class InsertAdsenseAfterParagraphs < Jekyll::Generator
      safe true
  
      def generate(site)
        # Loop through each post in the _posts collection
        site.posts.docs.each do |post|
          # Modify the content of the post
          post.content = insert_adsense(post.content)
        end
      end
  
      # Function to insert AdSense code after every 3 paragraphs
      def insert_adsense(content)
        paragraphs = content.split(/<\/p>/)  # Split the content by paragraph tags
        new_content = []
  
        paragraphs.each_with_index do |paragraph, index|
          # Add the paragraph content back, ensuring closing </p> is there
          new_content << "#{paragraph}</p>"
  
          # After every 3 paragraphs, insert the AdSense ad
          if (index + 1) % 3 == 0
            new_content << adsense_code
          end
        end
  
        # Join the content back together and return
        new_content.join
      end
  
      # AdSense ad HTML code to insert
      def adsense_code
        <<-HTML
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1291242080282540" crossorigin="anonymous"></script>
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
  