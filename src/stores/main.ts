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
  const albumTypes = ref<string[]>(['Full-length', 'EP', 'Demo', 'Split', 'Live', 'Single', 'Promo'].sort())
  const currentAlbum = ref<IAlbum>({
    tracklist: [],
    images: [],
  })
  const currentArtist = ref<IArtist>({
    images: [],
  })
  const currentTrack = ref<ITrack>({
    album: {}
  })
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

  const filteredPlaylist = computed((): ITrack[] => {
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


  async function getSortedItems(filter: {type: string, sort: string}, limit: number = 30): Promise<void> {
    albums.value = await api.getSortedItems(filter, limit)
  }

  async function getRecentlyAlbums(): Promise<void> {
    const albums = await api.getRecentlyAlbums()
    recentlyAlbums.value = albums
  }

  async function updateArtist(): Promise<void> {
    const artist = await api.updateArtistById(currentArtist.value)
    currentArtist.value = artist
  }

  async function updateAlbum(): Promise<void> {
    const album = await api.updateAlbumById(currentAlbum.value)
    currentAlbum.value = album
  }

  async function getAlbum(albumId: string): Promise<void> {
    const album = await api.getAlbumById(albumId)
    currentAlbum.value = album
  }

  async function getArtist(artistId: string): Promise<void> {
    const artist = await api.getArtistById(artistId)
    currentArtist.value = artist
  }

  async function searchCountry(countryName: string) {
    return await api.searchCountryByTitle(countryName)
  }

  async function searchGenre(genreName: string) {
    return await api.searchGenreByTitle(genreName)
  }

  async function searchArtist(artistTitle: string) {
    return await api.searchArtistByTitle(artistTitle)
  }

  async function searchAlbum(albumTitle: string): Promise<void> {
    return await api.searchAlbumByTitle(albumTitle)
  }

  async function search(query: string): Promise<{value: string, type: string, link: string}[]> {
    if (query === '') return []
    const result = await api.search(query)
    
    return Object.values(result).flatMap(i => i).flatMap(item => {
      if (item.albums) {
        item.type = 'artist'
        item.link = `/artist/${item._id}`
      } else if (item.artists) {
        item.type = 'album'
        item.link = `/album/${item._id}`
      } else if (item.track) {
        item.title = item.track.title
        item.type = 'track'
        item.link = `/album/${item.album._id}`
      }
      return { value: item.title, type: item.type, link: item.link }
    })
  }

  function changeCurrentTime(seconds: number): void {
    player.value.instance.player.currentTime = seconds
  }

  function pause(): void {
    player.value.status = PLAYER_STATUSES.PAUSE
    player.value.instance.pause()
  }

  function stop(): void {
    player.value.status = PLAYER_STATUSES.STOP
    player.value.instance.pause()
  }

  function play(): void {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    player.value.instance.play()
    getTrackCurrentTime()
  }

  function playTrackByIndex(trackIndex: number): void {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = player.value.playlistQueue[trackIndex]
    player.value.currentTrackIndex = trackIndex
    player.value.instance.loadTrack(currentTrack.value)
    getTrackCurrentTime()
  }

  function playTrack(track: ITrack): void {
    clearIntervalId()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = track
    player.value.currentTrackIndex = 0
    player.value.instance.loadTrack(track)
    player.value.playlistQueue = []
    getTrackCurrentTime()
  }

  function playAlbum(tracks: ITrack[]): void {
    clearIntervalId()
    clearPlaylist()
    player.value.status = PLAYER_STATUSES.PLAY
    currentTrack.value = tracks[0]
    player.value.currentTrackIndex = 0
    player.value.instance.loadTrack(tracks[0])
    addToPlaylist(tracks)
    getTrackCurrentTime()
  }

  function playNext(): void {
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

  function playPrev(): void {
    player.value.currentTrackIndex--
    const prevTrack = player.value.playlistQueue[player.value.currentTrackIndex]
    currentTrack.value = prevTrack
    player.value.instance.loadTrack(prevTrack)
    player.value.status = PLAYER_STATUSES.PLAY
  }

  function clearPlaylist(): void {
    player.value.playlistQueue = []
    stop()
  }

  function addToPlaylist(tracks: ITrack[]): void {
    player.value.playlistQueue.push(...tracks)
  }

  function setVolume(volume: number): void {
    player.value.volume = volume
    player.value.instance.setVolume(volume/100)
  }

  function getTrackCurrentTime(): void  {
    intervalId.value = setInterval(() => {
      player.value.currentTime = player.value.instance.player.currentTime
      player.value.duration = player.value.instance.player.duration
    }, 1000)
  }

  function clearIntervalId(): void  {
    clearInterval(intervalId.value)
  }

  function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  return { 
    recentlyAlbums, currentAlbum, currentArtist, currentTrack, player, playlistFilter, filteredPlaylist, albums, albumTypes,
    playTrack, playAlbum, pause, play, playTrackByIndex, playNext, playPrev, stop, setVolume, getTrackCurrentTime, changeCurrentTime,
    clearPlaylist, addToPlaylist, playQueues,
    getRecentlyAlbums, getAlbum, getArtist, getSortedItems, searchArtist, searchAlbum, searchGenre, searchCountry,
    updateAlbum, updateArtist,
    search, 
  }
})
