<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    @submit.prevent="signAndRedirect"
  >
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <p class="mb-4">Upload the signed document(s) to mark this agreement as signed.</p>

        <EnhancedFileInput
          v-model="signedConfidentialityAcknowledgement"
          label="Signed Confidentiality Acknowledgement"
          :rules="[required]"
          accept=".pdf,.doc,.docx"
          show-size
          required
          validate-on="submit"
        />

        <EnhancedFileInput
          v-if="isConfidentialityTypeAcceptedInConfidence"
          v-model="signedConfidentialityReceipt"
          class="mt-4"
          label="Signed Confidentiality Receipt"
          :rules="[required]"
          accept=".pdf,.doc,.docx"
          show-size
          required
          validate-on="submit"
        />

        <div class="mt-6">
          <p class="font-weight-bold mb-1">Download Documents</p>
          <p class="text-body-2 text-medium-emphasis mb-3">
            If you haven't already downloaded the necessary document(s) for signing, you can do so
            below:
          </p>
          <div class="d-flex flex-column ga-2">
            <InformationSharingAgreementConfidentialityAcknowledgementDownloadButton
              :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
              :activator-props="{
                variant: 'text',
                color: 'secondary',
                density: 'compact',
                prependIcon: 'mdi-download',
              }"
            />
            <InformationSharingAgreementConfidentialityReceiptGenerateButton
              v-if="isConfidentialityTypeAcceptedInConfidence"
              :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
              :activator-props="{
                variant: 'text',
                color: 'secondary',
                density: 'compact',
                prependIcon: 'mdi-download',
              }"
            />
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex flex-column flex-md-row ga-3">
        <v-btn
          color="primary"
          type="submit"
          :loading="isLoading"
          :block="smAndDown"
        >
          Mark as Signed
        </v-btn>
        <v-btn
          :to="returnTo"
          color="secondary"
          variant="outlined"
          :loading="isLoading"
          :block="smAndDown"
        >
          Cancel
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue"
import { useRouter } from "vue-router"
import { useRouteQuery } from "@vueuse/router"
import { useDisplay } from "vuetify"
import { isNil } from "lodash"

import { formatInformationSharingAgreementNumber } from "@/utils/formatters"
import { required } from "@/utils/validators"

import informationSharingAgreementsApi, {
  InformationSharingAgreementConfidentialityType,
} from "@/api/information-sharing-agreements-api"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import EnhancedFileInput from "@/components/common/EnhancedFileInput.vue"
import InformationSharingAgreementConfidentialityAcknowledgementDownloadButton from "@/components/information-sharing-agreements/draft/InformationSharingAgreementConfidentialityAcknowledgementDownloadButton.vue"
import InformationSharingAgreementConfidentialityReceiptGenerateButton from "@/components/information-sharing-agreements/draft/InformationSharingAgreementConfidentialityReceiptGenerateButton.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)
const { informationSharingAgreement, isLoading } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const isConfidentialityTypeAcceptedInConfidence = computed(
  () =>
    informationSharingAgreement.value?.confidentialityType ===
    InformationSharingAgreementConfidentialityType.ACCEPTED_IN_CONFIDENCE
)

const router = useRouter()
const defaultReturnTo = computed(() => {
  const routeLocation = router.resolve({
    name: "information-sharing-agreements/InformationSharingAgreementPage",
    params: {
      informationSharingAgreementId: props.informationSharingAgreementId,
    },
  })
  return routeLocation.href
})
const returnTo = useRouteQuery("returnTo", defaultReturnTo)

const signedConfidentialityAcknowledgement = ref<File | null>(null)
const signedConfidentialityReceipt = ref<File | null>(null)
const form = useTemplateRef("form")
const snack = useSnack()

async function signAndRedirect() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) return

  if (isNil(signedConfidentialityAcknowledgement.value)) {
    throw new Error("Signed confidentiality acknowledgement is required")
  }

  isLoading.value = true
  try {
    await informationSharingAgreementsApi.sign(informationSharingAgreementIdAsNumber.value, {
      signedConfidentialityAcknowledgement: signedConfidentialityAcknowledgement.value,
      signedConfidentialityReceipt: signedConfidentialityReceipt.value,
    })
    snack.success("Agreement marked as signed!")

    await router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to sign agreement: ${error}`, { error })
    snack.error(`Failed to sign agreement: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const pageTitle = computed(() => {
  if (isNil(informationSharingAgreement.value)) {
    return "loading..."
  }

  const { id, title } = informationSharingAgreement.value
  return `Mark as Signed: ${formatInformationSharingAgreementNumber(id)} - ${title}`
})

useBreadcrumbs(pageTitle, [
  BASE_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "InformationSharingAgreementsPage",
    },
  },
])

const { smAndDown } = useDisplay()
</script>
