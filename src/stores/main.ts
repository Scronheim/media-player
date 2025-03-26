import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Api from '@/api'
import Player from '@/classes/player'


import type { IAlbum, IArtist, ITrack } from '../../types'

const api = new Api()

const PLAYER_STATUSES = {
  STOP: 'stoped',
  PLAY: 'playing',
  PAUSE: 'pause',
}

export const useMainStore = defineStore('main', () => {
  const recentlyAlbums = ref<IAlbum[]>([])
  const albums = ref<IAlbum[]>([])
  const currentAlbum = ref<IAlbum>({})
  const currentArtist = ref<IArtist>({})
  const currentTrack = ref<ITrack>({})
  const player = ref({
    instance: ref(new Player()),
    status: PLAYER_STATUSES.STOP,
    volume: 100,
    currentTime: 0,
    duration: 0,
    playlistQueue: <ITrack[]> [],
    currentTrackIndex: 0,
    shuffle: false,
  })
  const intervalId = ref(0)
  const playlistFilter = ref('')

  player.value.instance.player.onended = playNext

  const filteredPlaylist = computed(() => {
    return player.value.playlistQueue.filter(track => {
      if (track.title.toLowerCase().indexOf(playlistFilter.value.toLowerCase()) > -1) return track
    })
  })

  async function playQueues(type: string, id: string): Promise<void> {
    player.value.playlistQueue = await api.playQueues(type, id, player.value.shuffle)
    playPlaylist()
  }

  function playPlaylist(): void {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    const firstTrack = player.value.playlistQueue[0]
    currentTrack.value = firstTrack
    player.value.currentTrackIndex = 0
    player.value.instance.loadTrack(firstTrack)
    getTrackCurrentTime()
  }


  async function getSortedItems(filter: {type: string, sort: string}, limit: number = 30) {
    albums.value = await api.getSortedItems(filter, limit)
  }

  async function getRecentlyAlbums() {
    const albums = await api.getRecentlyAlbums()
    recentlyAlbums.value = albums
  }

  async function getAlbumTracks(albumId: string) {
    const tracks = await api.getMetadataChildren(albumId)
    currentAlbum.value.tracks = tracks
  }

  async function getAlbum(albumId: string) {
    const album = await api.getAlbumById(albumId)
    currentAlbum.value = album
  }

  async function getArtistAlbums(artistId: string) {
    const albums = await api.getMetadataChildren(artistId)
    currentArtist.value.albums = albums
  }

  async function getArtist(artistId: string) {
    const artist = await api.getMetadata(artistId)
    currentArtist.value = artist
  }

  async function search(query: string) {
    const result = await api.search(query)
    if (result?.length) {
      return result.filter(res => res.Metadata).map(res => {
        let url = ''
        switch (res.Metadata.type) {
        case 'artist':
          url = `/artist/${res.Metadata.ratingKey}`
          break
        case 'album':
          url = `/album/${res.Metadata.ratingKey}`
          break
        case 'track':
          url = `/album/${res.Metadata.parentRatingKey}`
          break
        }
        return { value: res.Metadata.title, link: url, type: res.Metadata.type  }
      })
    }
    return []
  }

  function changeCurrentTime(seconds: number) {
    player.value.instance.player.currentTime = seconds
  }

  function pause() {
    player.value.status = PLAYER_STATUSES.PAUSE
    player.value.instance.pause()
  }

  function stop() {
    player.value.status = PLAYER_STATUSES.STOP
    player.value.instance.pause()
  }

  function play() {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    player.value.instance.play()
    getTrackCurrentTime()
  }

  function playTrackByIndex(trackIndex: number) {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = player.value.playlistQueue[trackIndex]
    player.value.currentTrackIndex = trackIndex
    player.value.instance.loadTrack(currentTrack.value)
    getTrackCurrentTime()
  }

  function playTrack(track) {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = track
    player.value.currentTrackIndex = 0
    player.value.instance.loadTrack(track)
    player.value.playlistQueue = []
    getTrackCurrentTime()
  }

  function playAlbum(tracks) {
    clearIntervalId()
    clearPlaylist()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = tracks[0]
    player.value.currentTrackIndex = 0
    player.value.instance.loadTrack(tracks[0])
    addToPlaylist(tracks)
    getTrackCurrentTime()
  }

  function playNext() {
    if (player.value.shuffle) {
      const randomIndex = getRandomInt(0, player.value.playlistQueue.length - 1)
      
      if (randomIndex === player.value.currentTrackIndex) playNext()
      else player.value.currentTrackIndex = randomIndex
    }
    else player.value.currentTrackIndex++

    const nextTrack = player.value.playlistQueue[player.value.currentTrackIndex]
    currentTrack.value = nextTrack
    player.value.instance.loadTrack(nextTrack)
    player.value.status = PLAYER_STATUSES.PLAY
  }

  function playPrev() {
    player.value.currentTrackIndex--
    const prevTrack = player.value.playlistQueue[player.value.currentTrackIndex]
    currentTrack.value = prevTrack
    player.value.instance.loadTrack(prevTrack)
    player.value.status = PLAYER_STATUSES.PLAY
  }

  function clearPlaylist() {
    player.value.playlistQueue = []
    stop()
  }

  function addToPlaylist(tracks) {
    player.value.playlistQueue.push(...tracks)
  }

  function setVolume(volume: number) {
    player.value.volume = volume
    player.value.instance.setVolume(volume/100)
  }

  function getTrackCurrentTime() {
    intervalId.value = setInterval(() => {
      player.value.currentTime = player.value.instance.player.currentTime
      player.value.duration = player.value.instance.player.duration
    }, 1000)
  }

  function clearIntervalId() {
    clearInterval(intervalId.value)
  }

  function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  return { 
    recentlyAlbums, currentAlbum, currentArtist, currentTrack, player, playlistFilter, filteredPlaylist, albums,
    playTrack, playAlbum, pause, play, playTrackByIndex, playNext, playPrev, stop, setVolume, getTrackCurrentTime, changeCurrentTime,
    clearPlaylist, addToPlaylist, playQueues,
    getRecentlyAlbums, getAlbumTracks, getAlbum, getArtist, getArtistAlbums, getSortedItems,
    search, 
  }
})
