<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiPlay, mdiPause, mdiVolumeLow, mdiVolumeMedium, mdiVolumeHigh, mdiVolumeOff,
  mdiSkipPrevious, mdiSkipNext, mdiStop, mdiListBox, mdiDelete,
  mdiShuffleVariant
} from '@mdi/js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import { useMainStore } from '@/stores/main'

dayjs.extend(duration)

const SITE_URL = 'https://dark-corner.ru/api/image'

const mainStore = useMainStore()

const drawer = ref(false)

const currentTimeFormated = computed(() => {
  return dayjs.duration(mainStore.player.currentTime, 's').format('m:ss')
})

const durationFormated = computed(() => {
  return dayjs.duration(mainStore.player.duration, 's').format('m:ss')
})

const currentTrack = computed(() => {
  return mainStore.currentTrack
})

const coverArtUrl = computed((): string => {
  if (currentTrack.value.album.images && currentTrack.value.album.images[0]) {
    return `${SITE_URL}/${currentTrack.value.album.images[0].path}`
  }
  return ''
})

const volumeIcon = computed(() => {
  if (mainStore.player.volume === 0) return mdiVolumeOff
  else if (mainStore.player.volume <= 20) return mdiVolumeLow
  else if (mainStore.player.volume > 20 && mainStore.player.volume < 75) return mdiVolumeMedium
  else if (mainStore.player.volume > 75 ) return mdiVolumeHigh
  return mdiVolumeHigh
})

const nextTrackIsDisabled = computed((): boolean => {
  if (mainStore.player.shuffle) return false
  return mainStore.player.currentTrackIndex + 1 >= mainStore.player.playlistQueue.length
})

const prevTrackIsDisabled = computed((): boolean => {
  if (mainStore.player.shuffle) return false
  return mainStore.player.currentTrackIndex - 1 < 0
})

const playTrackByIndex = (trackIndex: number) => {
  if (mainStore.player.currentTrackIndex !== trackIndex) mainStore.playTrackByIndex(trackIndex)
}

const deleteFromPlaylist = (trackIndex: number) => {
  mainStore.player.playlistQueue.splice(trackIndex, 1)
}

const playPrev = () => {
  mainStore.playPrev()
}

const playNext = () => {
  mainStore.playNext()
}

const clearPlaylist = () => {
  mainStore.clearPlaylist()
}

const stopAndClosePlayer = () => {
  mainStore.stop()
  mainStore.currentTrack = {}
}

const setVolume = (volume: number) => {
  mainStore.setVolume(volume)
}

const toggleVolume = () => {
  if (mainStore.player.volume > 0) mainStore.setVolume(0)
  else mainStore.setVolume(100)
}

const toggleShuffle = () => {
  mainStore.player.shuffle = !mainStore.player.shuffle
}

const formatTooltip = (seconds: number) => {
  return dayjs.duration(seconds, 's').format('m:ss')
}

</script>

