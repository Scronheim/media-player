<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiDownload, mdiPencil, mdiPlaylistPlus } from '@mdi/js'
import { ElNotification } from 'element-plus'

import { useMainStore } from '@/stores/main'

import { API_URL } from '@/api'

import type { DropdownInstance } from 'element-plus'
import { ITrack } from '../../types'

dayjs.extend(duration)

const mainStore = useMainStore()
const route = useRoute()

const token = '3QnmkvTM4reJKYt8Jfuq'

const dropdown = ref<DropdownInstance>()

const album = computed(() => {
  return mainStore.currentAlbum
})

const albumCoverArtUrl = computed((): string => {
  return mainStore.currentAlbum.images && mainStore.currentAlbum.images[0] ? `${API_URL}/download/image?path=${mainStore.currentAlbum.images[0].path}`: ''
})

const artistBackgroundUrl = computed((): string => {
  return mainStore.currentArtist.images && mainStore.currentArtist.images[1] ? `https://dark-corner.ru/api/download/image?path=${mainStore.currentArtist.images[1].path}`: ''
})

const albumReleaseYear = computed((): string => {
  if (album.value.releaseDate) return dayjs(album.value.releaseDate).format('DD.MM.YYYY')
  return ''
})

const playTrack = (track: ITrack) => {
  mainStore.player.shuffle = false
  mainStore.playQueues('track', track._id as string)
}

const playAlbum = () => {
  mainStore.player.shuffle = false
  mainStore.playQueues('album', mainStore.currentAlbum._id as string)
}

const appendToPlaylist = () => {
  mainStore.addToPlaylist(mainStore.currentAlbum.tracklist)
  ElNotification({ type: 'success', title: 'Добавлено', message: 'Альбом добавлен в плейлист' })
}

const showDropdown = () => {
  if (!dropdown.value) return
  dropdown.value.handleOpen()
}

onMounted(async () => {
  await mainStore.getAlbum(route.params.id as string)
})
</script>

<template>
  <div
    v-if="artistBackgroundUrl"
    :style="{backgroundImage: `url(${artistBackgroundUrl})`}"
    class="absolute bg-cover w-11/12 h-full bg-center bg-no-repeat -z-10 opacity-5"
  />
  <div class="p-5">
    <div class="flex gap-5">
      <el-image
        :src="albumCoverArtUrl"
        class="poster-card"
        style="width: 300px;"
      />
      <div class=" flex-col items-start">
        <router-link
          v-for="artist in album.artists" :key="artist._id"
          class="text-[40px] font-bold text-blue-500"
          :to="`/artist/${artist._id}`"
        >
          {{ artist.title }}
        </router-link>
        <p class="text-[20px]">
          {{ album.title }}
        </p>
        <p class="text-[15px] mt-3">
          {{ albumReleaseYear }}
        </p>
        <div class="mt-3">
          <el-tag
            v-for="genre in album.genres"
            :key="genre.name"
            class="p-3 mr-2"
          >
            {{ genre.name }}
          </el-tag>
        </div>
        <el-rate class="mt-3" v-model.number="album.userRating" />
        <div>
          <el-button
            class="mt-3"
            color="orange"
            @click="playAlbum"
          >
            <SvgIcon
              type="mdi"
              :path="mdiPlay"
              size="20"
            />
            Воспроизвести
          </el-button>
          <el-tooltip content="Добавить в плейлист">
            <el-button
              class="mt-3"
              type="success"
              @click="appendToPlaylist"
            >
              <SvgIcon
                type="mdi"
                :path="mdiPlaylistPlus"
                size="20"
              />
            </el-button>
          </el-tooltip>
          <el-tooltip content="Скачать архивом">
            <el-button class="mt-3" type="info">
              <SvgIcon
                type="mdi"
                :path="mdiDownload"
                size="20"
              />
            </el-button>
          </el-tooltip>
          <el-tooltip content="Редактировать альбом">
            <el-button class="mt-3" type="primary">
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
      <p>{{ album.tracklist.length }} треков</p>
      <el-table
        :data="album.tracklist"
        style="width: 100%"
        @row-dblclick="playTrack"
        @row-contextmenu="showDropdown"
      >
        <el-table-column
          prop="trackNumber"
          label="№"
          width="50"
        />
        <el-table-column
          prop="title"
          label="Название"
        />
        <el-table-column
          prop="userRating"
          label="Ваша оценка"
          width="200"
        >
          <template #default="{row}">
            <el-rate
              class="mt-3"
              allow-half
              :model-value="row.userRating / 2"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="duration"
          label="Длительность"
          width="150"
        >
          <template #default="{row}">
            {{ dayjs.duration(row.duration, 's').format('m:ss') }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="css">
.poster-card {
    background-color: rgba(0,0,0,.45);
    border-radius: 4px;
    box-shadow: 0 0 4px rgba(0,0,0,.3);
    position: relative;
}
</style>
