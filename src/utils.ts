import router from '@/router'


export const goToAlbumPage = (albumId: string) => {
  router.push(`/album/${albumId}`)
}


export const goToAlbumArtistPage = (artistId: string) => {
  router.push(`/artist/${artistId}`)
}