<template>
  <div class="fixed bottom-0 w-full z-10 bg-black flex">
    <img
      :src="coverArtUrl"
      class="m-2"
      width="90"
    >
    <div class="flex flex-col max-w-72 items-start justify-around text">
      <div>
        <a>Трек: </a>
        <router-link class="font-bold hover:text-blue-500" :to="`/album/${currentTrack.album._id}`">
          {{ currentTrack.title }}
        </router-link>
      </div>
      <div>
        <a>Группа: </a>
        <router-link
          v-for="artist in currentTrack.album.artists" :key="artist.title" class="font-bold hover:text-blue-500"
          :to="`/artist/${artist._id}`"
        >
          {{ artist.title }}
        </router-link>
      </div>
      <div>
        <a>Альбом: </a>
        <router-link class="font-bold hover:text-blue-500" :to="`/album/${currentTrack.album._id}`">
          {{ currentTrack.album.title }}
        </router-link>
      </div>
      {{ currentTimeFormated }} / {{ durationFormated }}
    </div>
    <div class="flex flex-col justify-around grow">
      <el-slider
        :max="mainStore.player.duration"
        :format-tooltip="formatTooltip"
        v-model="mainStore.player.currentTime"
        @input="mainStore.changeCurrentTime"
      />
      <div class="flex justify-center items-center grow">
        <el-button
          circle
          text
          :disabled="prevTrackIsDisabled"
        >
          <SvgIcon
            type="mdi"
            :path="mdiSkipPrevious"
            size="40"
            @click="playPrev"
          />
        </el-button>
        <el-button
          v-if="mainStore.player.status === 'pause'"
          circle
          text
          size="large"
        >
          <SvgIcon
            type="mdi"
            :path="mdiPlay"
            size="60"
            @click="mainStore.play()"
          />
        </el-button>
        <el-button
          v-else-if="mainStore.player.status === 'playing'"
          circle
          text
          size="large"
        >
          <SvgIcon
            type="mdi"
            :path="mdiPause"
            size="60"
            @click="mainStore.pause()"
          />
        </el-button>
        <el-button
          circle
          text
          :disabled="nextTrackIsDisabled"
          @click="playNext"
        >
          <SvgIcon
            type="mdi"
            :path="mdiSkipNext"
            size="40"
          />
        </el-button>
        <el-button
          circle
          text
          @click="stopAndClosePlayer"
        >
          <SvgIcon
            type="mdi"
            :path="mdiStop"
            size="35"
          />
        </el-button>
      </div>
    </div>
    <div class="flex items-center gap-3 m-5">
      <el-tooltip content="Случайный порядок">
        <el-button
          circle
          text
          :type="mainStore.player.shuffle ? 'primary': ''"
          @click="toggleShuffle"
        >
          <SvgIcon
            type="mdi"
            :path="mdiShuffleVariant"
          />
        </el-button>
      </el-tooltip>
      <el-tooltip content="Открыть плейлист">
        <el-button circle text>
          <SvgIcon
            type="mdi"
            :path="mdiListBox"
            @click="drawer = true"
          />
        </el-button>
      </el-tooltip>
      <el-button circle text>
        <SvgIcon
          type="mdi"
          :path="volumeIcon"
          @click="toggleVolume"
        />
      </el-button>
      <el-slider
        vertical
        :step="1"
        v-model="mainStore.player.volume"
        @input="setVolume"
      />
    </div>
  </div>
  <el-drawer
    direction="rtl"
    size="40%"
    :with-header="false"
    v-model="drawer"
  >
    <el-input placeholder="Фильтр" v-model="mainStore.playlistFilter" />
    <table class="el-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Трек</th>
          <th>Длительность</th>
          <th>Действия</th>
          <!-- <th>Альбом</th> -->
          <!-- <th>Группа</th> -->
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(track, index) in mainStore.filteredPlaylist"
          :key="track.ratingKey"
          :class="{'!bg-amber-700': track.ratingKey === mainStore.currentTrack.ratingKey}"
          class="cursor-pointer"
          @click="playTrackByIndex(index)"
        >
          <td class="flex justify-around items-center">
            {{ index + 1 }} <img :src="`https://dark-corner.ru${track.thumb}?X-Plex-Token=3QnmkvTM4reJKYt8Jfuq`" width="30">
          </td>
          <td>{{ track.title }}</td>
          <td align="center">
            {{ dayjs.duration(track.duration).format('m:ss') }}
          </td>
          <td align="center">
            <el-button
              circle
              text
              type="danger"
              @click.stop="deleteFromPlaylist(index)"
            >
              <SvgIcon
                type="mdi"
                :path="mdiDelete"
              />
            </el-button>
          </td>
          <!-- <td>{{ track.parentTitle }}</td>
          <td>{{ track.grandparentTitle }}</td> -->
        </tr>
      </tbody>
    </table>
    <template #footer>
      <el-button type="danger" @click="clearPlaylist">
        Очистить очередь
      </el-button>
    </template>
  </el-drawer>
</template>

<style lang="css" scoped>
.text {
  font-weight: 500;
  font-size: 14px;
  color: #CFD3DC;
  vertical-align: middle;
}
</style>
