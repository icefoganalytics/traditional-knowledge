<template>
  <v-card
    class="border"
    color="#ffffff66"
  >
    <v-card-title class="text-subtitle-1">
      <h3>Signed Documents</h3>
    </v-card-title>
    <div>
      <AttachmentAttributesRow :attachment="acknowledgement">
        <template #append>
          <v-btn
            class="w-100 w-md-auto"
            prepend-icon="mdi-download"
            text="Download"
            title="Download signed information sharing agreement"
            variant="outlined"
            color="secondary"
            :loading="isDownloadingAcknowledgement"
            @click="downloadAcknowledgement"
          />
        </template>
      </AttachmentAttributesRow>
      <template v-if="!isNil(receipt)">
        <v-divider />
        <AttachmentAttributesRow :attachment="receipt">
          <template #append>
            <v-btn
              class="w-100 w-md-auto"
              prepend-icon="mdi-download"
              text="Download"
              title="Download signed confidentiality receipt"
              variant="outlined"
              color="secondary"
              :loading="isDownloadingReceipt"
              @click="downloadReceipt"
            />
          </template>
        </AttachmentAttributesRow>
      </template>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isNil } from "lodash"

import Api from "@/api"
import { type AttachmentAsReference } from "@/api/attachments-api"
import useAuthenticatedDownload from "@/use/utils/use-authenticated-download"

import AttachmentAttributesRow from "@/components/common/AttachmentAttributesRow.vue"

const props = defineProps<{
  informationSharingAgreementId: number
  acknowledgement: AttachmentAsReference
  receipt: AttachmentAsReference | null | undefined
}>()

const acknowledgementDownloadUrl = computed(() =>
  Api.Downloads.InformationSharingAgreements.signedConfidentialityAcknowledgementApi.downloadPath(
    props.informationSharingAgreementId
  )
)

const receiptDownloadUrl = computed(() =>
  Api.Downloads.InformationSharingAgreements.signedConfidentialityReceiptApi.downloadPath(
    props.informationSharingAgreementId
  )
)

const { submit: downloadAcknowledgement, isLoading: isDownloadingAcknowledgement } =
  useAuthenticatedDownload(acknowledgementDownloadUrl)

const { submit: downloadReceipt, isLoading: isDownloadingReceipt } =
  useAuthenticatedDownload(receiptDownloadUrl)
</script>
