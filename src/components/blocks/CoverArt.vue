<script setup lang="ts">
import { type PropType, computed } from 'vue'

import { API_URL } from '@/api'

import type { IAlbum, IArtist } from '../../../types'

const props = defineProps({
  entity: {
    type: Object as PropType<IArtist | IAlbum>,
    required: true,
  }
})

const albumCoverArtUrl = computed((): string => {
  return props.entity.images[0].path ?
    `${API_URL}/image/${props.entity.images[0].path.replace('/srv/music/', '')}?width=300`
    : ''
})
</script>

<template>
  <div>
    <img :src="albumCoverArtUrl">
    <el-input v-model="props.entity.images[0].path" />
  </div>
</template>
