<template>
  <BaseActionsMenuBtnGroup
    primary-button-text="Edit"
    :primary-button-to="{
      name: 'information-sharing-agreements/InformationSharingAgreementEditPage',
      params: {
        informationSharingAgreementId,
      },
    }"
    :loading="isLoading"
  >
    <v-list-item
      :loading="isDownloadingSignedAcknowledgement"
      @click="downloadSignedAcknowledgement"
    >
      <v-list-item-title>Signed Acknowledgement</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="primary"
          icon="mdi-download"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Download the signed acknowledgement document."
      />
    </v-list-item>
    <v-list-item
      v-if="!isNil(policy) && policy.update"
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

    <v-list-item
      v-if="!hasArchiveItem"
      :to="{
        name: 'information-sharing-agreements/archive-items/InformationSharingAgreementArchiveItemNewPage',
        params: {
          informationSharingAgreementId: props.informationSharingAgreementId,
        },
      }"
    >
      <v-list-item-title>Create Knowledge Item</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="secondary"
          icon="mdi-plus-circle-outline"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Create a knowledge item from this agreement."
      />
    </v-list-item>
  </BaseActionsMenuBtnGroup>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isEmpty, isNil } from "lodash"

import Api from "@/api"
import useAuthenticatedDownload from "@/use/utils/use-authenticated-download"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useInformationSharingAgreementArchiveItems from "@/use/use-information-sharing-agreement-archive-items"

import BaseActionsMenuBtnGroup from "@/components/common/BaseActionsMenuBtnGroup.vue"
import InformationSharingAgreementRevertToDraftDialog from "@/components/information-sharing-agreements/InformationSharingAgreementRevertToDraftDialog.vue"

const props = defineProps<{
  informationSharingAgreementId: number
}>()

const emit = defineEmits<{
  updated: [informationSharingAgreementId: number]
}>()

const { informationSharingAgreementId } = toRefs(props)
const { isLoading, policy } = useInformationSharingAgreement(informationSharingAgreementId)

const informationSharingAgreementArchiveItemsQuery = computed(() => ({
  where: {
    informationSharingAgreementId: props.informationSharingAgreementId,
  },
  perPage: 1,
}))
const { informationSharingAgreementArchiveItems } = useInformationSharingAgreementArchiveItems(
  informationSharingAgreementArchiveItemsQuery
)
const hasArchiveItem = computed(() => !isEmpty(informationSharingAgreementArchiveItems.value))

const generateSignedAcknowledgementUrl = computed(() =>
  Api.Downloads.InformationSharingAgreements.signedAcknowledgementApi.downloadPath(
    props.informationSharingAgreementId
  )
)
const { submit: downloadSignedAcknowledgement, isLoading: isDownloadingSignedAcknowledgement } =
  useAuthenticatedDownload(generateSignedAcknowledgementUrl)
</script>

<style scoped></style>
