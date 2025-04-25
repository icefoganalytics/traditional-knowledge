<template>
  <GroupCreateForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"
import GroupCreateForm from "@/components/groups/GroupCreateForm.vue"

useBreadcrumbs("New Group", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
