<template>
  <GroupCard :group-id="groupIdAsNumber" />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import GroupCard from "@/components/groups/GroupCard.vue"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))

useBreadcrumbs("Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
