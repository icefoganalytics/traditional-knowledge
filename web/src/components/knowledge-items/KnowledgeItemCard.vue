<template>
  <v-skeleton-loader
    v-if="isNil(knowledgeItem)"
    type="card@2"
  />
  <v-card
    v-else
    class="border"
  >
    <template #title>
      <div class="d-flex align-center">
        Knowledge Item Description
        <v-spacer />
        <v-btn
          size="small"
          color="error"
          variant="text"
          :loading="isDeleting"
          @click="deleteKnowledgeItem"
        >
          Delete
        </v-btn>
      </div>
    </template>
    <template #text>
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-text-field
            v-model="knowledgeItem.title"
            label="Title"
            readonly
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <SecurityLevelSelect
            v-model="knowledgeItem.securityLevel"
            label="Security level"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="knowledgeItem.description"
            label="Description"
            readonly
            rows="2"
            auto-grow
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="knowledgeItem.yukonFirstNations"
            label="Yukon First Nations"
            readonly
            rows="2"
            auto-grow
          />
        </v-col>
      </v-row>
    </template>

    <v-card-title>Tags</v-card-title>
    <v-card-text>
      <p class="mb-4">
        Tags are used as filter criteria to find items in the Vault. You can select as many as are
        applicable to this item.
      </p>
      <v-combobox
        v-model="knowledgeItem.tags"
        label="Tags"
        multiple
        chips
        readonly
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs, ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import knowledgeItemsApi from "@/api/knowledge-items-api"

import useKnowledgeItem from "@/use/use-knowledge-item"
import useSnack from "@/use/use-snack"

import SecurityLevelSelect from "@/components/knowledge-items/SecurityLevelSelect.vue"

const props = defineProps<{
  knowledgeItemId: number
}>()

const { knowledgeItemId } = toRefs(props)
const { knowledgeItem } = useKnowledgeItem(knowledgeItemId)

const isDeleting = ref(false)
const snack = useSnack()
const router = useRouter()

async function deleteKnowledgeItem() {
  const result = blockedToTrueConfirm("Are you sure you want to delete this knowledge item?")
  if (result !== true) return

  isDeleting.value = true
  try {
    await knowledgeItemsApi.delete(knowledgeItemId.value)
    snack.success("Knowledge item deleted")
    router.push({
      name: "knowledge-items/KnowledgeItemListPage",
    })
  } catch (error) {
    console.error("Failed to delete knowledge item:", error)
    snack.error("Failed to delete knowledge item")
  } finally {
    isDeleting.value = false
  }
}
</script>
