<template>
  <UserExternalCreateForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import UserExternalCreateForm from "@/components/users/UserExternalCreateForm.vue"

useBreadcrumbs("Add External User", [
  ADMIN_CRUMB,
  {
    title: "Users",
    to: {
      name: "users/UsersPage",
    },
  },
])
</script>
