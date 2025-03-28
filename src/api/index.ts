import axios, { type Axios } from 'axios'

import type { IAlbum, IArtist, ISearchResult, ITrack } from '../../types'

const API_URL = 'https://dark-corner.ru/api'
const token = '3QnmkvTM4reJKYt8Jfuq'
const clientId = '7bvmmjmwcbbnvmswi1aaaa1o'

class Api {
  api: Axios
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      method: 'GET',
    })
  }

  playQueues = async (type: string, id: string, shuffle: boolean = false): Promise<ITrack[]> => {
    return (await this.api.get(`/library/playerQueue?type=${type}&id=${id}&suffle=${shuffle}`)).data.data
  }

  getRecentlyAlbums = async (limit: number = 15): Promise<IAlbum[]> => {
    return (await this.api.get(`/album/recent?limit=${limit}`)).data.data
  }

  getSortedItems = async (filter: {type: string, sort: string}, limit: number) => {
    const { data } = await this.api.get(`/library/sections/1/all?type=${filter.type}&sort=${filter.sort}&limit=${limit}`)
    return data.MediaContainer.Metadata
  }

  searchAlbumByTitle = async (title: string) => {
    return (await this.api.get(`/album/?title=${title}`)).data.data
  }

  updateAlbumById = async (album: IAlbum) => {
    return (await this.api.patch(`/album/${album._id}`, album)).data.data
  }

  getAlbumById = async (id: string) => {
    return (await this.api.get(`/album/${id}`)).data.data
  }

  updateArtistById = async (artist: IArtist) => {
    return (await this.api.patch(`/artist/${artist._id}`, artist)).data.data
  }

  getArtistById = async (id: string) => {
    return (await this.api.get(`/artist/${id}`)).data.data
  }

  searchArtistByTitle = async (title: string) => {
    return (await this.api.get(`/artist/?title=${title}`)).data.data
  }

  searchGenreByTitle = async (genreName: string) => {
    return (await this.api.get(`/genre/?name=${genreName}`)).data.data
  }

  searchCountryByTitle = async (title: string) => {
    return (await this.api.get(`/country/?title=${title}`)).data.data
  }

  search = async (query: string): Promise<ISearchResult> => {
    return (await this.api.get(`/library/search?q=${query}`)).data.data
  }
}

export default Api
export { API_URL }
