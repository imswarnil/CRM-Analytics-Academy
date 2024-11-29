require 'net/http'
require 'json'
require 'uri'

module Jekyll
  class YouTubeVideosTag < Liquid::Tag

    # Channel ID and API key
    CHANNEL_ID = "UCRkqSGyfZkhOzZIHjlgBXcQ" # Replace with your channel ID
    API_KEY = "YOUR_API_KEY" # Replace with your YouTube Data API Key

    # Fetch the latest videos from YouTube
    def fetch_videos
      url = URI.parse("https://www.googleapis.com/youtube/v3/search?key=#{API_KEY}&channelId=#{CHANNEL_ID}&order=date&part=snippet&type=video")
      response = Net::HTTP.get_response(url)
      JSON.parse(response.body)
    end

    # Render the YouTube videos as iframes
    def render_videos(videos)
      html_output = "<div class='columns is-multiline'>"

      videos.each do |video|
        video_id = video["id"]["videoId"]
        title = video["snippet"]["title"]
        description = video["snippet"]["description"]
        thumbnail = video["snippet"]["thumbnails"]["high"]["url"]

        # Embed iframe for each video
        html_output += <<-HTML
          <div class="column is-one-third">
            <div class="card">
              <div class="card-image">
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/#{video_id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
              <div class="card-content">
                <h3 class="title is-5">#{title}</h3>
                <p>#{description[0..150]}...</p> <!-- Display a short description -->
              </div>
            </div>
          </div>
        HTML
      end

      html_output += "</div>"
      html_output
    end

    # Generate the tag output
    def render(context)
      videos_data = fetch_videos

      if videos_data["items"].nil? || videos_data["items"].empty?
        return "No videos found."
      else
        render_videos(videos_data["items"])
      end
    end
  end
end

# Register the tag with Liquid
Liquid::Template.register_tag("youtube_videos", Jekyll::YouTubeVideosTag)
