<template>
  <ArchiveItemViewForm :archive-item-id="archiveItemIdAsNumber" />

  <PreviewDialog />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import ArchiveItemViewForm from "@/components/archive-item/ArchiveItemViewForm.vue"
import PreviewDialog from "@/components/pdf/PreviewDialog.vue"

const props = defineProps<{
  archiveItemId: string
}>()

const archiveItemIdAsNumber = computed(() => parseInt(props.archiveItemId))

useBreadcrumbs("View Archive Item", [
  BASE_CRUMB,
  {
    title: "Archive Items",
    to: {
      name: "archive-item/ArchiveItemListPage",
    },
  },
])
</script>
