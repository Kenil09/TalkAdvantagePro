import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useLibraryStore } from '@/lib/store/library.store'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  FileAudio,
  VolumeX,
  Volume1,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useRef, useState } from 'react'

const MediaPlayer = () => {
  const { audioUrl: localUrl, selectedRecording } = useLibraryStore()
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1')
  const [audioReady, setAudioReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const duration = selectedRecording?.duration || 0
  const audioUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_PUBLIC_URL}/${localUrl}`

  useEffect(() => {
    if (duration > 0 && isFinite(duration) && currentTime > duration) {
      setCurrentTime(duration)
      if (audioRef.current) {
        audioRef.current.currentTime = duration
      }
      setIsPlaying(false)
    }
  }, [currentTime, duration])

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return

    // Reset states
    setCurrentTime(0)
    setAudioReady(false)
    setIsPlaying(false)

    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = audioUrl
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setAudioReady(true)
      }
    }

    const handleTimeUpdate = () => {
      if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)

      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }

    const handleCanPlay = () => {
      setAudioReady(true)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)

    // Set initial volume
    audio.volume = isMuted ? 0 : volume / 100

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [audioUrl, isMuted, volume])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !audioReady) return

    if (isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Error playing audio:', err)
          setIsPlaying(false)
        })
      }
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, audioReady])

  // Handle playback speed changes
  useEffect(() => {
    if (!audioRef.current || !audioReady) return
    audioRef.current.playbackRate = Number.parseFloat(playbackSpeed)
  }, [playbackSpeed, audioReady])

  // Handle volume and mute changes - using ref to avoid unnecessary re-renders
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  const togglePlayback = () => {
    if (!audioReady || !audioRef.current) return

    // If playback has reached the end, reset to start before playing
    if (audioRef.current.ended || audioRef.current.currentTime >= duration) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }

    setIsPlaying((prev) => !prev)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !duration) return

    const [sliderValue] = value
    const newTime = (sliderValue / 100) * duration
    const validTime = Math.min(Math.max(0, newTime), duration)

    try {
      audioRef.current.currentTime = validTime
      setCurrentTime(validTime)

      // Only resume playing if not at end
      if (validTime < duration) {
        if (isPlaying) {
          audioRef.current.play().catch((err) => {
            console.error('Error playing after seek:', err)
            setIsPlaying(false)
          })
        }
      } else {
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error seeking audio:', error)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    // Only update mute state if necessary to prevent unnecessary re-renders
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true)
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipForward = () => {
    if (!audioRef.current || !audioReady || !duration) return

    try {
      const newTime = Math.min(
        Math.max(0, audioRef.current.currentTime + 10),
        duration,
      )
      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
      }
    } catch (error) {
      console.error('Error skipping forward:', error)
    }
  }

  const skipBackward = () => {
    if (!audioRef.current || !audioReady) return

    try {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0)
      if (isFinite(newTime)) {
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
      }
    } catch (error) {
      console.error('Error skipping backward:', error)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileAudio className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {selectedRecording?.filename}
            </h4>
            <p className="text-sm text-gray-500">
              {formatTime(selectedRecording?.duration || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={skipBackward}
          disabled={!audioReady}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlayback}
          disabled={!audioReady}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={skipForward}
          disabled={!audioReady}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={duration > 0 ? [(currentTime / duration) * 100] : [0]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            onValueCommit={handleSeek}
            className="cursor-pointer"
            disabled={!audioReady}
          />
          <span className="text-sm text-gray-500">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
            disabled={!audioReady}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 50 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            onPointerDown={() => setAudioReady(true)} // Ensure audio is ready when interacting
            className="w-20 h-1"
          />
        </div>

        <Select
          value={playbackSpeed}
          onValueChange={setPlaybackSpeed}
          disabled={!audioReady}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue placeholder="Speed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5x</SelectItem>
            <SelectItem value="0.75">0.75x</SelectItem>
            <SelectItem value="1">1x</SelectItem>
            <SelectItem value="1.25">1.25x</SelectItem>
            <SelectItem value="1.5">1.5x</SelectItem>
            <SelectItem value="2">2x</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default MediaPlayer
