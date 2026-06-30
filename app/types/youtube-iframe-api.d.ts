interface YTPlayer {
  getCurrentTime: () => number
  pauseVideo: () => void
  playVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  destroy: () => void
}

interface YTPlayerEvent {
  data: number
}

interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: {
        onStateChange?: (event: YTPlayerEvent) => void
      }
    }
  ) => YTPlayer
  PlayerState: { PLAYING: number }
}

interface Window {
  YT?: YTNamespace
  onYouTubeIframeAPIReady?: () => void
}
