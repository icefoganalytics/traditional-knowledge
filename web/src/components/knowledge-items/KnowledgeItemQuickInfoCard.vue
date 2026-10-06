<template>
  <v-skeleton-loader
    v-if="isNil(knowledgeItem)"
    type="card"
  />
  <v-card
    v-else
    variant="tonal"
  >
    <template #title>
      <div class="text-subtitle-2 mb-n2 text-grey">RECORDED AT</div>
      {{ formatDateTime(knowledgeItem.createdAt) }}
    </template>

    <v-divider />

    <template #text>
      <div v-if="knowledgeItem.userId">
        <div class="text-subtitle-2 mb-n1 text-grey">RECORDED BY</div>
        {{ knowledgeItem.user.displayName }}

        <p
          v-if="knowledgeItem.user.title"
          class="mb-0"
        >
          {{ knowledgeItem.user.title }}
        </p>
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { toRefs } from "vue"

import { formatDateTime } from "@/utils/formatters"
import useKnowledgeItem from "@/use/use-knowledge-item"

const props = defineProps<{
  knowledgeItemId: number
}>()

const { knowledgeItemId } = toRefs(props)
const { knowledgeItem } = useKnowledgeItem(knowledgeItemId)
</script>
