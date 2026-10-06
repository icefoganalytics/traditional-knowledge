<template>
  <v-skeleton-loader
    v-if="isNil(knowledgeItem)"
    type="card"
  />
  <v-card
    v-else
    class="border"
  >
    <template #title>Attachments</template>
    <template
      v-if="knowledgeItem.files && knowledgeItem.files.length > 0"
      #text
    >
      <div
        v-for="file of knowledgeItem.files"
        :key="file.id"
      >
        <KnowledgeItemFileCard
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
      <div class="w-100">
        <FileUploadGuidance class="mx-2" />
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
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { ref, toRefs } from "vue"

import knowledgeItemsApi from "@/api/knowledge-items-api"
import useKnowledgeItem from "@/use/use-knowledge-item"
import useSnack from "@/use/use-snack"

import KnowledgeItemFileCard from "@/components/knowledge-item-files/KnowledgeItemFileCard.vue"
import FileUploadGuidance from "@/components/common/FileUploadGuidance.vue"

const props = defineProps<{
  knowledgeItemId: number
}>()

const emit = defineEmits<{
  accessed: [knowledgeItemFileId: number]
}>()

const { knowledgeItemId } = toRefs(props)
const { knowledgeItem, policy, refresh } = useKnowledgeItem(knowledgeItemId)
const snack = useSnack()

const filesToUpload = ref<File[]>([])
const isUploading = ref(false)

async function uploadFiles(files: File | File[]) {
  const filesAsArray = Array.isArray(files) ? files : [files]
  if (isEmpty(filesAsArray)) return

  isUploading.value = true
  try {
    await knowledgeItemsApi.createFiles(knowledgeItemId.value, filesAsArray)
    await refresh()
    filesToUpload.value = []
  } catch (error) {
    console.error("Failed to upload attachment:", error)
    snack.error("Failed to upload attachment")
  } finally {
    isUploading.value = false
  }
}
</script>
