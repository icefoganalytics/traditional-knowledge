<template>
  <v-card
    class="mb-5 simple-card"
    color="#fff"
    variant="flat"
    style="border: 1px solid #d7cfbe"
  >
    <v-card-title
      v-if="title"
      class="d-flex"
      :class="{ 'mb-n3': subtitle }"
    >
      {{ title }}
      <v-spacer />
      <slot name="title-append"></slot>
    </v-card-title>
    <v-card-subtitle
      v-if="subtitle"
      :class="{ 'mt-3': !title }"
    >
      {{ subtitle }}
    </v-card-subtitle>
    <v-card-text :class="{ 'mt-n5': subtitle }">
      <slot></slot>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>
