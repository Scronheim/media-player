import axios, { type Axios } from 'axios'

import type { IAlbum, ITrack } from '../../types'

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

  getRecentlyAlbums = async (limit: number = 10): Promise<IAlbum[]> => {
    return (await this.api.get(`/album/recent?limit=${limit}`)).data.data
  }

  getSortedItems = async (filter: {type: string, sort: string}, limit: number) => {
    const { data } = await this.api.get(`/library/sections/1/all?type=${filter.type}&sort=${filter.sort}&limit=${limit}`)
    return data.MediaContainer.Metadata
  }

  getAlbumById = async (id: string) => {
    return (await this.api.get(`/album/${id}`)).data.data
  }

  getArtistById = async (id: string) => {
    return (await this.api.get(`/artist/${id}`)).data.data
  }

  getMetadataChildren = async (id: string) => {
    const { data } = await this.api.get(`/library/metadata/${id}/children`)
    return data.MediaContainer.Metadata
  }

  search = async (query: string) => {
    const { data } = await this.api.get(`/library/search?query=${query}&searchTypes=music&includeCollections=1&includeExternalMedia=1&limit=50`)
    return data.MediaContainer.SearchResult
  }
}

export default Api
