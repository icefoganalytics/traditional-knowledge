<template>
  <UserInternalCreateForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import UserInternalCreateForm from "@/components/users/UserInternalCreateForm.vue"

useBreadcrumbs("Add YG User", [
  ADMIN_CRUMB,
  {
    title: "Users",
    to: {
      name: "users/UsersPage",
    },
  },
])
</script>
