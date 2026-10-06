<template>
  <KnowledgeItemNewForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import KnowledgeItemNewForm from "@/components/knowledge-items/KnowledgeItemNewForm.vue"

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
