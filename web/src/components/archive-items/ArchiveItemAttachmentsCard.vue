<template>
  <v-skeleton-loader
    v-if="isNil(archiveItem)"
    type="card"
  />
  <v-card
    v-else
    class="border"
  >
    <template #title>Attachments</template>
    <template
      v-if="archiveItem.files && archiveItem.files.length > 0"
      #text
    >
      <div
        v-for="file of archiveItem.files"
        :key="file.id"
      >
        <ArchiveItemFileCard
          :file="file"
          @accessed="emit('accessed', $event)"
        />
      </div>
    </template>
    <template
      v-else
      #text
    >
      No Attachments
    </template>
    <template
      v-if="policy?.update"
      #actions
    >
      <v-file-input
        v-model="filesToUpload"
        class="mx-2 mb-2"
        density="compact"
        multiple
        chips
        clearable
        hide-details
        label="Attach files"
        :loading="isUploading"
        :disabled="isUploading"
        @update:model-value="uploadFiles"
      />
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { ref, toRefs } from "vue"

import archiveItemsApi from "@/api/archive-items-api"
import useArchiveItem from "@/use/use-archive-item"

import ArchiveItemFileCard from "@/components/archive-item-files/ArchiveItemFileCard.vue"

const props = defineProps<{
  archiveItemId: number
}>()

const emit = defineEmits<{
  accessed: [archiveItemFileId: number]
}>()

const { archiveItemId } = toRefs(props)
const { archiveItem, policy, refresh } = useArchiveItem(archiveItemId)

const filesToUpload = ref<File[]>([])
const isUploading = ref(false)

async function uploadFiles(files: File | File[]) {
  const filesAsArray = Array.isArray(files) ? files : [files]
  if (isEmpty(filesAsArray)) return

  isUploading.value = true
  try {
    await archiveItemsApi.createFiles(archiveItemId.value, filesAsArray)
    await refresh()
    filesToUpload.value = []
  } finally {
    isUploading.value = false
  }
}
</script>
