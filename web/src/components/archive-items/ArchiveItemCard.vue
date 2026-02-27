<template>
  <v-skeleton-loader
    v-if="isNil(archiveItem)"
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
          @click="deleteArchiveItem"
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
            v-model="archiveItem.title"
            label="Title"
            readonly
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <SecurityLevelSelect
            v-model="archiveItem.securityLevel"
            label="Security level"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="archiveItem.description"
            label="Description"
            readonly
            rows="2"
            auto-grow
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="archiveItem.yukonFirstNations"
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
        Tags are used as filter criteria to find items in the archive. You can select as many as are
        applicable to this item.
      </p>
      <v-combobox
        v-model="archiveItem.tags"
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

import archiveItemsApi from "@/api/archive-items-api"

import useArchiveItem from "@/use/use-archive-item"
import useSnack from "@/use/use-snack"

import SecurityLevelSelect from "@/components/archive-items/SecurityLevelSelect.vue"

const props = defineProps<{
  archiveItemId: number
}>()

const { archiveItemId } = toRefs(props)
const { archiveItem } = useArchiveItem(archiveItemId)

const isDeleting = ref(false)
const snack = useSnack()
const router = useRouter()

async function deleteArchiveItem() {
  const result = blockedToTrueConfirm("Are you sure you want to delete this knowledge item?")
  if (result !== true) return

  isDeleting.value = true
  try {
    await archiveItemsApi.delete(archiveItemId.value)
    snack.success("Knowledge item deleted")
    router.push({
      name: "archive-items/ArchiveItemListPage",
    })
  } catch (error) {
    console.error("Failed to delete knowledge item:", error)
    snack.error("Failed to delete knowledge item")
  } finally {
    isDeleting.value = false
  }
}
</script>
