<template>
  <v-card :elevation="elevation">
    <v-card-title class="d-flex flex-column flex-md-row justify-md-space-between align-md-end">
      <slot name="header">
        <component
          :is="headerTag"
          v-if="!isEmpty(title)"
          :class="headerClass"
        >
          {{ title }}
        </component>
      </slot>
      <v-spacer class="mt-4 mt-md-0" />
      <slot name="header-actions"></slot>
    </v-card-title>
    <v-divider :class="dividerClass" />
    <v-card-text>
      <slot></slot>
    </v-card-text>
    <v-card-actions
      v-if="$slots['actions']"
      class="d-flex flex-column flex-md-row"
    >
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { isEmpty } from "lodash"

import { type VCard } from "vuetify/lib/components/index.mjs"

import { type VueHtmlClass } from "@/utils/utility-types"

withDefaults(
  defineProps<{
    title?: string
    headerTag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    headerClass?: VueHtmlClass
    dividerClass?: VueHtmlClass
    elevation?: VCard["elevation"]
  }>(),
  {
    title: "",
    headerTag: "h3",
    headerClass: "text-h5 mb-0",
    dividerClass: "mb-3",
    elevation: 0,
  }
)
</script>
