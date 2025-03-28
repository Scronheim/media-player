import type { Document } from 'mongoose'

export interface ISearchResult {
  artists: IArtist[]
  albums: IAlbum[]
  tracks: ITrack[]
}

export interface ILabel extends Document {
  title: string
  country?: ICountry
  createdAt?: string
  updatedAt?: string
}

export interface ICountry extends Document {
  title: string
  code: string
  createdAt?: string
  updatedAt?: string
}

export interface IGenre extends Document {
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface AlbumImage {
  path: string
  type: string
  size: number
}

export interface ITrack extends Document {
  filePath: string
  title: string
  coverPath?: string
  trackNumber?: number
  duration: number
  bitrate?: number
  codec?: string
  lyrics?: string
  fileSize: number
  album: IAlbum
}

export interface IAlbum extends Document {
  title: string;
  type: string;
  artists: IArtist[]
  releaseDate?: Date
  genres: IGenre[]
  tracklist: ITrack[]
  totalDuration: number
  images?: AlbumImage[]
}

export interface IArtistMember extends Document {
  fullname: string
  country?: string
  photoUrl?: string
  memberIn: IArtist[]
  birthdate?: string
  deathdate?: string
  instruments?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface IArtstSocial {
  name: string
  url: string
}

export interface IArtist extends Document {
  title: string;
  albums: IAlbum[]
  genres?: IGenre[]
  countries?: ICountry[]
  images?: AlbumImage[]
  location?: string
  formedIn?: number
  yearsActive?: string
  lyricsThemes?: string[]
  label?: ILabel
  members?: IArtistMember[]
  socials?: IArtstSocial[]
  similarArtists?: IArtist[]
  createdAt: Date;
  updatedAt: Date;
}
