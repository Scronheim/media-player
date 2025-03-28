<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiPencil, mdiShuffle } from '@mdi/js'
import { Plus } from '@element-plus/icons-vue'

import { useMainStore } from '@/stores/main'

import AlbumCard from '@/components/AlbumCard.vue'
import CoverArt from '@/components/blocks/CoverArt.vue'

import { API_URL } from '@/api'

import type { ICountry, IGenre } from '../../types'

const mainStore = useMainStore()
const route = useRoute()

const editDialog = ref<boolean>(false)
const foundedGenres = ref<IGenre[]>([])
const foundedCountry = ref<ICountry[]>([])

const artist = computed(() => {
  return mainStore.currentArtist
})
const artistPhotoUrl = computed((): string => {
  if (mainStore.currentArtist.images[0]) return `${API_URL}/image/${mainStore.currentArtist.images[0].path}`
  return ''
})
const artistBackgroundUrl = computed((): string => {
  if (mainStore.currentArtist.images[1]) return `${API_URL}/image/${mainStore.currentArtist.images[1].path}`
  return ''
})
const artistCountry = computed((): string => {
  return mainStore.currentArtist.countries && mainStore.currentArtist.countries[0] ? mainStore.currentArtist.countries[0].title: ''
})

const imageAddDisabled = computed((): boolean => {
  return artist.value.images.length === 2
})

const playArtist = () => {
  mainStore.player.shuffle = false
  mainStore.playQueues('artist',mainStore.currentArtist._id)
}

const playArtistShuffle = () => {
  mainStore.player.shuffle = true
  mainStore.playQueues('artist', mainStore.currentArtist._id)
}

const searchGenre = async (queryString: string) => {
  foundedGenres.value = await mainStore.searchGenre(queryString)
}
const searchCountry = async (queryString: string) => {
  foundedCountry.value = await mainStore.searchCountry(queryString)
}

const addImage = () => {
  if (!imageAddDisabled.value) artist.value.images.push({ path: '', type: 'jpg', size: 0 })
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
            <el-button type="primary" @click="editDialog = true">
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

  <el-dialog v-model="editDialog">
    <el-descriptions
      :title="artist.title"
      direction="vertical"
      :column="3"
      size="small"
      border
    >
      <template #extra>
        <el-button type="success" @click="mainStore.updateArtist">
          Сохранить
        </el-button>
      </template>
      <el-descriptions-item>
        <template #label>
          Жанры
        </template>
        <el-select
          multiple
          filterable
          remote
          reserve-keyword
          value-key="_id"
          placeholder="Введите название жанра"
          :remote-method="searchGenre"
          v-model="artist.genres"
        >
          <el-option
            v-for="genre in foundedGenres"
            :key="genre._id"
            :label="genre.name"
            :value="genre"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Группа
        </template>
        <el-input v-model="artist.title" />
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Страна
        </template>
        <el-select
          multiple
          filterable
          remote
          reserve-keyword
          value-key="_id"
          placeholder="Введите название страны"
          :remote-method="searchCountry"
          v-model="artist.countries"
        >
          <el-option
            v-for="country in foundedCountry"
            :key="country._id"
            :label="country.title"
            :value="country"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Musicbrainz ID
        </template>
        <el-input v-model="artist.musicbrainzId" />
      </el-descriptions-item>
    </el-descriptions>
    <el-collapse>
      <el-collapse-item
        title="Фото"
        name="images"
      >
        <el-button
          :icon="Plus" type="success" size="small"
          :disabled="imageAddDisabled"
          @click="addImage"
        />
        <div class="grid grid-cols-2">
          <CoverArt v-if="artist.images[0]" :entity="artist" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>
