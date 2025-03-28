<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiPencil, mdiShuffle } from '@mdi/js'

import { useMainStore } from '@/stores/main'

import AlbumCard from '@/components/AlbumCard.vue'

import { API_URL } from '@/api'

const mainStore = useMainStore()
const route = useRoute()

const artist = computed(() => {
  return mainStore.currentArtist
})
const artistPhotoUrl = computed((): string => {
  if (mainStore.currentArtist.images && mainStore.currentArtist.images[0]) {
    return new URL(`${API_URL}/download/image?path${mainStore.currentArtist.images[0]}`).href
  }
  return ''
})
const artistBackgroundUrl = computed((): string => {
  if (mainStore.currentArtist.images && mainStore.currentArtist.images[1]) {
    return new URL(`${API_URL}/download/image?path=${mainStore.currentArtist.images[1]}`).href
  }
  return ''
})
const artistCountry = computed((): string => {
  return mainStore.currentArtist.countries && mainStore.currentArtist.countries[0] ? mainStore.currentArtist.countries[0].title: ''
})

const playArtist = () => {
  mainStore.player.shuffle = false
  mainStore.playQueues('artist',mainStore.currentArtist._id)
}

const playArtistShuffle = () => {
  mainStore.player.shuffle = true
  mainStore.playQueues('artist', mainStore.currentArtist._id)
}


onMounted(async () => {
  await mainStore.getArtist(route.params.id as string)
})
</script>

<template>
  <div
    v-if="artistBackgroundUrl"
    :style="{backgroundImage: `url(${artistBackgroundUrl})`}"
    class="absolute bg-cover w-full h-full bg-center bg-no-repeat -z-10 opacity-5"
  />
  <div class="p-5">
    <div class="flex gap-5">
      <el-image
        :src="artistPhotoUrl"
        class="poster-card"
        style="width: 300px;"
      />
      <div class="flex flex-col items-start">
        <p class="text-[40px] font-bold">
          {{ artist.title }}
        </p>
        <p class="text-[20px]">
          {{ artistCountry }}
        </p>
        <div class="mt-5">
          <el-tag
            v-for="genre in artist.genres"
            :key="genre.name"
            class="p-3 mr-2"
          >
            {{ genre.name }}
          </el-tag>
        </div>
        <el-rate class="mt-3" v-model.number="artist.rating" />
        <div class="mt-3">
          <el-button color="orange" @click="playArtist">
            <SvgIcon
              type="mdi"
              :path="mdiPlay"
              size="20"
            />
            Воспроизвести
          </el-button>
          <el-tooltip content="В случайном порядке">
            <el-button type="info" @click="playArtistShuffle">
              <SvgIcon
                type="mdi"
                :path="mdiShuffle"
                size="20"
              />
            </el-button>
          </el-tooltip>
          <el-tooltip content="Редактировать">
            <el-button type="primary">
              <SvgIcon
                type="mdi"
                :path="mdiPencil"
                size="20"
              />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <el-divider />
    <div class="flex flex-col">
      <p>{{ artist.albums?.length }} альбомов</p>
      <div class="grid grid-cols-6">
        <AlbumCard
          v-for="album in artist.albums"
          :key="album._id"
          :album="album"
          :show-artist="false"
          :show-figure="false"
        />
      </div>
    </div>
  </div>
</template>
