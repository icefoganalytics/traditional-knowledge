<template>
  <v-layout>
    <LeftSidebarNavigationDrawer ref="leftSidebarNavigationDrawerRef" />

    <v-app-bar
      flat
      color="secondary"
    >
      <v-app-bar-nav-icon
        color="#f7f9ef"
        @click="toggleLeftSidebarNavigationDrawer"
      ></v-app-bar-nav-icon>
      <v-app-bar-title
        v-if="mdAndUp"
        class="ml-2 text-weight-bold"
        style="font-weight: bold"
        ><span style="color: #f7f9ef">{{ title }}</span></v-app-bar-title
      >
      <v-app-bar-title
        v-if="!mdAndUp"
        class="ml-2 text-weight-bold"
        style="font-weight: bold"
      >
        <router-link
          :to="{ name: 'DashboardPage' }"
          style="color: #f7f9ef; text-decoration: none"
          >Traditional Knowledge</router-link
        >
      </v-app-bar-title>

      <div
        :style="{ width: `${searchWidth}px` }"
        class="d-none"
      >
        <v-text-field
          v-model="searchValue"
          variant="outlined"
          label="Search"
          hide-details
          density="compact"
          class="ml-2"
          bg-color="#545454"
          @update:focused="updateSearchFocus"
        ></v-text-field>
      </div>
      <v-spacer />

      <NotificationMenu />

      <KebabMenu />
    </v-app-bar>

    <v-main>
      <SimpleBreadcrumbs />

      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import { useDisplay } from "vuetify"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import KebabMenu from "@/components/default-layout/KebabMenu.vue"
import LeftSidebarNavigationDrawer from "@/components/default-layout/LeftSidebarNavigationDrawer.vue"
import SimpleBreadcrumbs from "@/components/common/SimpleBreadcrumbs.vue"
import NotificationMenu from "@/components/common/layouts/NotificationMenu.vue"

const { mdAndUp } = useDisplay()

const leftSidebarNavigationDrawerRef = useTemplateRef("leftSidebarNavigationDrawerRef")

function toggleLeftSidebarNavigationDrawer() {
  leftSidebarNavigationDrawerRef.value?.toggle()
}

const searchWidth = ref(120)
const searchValue = ref("")

const { title } = useBreadcrumbs()

function updateSearchFocus(hasFocus: boolean) {
  if (hasFocus) {
    searchWidth.value = 300
  } else {
    searchWidth.value = 120
    searchValue.value = ""
  }
}
</script>
