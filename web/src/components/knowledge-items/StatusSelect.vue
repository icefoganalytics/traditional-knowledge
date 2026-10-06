<template>
  <v-select :items="items" />
</template>

<script setup lang="ts">
import { isNaN, capitalize } from "lodash"

import { KnowledgeItemStatus } from "@/api/knowledge-items-api"

const items = Object.keys(KnowledgeItemStatus)
  .filter((v) => isNaN(parseInt(v)))
  .map((v) => capitalize(v))
</script>
