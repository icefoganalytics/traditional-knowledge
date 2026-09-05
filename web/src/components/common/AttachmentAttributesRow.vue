<template>
  <v-row class="align-center pa-3 ma-0">
    <v-col class="py-0">
      <div class="text-body-2 font-weight-medium">{{ attachment.name }}</div>
      <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis mt-1">
        <div>
          <div>{{ formattedDate }}</div>
          <div>{{ formattedSize }}</div>
        </div>
        <v-icon
          :color="iconColor"
          size="28"
        >{{ icon }}</v-icon>
      </div>
    </v-col>

    <v-col
      cols="12"
      md="auto"
    >
      <slot name="append" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { type AttachmentAsReference } from "@/api/attachments-api"
import { formatBytes, formatDateTime } from "@/utils/formatters"

const props = defineProps<{
  attachment: AttachmentAsReference
}>()

const iconColor = computed(() => {
  if (props.attachment.mimeType === "application/pdf") {
    return "red"
  }

  if (
    props.attachment.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    props.attachment.mimeType === "application/msword"
  ) {
    return "blue"
  }

  return "grey"
})

const icon = computed(() => {
  if (props.attachment.mimeType === "application/pdf") {
    return "mdi-file-pdf-box"
  }

  if (
    props.attachment.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    props.attachment.mimeType === "application/msword"
  ) {
    return "mdi-file-word-box"
  }

  return "mdi-file"
})

const formattedDate = computed(() => formatDateTime(props.attachment.createdAt))
const formattedSize = computed(() => formatBytes(props.attachment.size))
</script>
