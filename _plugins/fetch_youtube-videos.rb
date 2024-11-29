# _plugins/fetch_youtube_videos.rb

require 'net/http'
require 'json'
require 'uri'

module Jekyll
  class FetchYouTubeVideos < Liquid::Tag
    def initialize(tag_name, channel_id, tokens)
      super
      @channel_id = channel_id.strip
    end

    def render(context)
      api_key = "AIzaSyASozTq9N_0v8qyJHTyUx7MhPtkMS9eD48"  # Replace with your API key
      max_results = 5 # Number of videos to fetch
      url = URI.parse("https://www.googleapis.com/youtube/v3/search?key=#{api_key}&channelId=#{@channel_id}&order=date&part=snippet&type=video&maxResults=#{max_results}")

      # Make the HTTP request to fetch the latest videos from the YouTube channel
      response = Net::HTTP.get_response(url)

      # If the request is successful
      if response.code == "200"
        videos = JSON.parse(response.body)["items"]

        # Generate HTML for the videos
        video_html = "<ul class='youtube-videos'>"
        videos.each do |video|
          video_html += <<-HTML
            <li>
              <a href="https://www.youtube.com/watch?v=#{video["id"]["videoId"]}" target="_blank">
                <img src="#{video["snippet"]["thumbnails"]["high"]["url"]}" alt="#{video["snippet"]["title"]}">
                <p>#{video["snippet"]["title"]}</p>
              </a>
            </li>
          HTML
        end
        video_html += "</ul>"
      else
        # If the API call failed
        video_html = "<p>Error fetching YouTube videos. Please check the API key or channel ID.</p>"
      end

      # Return the generated HTML
      video_html
    end
  end
end

# Register the tag in Jekyll
Liquid::Template.register_tag('youtube_videos', Jekyll::FetchYouTubeVideos)
