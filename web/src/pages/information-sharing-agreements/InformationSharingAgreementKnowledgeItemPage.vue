<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card@3"
  />
  <v-alert
    v-else-if="isNil(informationSharingAgreementArchiveItem)"
    type="error"
    text="Knowledge item not found."
  />
  <v-row
    v-else
    :key="informationSharingAgreementArchiveItem.archiveItemId"
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
                informationSharingAgreementArchiveItemId,
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
                informationSharingAgreementArchiveItemId,
              },
            }"
          >
            Users with Access
          </v-tab>
        </v-tabs>
        <v-divider />
        <router-view></router-view>
      </v-card>

      <ArchiveItemAttachmentsCard
        :archive-item-id="informationSharingAgreementArchiveItem.archiveItemId"
        class="mt-5"
        @accessed="reloadArchiveItemAuditCard"
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
          @click="deleteArchiveItem"
        >
          Delete
        </v-btn>
      </div>

      <ArchiveItemQuickInfoCard
        :archive-item-id="informationSharingAgreementArchiveItem.archiveItemId"
      />

      <ArchiveItemAuditCard
        ref="archiveItemAuditCard"
        :item-id="informationSharingAgreementArchiveItem.archiveItemId"
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

import archiveItemsApi from "@/api/archive-items-api"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreementArchiveItem from "@/use/use-information-sharing-agreement-archive-item"
import useSnack from "@/use/use-snack"

import ArchiveItemAttachmentsCard from "@/components/archive-items/ArchiveItemAttachmentsCard.vue"
import ArchiveItemAuditCard from "@/components/archive-items/ArchiveItemAuditCard.vue"
import ArchiveItemQuickInfoCard from "@/components/archive-items/ArchiveItemQuickInfoCard.vue"
import PreviewDialog from "@/components/pdf/PreviewDialog.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementArchiveItemId: string
}>()

const informationSharingAgreementArchiveItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementArchiveItemId)
)
const {
  informationSharingAgreementArchiveItem: rawInformationSharingAgreementArchiveItem,
  isLoading,
} = useInformationSharingAgreementArchiveItem(informationSharingAgreementArchiveItemIdAsNumber)

const informationSharingAgreementArchiveItem = computed(() => {
  if (isNil(rawInformationSharingAgreementArchiveItem.value)) {
    return null
  }
  if (
    rawInformationSharingAgreementArchiveItem.value.informationSharingAgreementId !==
    parseInt(props.informationSharingAgreementId)
  ) {
    return null
  }
  return rawInformationSharingAgreementArchiveItem.value
})

const informationSharingAgreementNumber = computed(() =>
  formatInformationSharingAgreementNumber(parseInt(props.informationSharingAgreementId))
)

const archiveItemAuditCard =
  useTemplateRef<InstanceType<typeof ArchiveItemAuditCard>>("archiveItemAuditCard")

function reloadArchiveItemAuditCard() {
  archiveItemAuditCard.value?.reload()
}

const router = useRouter()
const snack = useSnack()
const isDeleting = ref(false)

async function deleteArchiveItem() {
  if (isNil(informationSharingAgreementArchiveItem.value)) return

  const result = blockedToTrueConfirm("Are you sure you want to delete this knowledge item?")
  if (result !== true) return

  isDeleting.value = true
  try {
    await archiveItemsApi.delete(informationSharingAgreementArchiveItem.value.archiveItemId)
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
