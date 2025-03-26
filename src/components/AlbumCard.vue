<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

import { goToAlbumPage } from '@/utils'

import type { IAlbum } from '../../types'

const props = defineProps({
  album: {
    type: Object as PropType<IAlbum>,
    required: true,
  },
  showArtist: {
    type: Boolean,
    default: true,
  },
  showFigure: {
    type: Boolean,
    default: true,
  }
})

const editDialog = ref(false)

const albumCoverUrl = computed((): string => {
  if (props.album.images?.length) return `https://dark-corner.ru/api/download/image?path=${props.album.images[0].path}`
  return ''
})

const albumReleaseYear = computed((): string => {
  if (props.album.releaseDate) return dayjs(props.album.releaseDate).format('YYYY')
  return ''
})

</script>

<template>
  <div class="flex flex-col items-start p-3">
    <router-link v-if="showFigure" :to="`/album/${props.album._id}`">
      <figure
        class="effect-text-three"
        @click="goToAlbumPage(props.album._id)"
      >
        <img
          :src="albumCoverUrl"
          width="300"
          class="cursor-pointer"
        >
        <figcaption>
          <h3>{{ props.album.artists.map(a => a.name).join(', ') }}</h3>
          <p>{{ props.album.title }} ({{ albumReleaseYear }})</p>
          <p>{{ props.album.genres.map(g => g.name).join(', ') }}</p>
        </figcaption>
      </figure>
    </router-link>
    <router-link v-else :to="`/album/${props.album._id}`">
      <el-dropdown trigger="contextmenu">
        <img
          :src="albumCoverUrl"
          width="300"
          class="cursor-pointer"
        >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item :icon="Edit" @click="editDialog = true">
              Редактировать
            </el-dropdown-item>
            <el-dropdown-item :icon="Delete">
              Удалить
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </router-link>
    <router-link
      v-if="props.showArtist"
      class="text-xl hover:underline"
      :to="`/artist/${props.album.parentRatingKey}`"
    >
      {{ props.album.parentTitle }}
    </router-link>
    <router-link class="text-gray-400 hover:underline" :to="`/album/${props.album._id}`">
      {{ props.album.title }} ({{ albumReleaseYear }})
    </router-link>
  </div>

  <el-dialog v-model="editDialog">
    <el-descriptions
      title="Редакирование альбома"
      direction="vertical"
      :column="4"
      border
    >
      <el-descriptions-item label="Название">
        <el-input v-model="props.album.title" />
      </el-descriptions-item>
      <el-descriptions-item label="Год">
        <el-input type="date" v-model="props.album.releaseDate" />
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="success">
        Сохранить
      </el-button>
      <el-button type="danger" @click="editDialog = false">
        Закрыть
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="css">
figure {
  position: relative;
  z-index: 1;
  display: inline-block;
  overflow: hidden;
  background: #42b2c4;
  text-align: center;
  cursor: pointer;
}

figure img {
  position: relative;
  display: block;
  min-height: 100%;
  opacity: 1;
  backface-visibility: hidden;
}

figure figcaption {
  position: absolute;
  top: 0;
  left: 0;
  padding: 2em;
  width: 100%;
  height: 100%;
  color: #fff;
  text-transform: uppercase;
  font-size: 1.25em;
  backface-visibility: hidden;
}

figure figcaption::before,
figure figcaption::after {
  pointer-events: none;
}

figure h3 {
  margin: 0;
  font-weight: 500;
  word-spacing: -0.15em;
}

figure h3 span {
  font-weight: 800;
}

figure p {
  margin: 0;
  font-size: 68.5%;
  letter-spacing: 1px;
}

/* Effect styles */
figure.effect-text-three img {
  transition: opacity 0.35s, transform 0.35s;
}

figure.effect-text-three:hover img {
  opacity: 0.1;
  transform: translateZ(0);
}

figure.effect-text-three figcaption {
  text-align: left;
}

figure.effect-text-three h3 {
  position: relative;
  overflow: hidden;
  padding: 0.5em 0;
  opacity: 0;
  transition: opacity 0.35s, transform 0.35s;
  transform: translate3d(100%,0,0);
}

figure.effect-text-three h3::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #fff;
  content: '';
  transition: transform 0.35s;
  transform: translate3d(-100%,0,0);
}

figure.effect-text-three:hover h3 {
  opacity: 1;
  transform: translateZ(0);
}

figure.effect-text-three:hover h3::after {
  transform: translateZ(0);
}

figure.effect-text-three p {
  opacity: 0;
  transition: opacity 0.35s, transform 0.35s;
  transform: translate3d(100%,0,0);
}

figure.effect-text-three:hover p {
  opacity: 1;
  transform: translateZ(0);
}
</style>
