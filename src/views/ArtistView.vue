<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiDownload, mdiPencil, mdiShuffle } from '@mdi/js'

import { useMainStore } from '@/stores/main'
import AlbumCard from '@/components/AlbumCard.vue'

const mainStore = useMainStore()
const route = useRoute()

const artist = computed(() => {
  return mainStore.currentArtist
})
const artistPhotoUrl = computed((): string => {
  return mainStore.currentArtist.thumb ? `https://dark-corner.ru${mainStore.currentArtist.thumb}?X-Plex-Token=3QnmkvTM4reJKYt8Jfuq`: ''
})
const artistBackgroundUrl = computed((): string => {
  return mainStore.currentArtist.art ? `https://dark-corner.ru${mainStore.currentArtist.art}?X-Plex-Token=3QnmkvTM4reJKYt8Jfuq`: ''
})
const artistCountry = computed((): string => {
  return mainStore.currentArtist.Country ? mainStore.currentArtist.Country[0].tag: ''
})

const playArtist = () => {
  mainStore.player.shuffle = 0
  mainStore.playQueues(`/library/metadata/${mainStore.currentArtist.ratingKey}`)
}

const playArtistShuffle = () => {
  mainStore.player.shuffle = 1
  mainStore.playQueues(`/library/metadata/${mainStore.currentArtist.ratingKey}`)
}


onMounted(async () => {
  await mainStore.getArtist(route.params.id as string)
  await mainStore.getArtistAlbums(route.params.id as string)
})
</script>

<template>
  <div
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
            v-for="genre in artist.Genre"
            :key="genre.tag"
            class="p-3 mr-2"
          >
            {{ genre.tag }}
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
          :key="album.ratingKey"
          :album="album"
          :show-artist="false"
          :show-figure="false"
        />
      </div>
    </div>
  </div>
</template>
