<template>
  <v-btn
    v-if="isSystemAdmin"
    :to="{ name: 'administration/CategoryNewPage' }"
    style="height: 40px"
    >New Category</v-btn
  >
</template>

<script setup lang="ts">
import useCurrentUser from "@/use/use-current-user"

const { isSystemAdmin } = useCurrentUser()
</script>
