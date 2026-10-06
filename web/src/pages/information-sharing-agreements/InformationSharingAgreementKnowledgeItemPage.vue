<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card@3"
  />
  <v-alert
    v-else-if="isNil(informationSharingAgreementKnowledgeItem)"
    type="error"
    text="Knowledge item not found."
  />
  <v-row
    v-else
    :key="informationSharingAgreementKnowledgeItem.knowledgeItemId"
  >
    <v-col
      cols="12"
      md="8"
    >
      <v-card class="border">
        <v-tabs
          slider-color="primary"
          grow
          bg-color="#ffffff77"
        >
          <v-tab
            :to="{
              name: 'information-sharing-agreements/InformationSharingAgreementKnowledgeItemInformationSharingAgreementsPage',
              params: {
                informationSharingAgreementId,
                informationSharingAgreementKnowledgeItemId,
              },
            }"
          >
            Information Sharing Agreements
          </v-tab>
          <v-tab
            :to="{
              name: 'information-sharing-agreements/InformationSharingAgreementKnowledgeItemUsersWithAccessPage',
              params: {
                informationSharingAgreementId,
                informationSharingAgreementKnowledgeItemId,
              },
            }"
          >
            Users with Access
          </v-tab>
        </v-tabs>
        <v-divider />
        <router-view></router-view>
      </v-card>

      <KnowledgeItemAttachmentsCard
        :knowledge-item-id="informationSharingAgreementKnowledgeItem.knowledgeItemId"
        class="mt-5"
        @accessed="reloadKnowledgeItemAuditCard"
      />
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <div class="d-flex align-center pa-2">
        <v-spacer />
        <v-btn
          size="small"
          color="error"
          variant="outlined"
          :loading="isDeleting"
          @click="deleteKnowledgeItem"
        >
          Delete
        </v-btn>
      </div>

      <KnowledgeItemQuickInfoCard
        :knowledge-item-id="informationSharingAgreementKnowledgeItem.knowledgeItemId"
      />

      <KnowledgeItemAuditCard
        ref="knowledgeItemAuditCard"
        :item-id="informationSharingAgreementKnowledgeItem.knowledgeItemId"
        class="mt-5"
      />
    </v-col>
  </v-row>

  <PreviewDialog />
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, ref, useTemplateRef } from "vue"
import { useRouter } from "vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { formatInformationSharingAgreementNumber } from "@/utils/formatters"

import knowledgeItemsApi from "@/api/knowledge-items-api"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreementKnowledgeItem from "@/use/use-information-sharing-agreement-knowledge-item"
import useSnack from "@/use/use-snack"

import KnowledgeItemAttachmentsCard from "@/components/knowledge-items/KnowledgeItemAttachmentsCard.vue"
import KnowledgeItemAuditCard from "@/components/knowledge-items/KnowledgeItemAuditCard.vue"
import KnowledgeItemQuickInfoCard from "@/components/knowledge-items/KnowledgeItemQuickInfoCard.vue"
import PreviewDialog from "@/components/pdf/PreviewDialog.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementKnowledgeItemId: string
}>()

const informationSharingAgreementKnowledgeItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementKnowledgeItemId)
)
const {
  informationSharingAgreementKnowledgeItem: rawInformationSharingAgreementKnowledgeItem,
  isLoading,
} = useInformationSharingAgreementKnowledgeItem(informationSharingAgreementKnowledgeItemIdAsNumber)

const informationSharingAgreementKnowledgeItem = computed(() => {
  if (isNil(rawInformationSharingAgreementKnowledgeItem.value)) {
    return null
  }
  if (
    rawInformationSharingAgreementKnowledgeItem.value.informationSharingAgreementId !==
    parseInt(props.informationSharingAgreementId)
  ) {
    return null
  }
  return rawInformationSharingAgreementKnowledgeItem.value
})

const informationSharingAgreementNumber = computed(() =>
  formatInformationSharingAgreementNumber(parseInt(props.informationSharingAgreementId))
)

const knowledgeItemAuditCard =
  useTemplateRef<InstanceType<typeof KnowledgeItemAuditCard>>("knowledgeItemAuditCard")

function reloadKnowledgeItemAuditCard() {
  knowledgeItemAuditCard.value?.reload()
}

const router = useRouter()
const snack = useSnack()
const isDeleting = ref(false)

async function deleteKnowledgeItem() {
  if (isNil(informationSharingAgreementKnowledgeItem.value)) return

  const result = blockedToTrueConfirm("Are you sure you want to delete this knowledge item?")
  if (result !== true) return

  isDeleting.value = true
  try {
    await knowledgeItemsApi.delete(informationSharingAgreementKnowledgeItem.value.knowledgeItemId)
    snack.success("Knowledge item deleted")
    router.push({
      name: "information-sharing-agreements/InformationSharingAgreementPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    })
  } catch (error) {
    console.error("Failed to delete knowledge item:", error)
    snack.error("Failed to delete knowledge item")
  } finally {
    isDeleting.value = false
  }
}

useBreadcrumbs(
  "Knowledge Item",
  computed(() => [
    BASE_CRUMB,
    {
      title: "Information Sharing Agreements",
      to: {
        name: "InformationSharingAgreementsPage",
      },
    },
    {
      title: informationSharingAgreementNumber.value,
      to: {
        name: "information-sharing-agreements/InformationSharingAgreementPage",
        params: {
          informationSharingAgreementId: props.informationSharingAgreementId,
        },
      },
    },
  ])
)
</script>
