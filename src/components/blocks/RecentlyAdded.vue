<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { useMainStore } from '@/stores/main'

import AlbumCard from '../AlbumCard.vue'

const mainStore = useMainStore()

const albumPerRow = ref(3)
const open = ref(['recentlyAlbums'])

const gridCols = computed(() =>{
  return `grid grid-cols-${albumPerRow.value}`
})


onMounted(async () => {
  await mainStore.getRecentlyAlbums()
})
</script>

<template>
  <el-collapse v-model="open">
    <el-collapse-item
      title="Последние добавленные альбомы"
      name="recentlyAlbums"
    >
      <div class="grid grid-cols-5">
        <AlbumCard
          v-for="album in mainStore.recentlyAlbums"
          :key="album._id"
          :album="album"
        />
      </div>
    </el-collapse-item>
  </el-collapse>
</template>
