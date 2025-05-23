<template>
  <v-skeleton-loader
    v-if="isNil(archiveItem)"
    type="card"
  />
  <v-card v-else>
    <v-card-title>Users with Access to this Item</v-card-title>
    <v-card-text v-if="!isNil(archiveItem.permittedUsers) && archiveItem.permittedUsers.length > 0">
      <v-list
        class="py-0"
        style="border: 1px solid rgba(0, 0, 0, 0.3); border-radius: 4px"
      >
        <v-list-item
          v-for="(user, idx) of archiveItem.permittedUsers"
          :key="user.id"
          :title="`${user.displayName} : ${user.email}`"
          :subtitle="`${user.department ?? 'Unknown department'} - ${user.title ?? 'Unknown title'}`"
          class="py-2"
          :class="{ 'border-bottom': idx < archiveItem.permittedUsers.length - 1 }"
        >
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-text v-else>No users have access to this item</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useArchiveItem from "@/use/use-archive-item"

const props = defineProps<{
  archiveItemId: number
}>()

const { archiveItemId } = toRefs(props)
const { archiveItem } = useArchiveItem(archiveItemId)
</script>

<style>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
}
</style>
