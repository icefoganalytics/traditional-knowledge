<template>
  <UserGroupAddUserToGroupForm :group-id="groupIdAsNumber" />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import UserGroupAddUserToGroupForm from "@/components/user-groups/UserGroupAddUserToGroupForm.vue"

const props = defineProps<{
  groupId: string
}>()

const groupIdAsNumber = computed(() => parseInt(props.groupId))

useBreadcrumbs("Add User to Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
