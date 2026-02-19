<template>
  <BaseActionsMenuBtnGroup
    primary-button-text="Edit Agreement"
    :primary-button-to="{
      name: 'information-sharing-agreements/InformationSharingAgreementEditPage',
      params: {
        informationSharingAgreementId,
      },
    }"
    :loading="isLoading"
  >
    <v-list-item
      :to="{
        name: 'information-sharing-agreements/InformationSharingAgreementSignPage',
        params: {
          informationSharingAgreementId,
        },
      }"
    >
      <v-list-item-title>Mark as Signed</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="success"
          icon="mdi-check-bold"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Mark this agreement as signed and publish agreement."
      />
    </v-list-item>
    <v-list-item
      :loading="isDownloadingDraft"
      @click="downloadDraft"
    >
      <v-list-item-title>Download Draft</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="secondary"
          icon="mdi-download"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Download a draft of the agreement for printing and signature."
      />
    </v-list-item>
    <v-list-item
      v-if="policy?.destroy"
      @click="deleteInformationSharingAgreement"
    >
      <v-list-item-title>Delete Agreement</v-list-item-title>
      <template #prepend>
        <v-icon
          size="small"
          color="error"
          icon="mdi-delete"
        />
      </template>
      <v-tooltip
        activator="parent"
        text="Permanently delete this agreement. This action cannot be undone."
      />
    </v-list-item>
  </BaseActionsMenuBtnGroup>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import { useRouter } from "vue-router"

import informationSharingAgreementsApi from "@/api/information-sharing-agreements-api"

import useAuthenticatedDownload from "@/use/utils/use-authenticated-download"

import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import BaseActionsMenuBtnGroup from "@/components/common/BaseActionsMenuBtnGroup.vue"

const props = defineProps<{
  informationSharingAgreementId: number
}>()

const _emit = defineEmits<{
  updated: [informationSharingAgreementId: number]
}>()

const { informationSharingAgreementId } = toRefs(props)
const { isLoading, policy } = useInformationSharingAgreement(informationSharingAgreementId)

const generateAcknowledgementUrl = computed(() =>
  informationSharingAgreementsApi.generateAcknowledgementPath(props.informationSharingAgreementId)
)
const { submit: downloadDraft, isLoading: isDownloadingDraft } = useAuthenticatedDownload(
  generateAcknowledgementUrl
)

const isDeleting = ref(false)
const snack = useSnack()
const router = useRouter()

async function deleteInformationSharingAgreement() {
  if (!confirm("Are you sure you want to delete this agreement?")) return

  isDeleting.value = true
  try {
    await informationSharingAgreementsApi.delete(informationSharingAgreementId.value)
    snack.success("Agreement deleted.")
    return router.push({
      name: "information-sharing-agreements/InformationSharingAgreementsPage",
    })
  } catch (error) {
    console.error(`Failed to delete agreement: ${error}`, { error })
    snack.error(`Failed to delete agreement: ${error}`)
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped></style>
