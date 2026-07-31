<template>
  <v-list-item
    :to="{
      name: 'information-sharing-agreements/InformationSharingAgreementKnowledgeItemPage',
      params: {
        informationSharingAgreementId,
        informationSharingAgreementArchiveItemId,
      },
    }"
    :title="archiveItem.title"
    :subtitle="archiveItem.summary || archiveItem.description || undefined"
  />
</template>

<script setup lang="ts">
import { type ArchiveItem } from "@/api/archive-items-api"

const props = defineProps<{
  archiveItem: ArchiveItem
  informationSharingAgreementId: number
  informationSharingAgreementArchiveItemId: number
}>()

const { archiveItem, informationSharingAgreementId, informationSharingAgreementArchiveItemId } =
  props
</script>
