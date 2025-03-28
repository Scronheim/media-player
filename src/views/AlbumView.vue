<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiPlay, mdiDownload, mdiPencil, mdiPlaylistPlus, mdiDelete } from '@mdi/js'
import { ElNotification } from 'element-plus'

import { useMainStore } from '@/stores/main'
import CoverArt from '@/components/blocks/CoverArt.vue'

import { API_URL } from '@/api'

import type { DropdownInstance } from 'element-plus'
import type { IArtist, IGenre, ITrack } from '../../types'

dayjs.extend(duration)

const mainStore = useMainStore()
const route = useRoute()

const dropdown = ref<DropdownInstance>()
const editDialog = ref<boolean>(false)
const foundedArtist = ref<IArtist[]>([])
const foundedGenres = ref<IGenre[]>([])

const album = computed(() => {
  return mainStore.currentAlbum
})

const albumCoverArtUrl = computed((): string => {
  return mainStore.currentAlbum.images[0] ?
    `${API_URL}/image/${mainStore.currentAlbum.images[0].path.replace('/srv/music/', '')}?width=300`
    : ''
})

const artistBackgroundUrl = computed((): string => {
  return mainStore.currentArtist.images[1] ?
    `${API_URL}/image/${mainStore.currentArtist.images[1].path.replace('/srv/music', '')}`
    : ''
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

const showEditAlbumDialog = () => {
  editDialog.value = true
  foundedArtist.value = [...album.value.artists]
  foundedGenres.value = [...album.value.genres]
}

const searchArtist = async (queryString: string) => {
  foundedArtist.value = await mainStore.searchArtist(queryString)
}

const searchGenre = async (queryString: string) => {
  foundedGenres.value = await mainStore.searchGenre(queryString)
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
            <el-button class="mt-3" type="primary" @click="showEditAlbumDialog">
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

  <el-dialog v-model="editDialog">
    <el-descriptions
      :title="album.title"
      direction="vertical"
      :column="3"
      size="small"
      border
    >
      <template #extra>
        <el-button type="success" @click="mainStore.updateAlbum">
          Сохранить
        </el-button>
      </template>
      <el-descriptions-item>
        <template #label>
          Группы
        </template>
        <el-select
          multiple
          filterable
          remote
          reserve-keyword
          value-key="_id"
          placeholder="Введите название группы"
          :remote-method="searchArtist"
          v-model="album.artists"
        >
          <el-option
            v-for="artist in foundedArtist"
            :key="artist._id"
            :label="artist.title"
            :value="artist"
          />
        </el-select>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Альбом
        </template>
        <el-input v-model="album.title" />
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Год
        </template>
        <el-input type="date" v-model="album.releaseDate" />
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          Тип
        </template>
        <el-select
          placeholder="Введите название типа альбома"
          v-model="album.type"
        >
          <el-option
            v-for="type in mainStore.albumTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
      </el-descriptions-item>
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
          placeholder="Введите жанр"
          :remote-method="searchGenre"
          v-model="album.genres"
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
          Musicbrainz ID
        </template>
        <el-input v-model="album.musicbrainzId" />
      </el-descriptions-item>
    </el-descriptions>
    <el-collapse>
      <el-collapse-item
        title="Треклист"
        name="tracklist"
      >
        <el-table
          :data="album.tracklist"
          style="width: 100%"
          @row-dblclick="playTrack"
          @row-contextmenu="showDropdown"
        >
          <el-table-column
            prop="trackNumber"
            label="№"
            width="90"
          >
            <template #default="{row}">
              <el-input type="number" v-model.number="row.trackNumber" />
            </template>
          </el-table-column>
          <el-table-column
            prop="title"
            label="Название"
          >
            <template #default="{row}">
              <el-input v-model="row.title" />
            </template>
          </el-table-column>
          <el-table-column
            prop="cdNumber"
            label="CD"
            width="90"
          >
            <template #default="{row}">
              <el-input type="number" v-model.number="row.cdNumber" />
            </template>
          </el-table-column>
          <el-table-column
            prop="actions"
            label=""
            width="90"
          >
            <template #default="{index}">
              <el-button @click="album.tracklist.splice(index, 1)">
                <SvgIcon
                  type="mdi"
                  color="red"
                  :path="mdiDelete"
                  size="20"
                />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
      <el-collapse-item
        title="Изображения"
        name="images"
      >
        <div class="grid grid-cols-2">
          <CoverArt v-if="album.images[0]" :entity="album" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-dialog>
</template>

<style scoped lang="css">
.poster-card {
    background-color: rgba(0,0,0,.45);
    border-radius: 4px;
    box-shadow: 0 0 4px rgba(0,0,0,.3);
    position: relative;
}
</style>
