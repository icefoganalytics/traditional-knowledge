<template>
  <GroupEditForm
    :group-id="groupIdAsNumber"
    :cancel-button-props="cancelButtonProps"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import GroupEditForm from "@/components/groups/GroupEditForm.vue"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))
const cancelButtonProps = computed(() => ({
  to: {
    name: "administration/GroupsPage",
  },
}))

useBreadcrumbs("Edit Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
