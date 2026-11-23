<template>
  <KnowledgeItemLegacyNewForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import KnowledgeItemLegacyNewForm from "@/components/knowledge-items/KnowledgeItemLegacyNewForm.vue"

useBreadcrumbs("New Knowledge Item", [
  BASE_CRUMB,
  {
    title: "Knowledge Items",
    to: {
      name: "knowledge-items/KnowledgeItemListPage",
    },
  },
])
</script>
