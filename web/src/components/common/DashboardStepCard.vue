<template>
  <v-card
    :to="to"
    class="bg-primary"
    variant="outlined"
  >
    <v-card-text class="d-flex">
      <span class="d-sm-flex align-center me-3 d-none">
        <v-icon size="50px">{{ icon }}</v-icon>
      </span>

      <div>
        <div class="text-overline">Step {{ step }}</div>
        <div class="text-h6">{{ title }}</div>
        <span class="text-subtitle-2">{{ description }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { type RouteLocationRaw } from "vue-router"

defineProps<{
  step: number
  title: string
  description: string
  icon: string
  to: RouteLocationRaw
}>()
</script>
