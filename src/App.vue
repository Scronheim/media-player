<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiMagnify, mdiHome, mdiAlbum } from '@mdi/js'

import { useMainStore } from './stores/main'

import FooterPlayer from './components/FooterPlayer.vue'

const router = useRouter()
const mainStore = useMainStore()

const searchText = ref('')
const drawer = ref(false)

const querySearch = async (queryString: string, cb: any) => {
  cb(await mainStore.search(queryString))
}

const handleSelect = (item: Record<string, any>) => {
  router.push(item.link)
}

</script>

<template>
  <el-container>
    <el-header class="sticky top-0 flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 z-10">
      <el-dropdown split-button style="width: 180px;" @click="router.push('/')">
        Media Server
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/music')">
              <SvgIcon
                class="mr-2"
                type="mdi"
                :path="mdiAlbum"
                size="15"
              />Музыка
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-autocomplete
        :fetch-suggestions="querySearch"
        clearable
        class="inline-input w-50"
        placeholder="Поиск"
        v-model="searchText"
        @select="handleSelect"
      >
        <template #default="{item}">
          <a class="text-amber-500">{{ item.type }}:</a> <a class="font-bold">{{ item.value }}</a>
        </template>
        <template #append>
          <el-button>
            <SvgIcon
              type="mdi"
              :path="mdiMagnify"
              size="15"
            />
          </el-button>
        </template>
      </el-autocomplete>
      <div class="flex grow justify-end">
        <el-dropdown type="primary">
          <el-avatar>user</el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Action 1</el-dropdown-item>
              <el-dropdown-item>Action 2</el-dropdown-item>
              <el-dropdown-item>Action 3</el-dropdown-item>
              <el-dropdown-item divided>
                Выход
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="p-0">
      <RouterView />
    </el-main>
    <FooterPlayer v-if="mainStore.player.status !== 'stoped'" />
  </el-container>

  <el-drawer
    direction="ltr"
    size="20%"
    :with-header="false"
    v-model="drawer"
  >
    <el-menu router default-active="/">
      <el-menu-item index="/">
        <SvgIcon
          type="mdi"
          :path="mdiHome"
        />
        <span>Главная</span>
      </el-menu-item>
      <el-menu-item index="/music">
        <SvgIcon
          type="mdi"
          :path="mdiAlbum"
        />
        <span>Музыка</span>
      </el-menu-item>
    </el-menu>
  </el-drawer>
</template>

<style lang="css">

</style>
