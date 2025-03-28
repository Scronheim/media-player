import type { ITrack } from '../../types'

const DOWNLOAD_FILE_URL = 'https://dark-corner.ru/api/download/file?path='

class Player {
  player: HTMLAudioElement
  constructor() {
    this.player = new Audio()
    this.#setWatchers()
  }

  loadTrack = (track: ITrack) => {
    this.player.src = `${DOWNLOAD_FILE_URL}${track.filePath}`
  }

  play = () => {
    this.player.play()
  }

  pause = () => {
    this.player.pause()
  }

  setVolume = (volume: number) => {
    this.player.volume = volume
  }

  #setWatchers = () => {
    this.player.onloadeddata = this.play
    // this.player.onended = this.playNext
  }
}

export default Player
