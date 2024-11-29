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
      max_results = 6 # Number of videos to fetch
      url = URI.parse("https://www.googleapis.com/youtube/v3/search?key=#{api_key}&channelId=#{@channel_id}&order=date&part=snippet&type=video&maxResults=#{max_results}")

      # Make the HTTP request to fetch the latest videos from the YouTube channel
      response = Net::HTTP.get_response(url)

      # If the request is successful
      if response.code == "200"
        videos = JSON.parse(response.body)["items"]

        # Generate HTML for the videos with iframe embeds and additional details
        video_html = "<div class='columns is-multiline'>"
        videos.each do |video|
          video_id = video["id"]["videoId"]
          video_title = video["snippet"]["title"]
          video_description = video["snippet"]["description"]
          video_thumbnail_url = video["snippet"]["thumbnails"]["high"]["url"]

          video_html += <<-HTML
            <div class="column is-12-mobile is-6-tablet is-4-desktop">
              <div class="card">
                <div class="card-image">
                  <figure class="image is-16by9">
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/#{video_id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                  </figure>
                </div>
                <div class="card-content">
                  <p class="title is-5">#{video_title}</p>
                  <p class="subtitle is-6">#{video_description[0..120]}...</p> <!-- Preview of description -->
                  <a href="https://www.youtube.com/watch?v=#{video_id}" class="button is-link is-light is-small" target="_blank">Watch on YouTube</a>
                </div>
              </div>
            </div>
          HTML
        end
        video_html += "</div>" # Close columns div
      else
        # Print error message and response body for debugging
        error_message = "Error fetching YouTube videos. HTTP Status: #{response.code}. Response Body: #{response.body}"
        video_html = "<p>#{error_message}</p>"
      end

      # Return the generated HTML
      video_html
    end
  end
end

# Register the tag in Jekyll
Liquid::Template.register_tag('youtube_videos', Jekyll::FetchYouTubeVideos)
