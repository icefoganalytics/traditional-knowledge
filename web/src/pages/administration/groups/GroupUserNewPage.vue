<template>
  <!-- TODO: add user to group form -->
  <GroupCreateForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"
import GroupCreateForm from "@/components/groups/GroupCreateForm.vue"

defineProps<{
  groupId: string
}>()

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
