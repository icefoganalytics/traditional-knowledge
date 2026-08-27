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
      <ArchiveItemCard :archive-item-id="informationSharingAgreementArchiveItem.archiveItemId" />
      <ArchiveItemAttachmentsCard
        class="mt-5"
        :archive-item-id="informationSharingAgreementArchiveItem.archiveItemId"
        @accessed="reloadArchiveItemAuditCard"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <ArchiveItemQuickInfoCard
        :archive-item-id="informationSharingAgreementArchiveItem.archiveItemId"
      />
      <ArchiveItemAuditCard
        ref="archiveItemAuditCard"
        class="mt-5"
        :item-id="informationSharingAgreementArchiveItem.archiveItemId"
      />
    </v-col>
  </v-row>
  <PreviewDialog />
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, ref, useTemplateRef, watch } from "vue"
import informationSharingAgreementArchiveItemsApi, {
  type InformationSharingAgreementArchiveItem,
} from "@/api/information-sharing-agreement-archive-items-api"
import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import { formatInformationSharingAgreementNumber } from "@/utils/formatters"

import ArchiveItemAttachmentsCard from "@/components/archive-items/ArchiveItemAttachmentsCard.vue"
import ArchiveItemAuditCard from "@/components/archive-items/ArchiveItemAuditCard.vue"
import ArchiveItemCard from "@/components/archive-items/ArchiveItemCard.vue"
import ArchiveItemQuickInfoCard from "@/components/archive-items/ArchiveItemQuickInfoCard.vue"
import PreviewDialog from "@/components/pdf/PreviewDialog.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementArchiveItemId: string
}>()

const informationSharingAgreementNumber = computed(() =>
  formatInformationSharingAgreementNumber(parseInt(props.informationSharingAgreementId))
)

const informationSharingAgreementArchiveItem = ref<InformationSharingAgreementArchiveItem | null>(
  null
)
const isLoading = ref(true)
const archiveItemAuditCard =
  useTemplateRef<InstanceType<typeof ArchiveItemAuditCard>>("archiveItemAuditCard")

function reloadArchiveItemAuditCard() {
  archiveItemAuditCard.value?.reload()
}

async function loadInformationSharingAgreementArchiveItem() {
  isLoading.value = true
  informationSharingAgreementArchiveItem.value = null
  try {
    const result = await informationSharingAgreementArchiveItemsApi.get(
      parseInt(props.informationSharingAgreementArchiveItemId)
    )
    if (
      result.informationSharingAgreementArchiveItem.informationSharingAgreementId ===
      parseInt(props.informationSharingAgreementId)
    ) {
      informationSharingAgreementArchiveItem.value = result.informationSharingAgreementArchiveItem
    }
  } catch (error) {
    console.error("Failed to load information sharing agreement knowledge item:", error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.informationSharingAgreementId, props.informationSharingAgreementArchiveItemId],
  loadInformationSharingAgreementArchiveItem,
  { immediate: true }
)

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
