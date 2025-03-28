<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

import { useMainStore } from '@/stores/main'

import AlbumCard from '@/components/AlbumCard.vue'

const mainStore = useMainStore()

const activeTab = ref('library')
const filter = ref({
  type: 'albums',
  sort: 'addedAt:desc',
})

watch(filter, async (value) => {
  await mainStore.getSortedItems(value)
}, { deep: true })

onMounted(async () => {
  await mainStore.getSortedItems(filter.value, 50)
})

</script>

<template>
  <div class="p-5">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Библиотека" name="library">
        <div class="flex gap-3">
          <el-select style="width: 180px" v-model="filter.type">
            <el-option label="Альбомы" value="9" />
            <el-option label="Группы" value="8" />
          </el-select>
          <el-select style="width: 180px" v-model="filter.sort">
            <el-option label="По названию" value="title" />
            <el-option label="По дате добавления" value="addedAt:desc" />
          </el-select>
        </div>
        <div class="grid grid-cols-6">
          <template v-if="filter.type === 'albums'">
            <AlbumCard
              v-for="album in mainStore.albums"
              :key="album._id"
              :album="album"
            />
          </template>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Плейлисты" name="playlists">
        playlists
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
