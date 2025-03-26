import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', component: HomeView },
  {
    path: '/album/:id',
    name: 'Album page',
    component: () => import('@/views/AlbumView.vue'),
    meta: {
      title: 'Информация о альбоме'
    }
  },
  {
    path: '/artist/:id',
    name: 'Artist page',
    component: () => import('@/views/ArtistView.vue'),
    meta: {
      title: 'Информация о группе'
    }
  },
  {
    path: '/music',
    name: 'Music page',
    component: () => import('@/views/MusicView.vue'),
    meta: {
      title: 'Музыка'
    }
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

router.beforeEach(async () => {
  window.scrollTo(0, 0)
})

export default router
