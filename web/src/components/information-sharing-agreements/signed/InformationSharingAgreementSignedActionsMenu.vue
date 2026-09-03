<template>
  <BaseActionsMenuBtnGroup
    v-bind="primaryButtonAttributes"
    :loading="isLoading"
  >
    <template
      v-if="!isLoading && !isNil(informationSharingAgreement) && !hasKnowledgeItems"
      #dialogs
    >
      <InformationSharingAgreementArchiveItemCreateDialog
        ref="informationSharingAgreementArchiveItemCreateDialogRef"
        :information-sharing-agreement="informationSharingAgreement"
        @created="goToInformationSharingAgreementsPage"
      />
    </template>
    <v-list-item
      :loading="isDownloadingSignedConfidentialityAcknowledgement"
      @click="downloadSignedConfidentialityAcknowledgement"
    >
      <v-list-item-title>Signed Information Sharing Agreement</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="primary"
          icon="mdi-download"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Download the signed information sharing agreement document."
      />
    </v-list-item>
    <v-list-item
      v-if="hasSignedConfidentialityReceipt"
      :loading="isDownloadingSignedConfidentialityReceipt"
      @click="downloadSignedConfidentialityReceipt"
    >
      <v-list-item-title>Signed Confidentiality Receipt</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="primary"
          icon="mdi-download"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Download the signed confidentiality receipt document."
      />
    </v-list-item>
    <v-list-item
      v-if="!isLoading && !hasKnowledgeItems"
      class="cursor-pointer"
    >
      <v-list-item-title>Revert to Draft</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="warning"
          icon="mdi-pencil-outline"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Revert this agreement back to draft state for further editing."
      />
      <InformationSharingAgreementRevertToDraftDialog
        :information-sharing-agreement-id="informationSharingAgreementId"
        activator="parent"
        @success="emit('updated', informationSharingAgreementId)"
      />
    </v-list-item>
  </BaseActionsMenuBtnGroup>
</template>

<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue"
import { useRouter } from "vue-router"
import { isNil } from "lodash"

import Api from "@/api"
import useAuthenticatedDownload from "@/use/utils/use-authenticated-download"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useInformationSharingAgreementArchiveItems from "@/use/use-information-sharing-agreement-archive-items"

import BaseActionsMenuBtnGroup from "@/components/common/BaseActionsMenuBtnGroup.vue"
import InformationSharingAgreementArchiveItemCreateDialog from "@/components/information-sharing-agreements/archive-items/InformationSharingAgreementArchiveItemCreateDialog.vue"
import InformationSharingAgreementRevertToDraftDialog from "@/components/information-sharing-agreements/InformationSharingAgreementRevertToDraftDialog.vue"

const props = defineProps<{
  informationSharingAgreementId: number
}>()

const emit = defineEmits<{
  updated: [informationSharingAgreementId: number]
}>()

const router = useRouter()
const { informationSharingAgreementId } = toRefs(props)

const { informationSharingAgreement, isLoading: isLoadingInformationSharingAgreement } =
  useInformationSharingAgreement(informationSharingAgreementId)

const hasSignedConfidentialityReceipt = computed(() => {
  if (isNil(informationSharingAgreement.value)) {
    return false
  }

  const { signedConfidentialityReceipt } = informationSharingAgreement.value
  return !isNil(signedConfidentialityReceipt)
})

const informationSharingAgreementArchiveItemsQuery = computed(() => ({
  where: {
    informationSharingAgreementId: props.informationSharingAgreementId,
  },
  perPage: 1,
}))
const { informationSharingAgreementArchiveItems, isLoading: isLoadingKnowledgeItems } =
  useInformationSharingAgreementArchiveItems(informationSharingAgreementArchiveItemsQuery)
const isLoading = computed(
  () => isLoadingInformationSharingAgreement.value || isLoadingKnowledgeItems.value
)
const knowledgeItem = computed(() => informationSharingAgreementArchiveItems.value.at(0))
const hasKnowledgeItems = computed(() => !isNil(knowledgeItem.value))
const informationSharingAgreementArchiveItemCreateDialogRef = useTemplateRef(
  "informationSharingAgreementArchiveItemCreateDialogRef"
)

function openCreateArchiveItemDialog() {
  informationSharingAgreementArchiveItemCreateDialogRef.value?.open()
}

const primaryButtonAttributes = computed(() => {
  if (!isNil(knowledgeItem.value)) {
    return {
      primaryButtonText: "View Knowledge Item",
      primaryButtonTo: {
        name: "information-sharing-agreements/InformationSharingAgreementKnowledgeItemPage",
        params: {
          informationSharingAgreementId: props.informationSharingAgreementId,
          informationSharingAgreementArchiveItemId: knowledgeItem.value.id,
        },
      },
    }
  } else {
    return {
      primaryButtonText: "Create Knowledge Item",
      primaryButtonProps: { onClick: () => openCreateArchiveItemDialog() },
    }
  }
})

const generateSignedConfidentialityAcknowledgementUrl = computed(() =>
  Api.Downloads.InformationSharingAgreements.signedConfidentialityAcknowledgementApi.downloadPath(
    props.informationSharingAgreementId
  )
)
const {
  submit: downloadSignedConfidentialityAcknowledgement,
  isLoading: isDownloadingSignedConfidentialityAcknowledgement,
} = useAuthenticatedDownload(generateSignedConfidentialityAcknowledgementUrl)

const generateSignedConfidentialityReceiptUrl = computed(() =>
  Api.Downloads.InformationSharingAgreements.signedConfidentialityReceiptApi.downloadPath(
    props.informationSharingAgreementId
  )
)
const {
  submit: downloadSignedConfidentialityReceipt,
  isLoading: isDownloadingSignedConfidentialityReceipt,
} = useAuthenticatedDownload(generateSignedConfidentialityReceiptUrl)

async function goToInformationSharingAgreementsPage() {
  await router.push({ name: "InformationSharingAgreementsPage" })
}
</script>

<style scoped></style>
