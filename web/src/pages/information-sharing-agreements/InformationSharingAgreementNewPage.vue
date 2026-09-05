<template>
  <v-form
    ref="form"
    @submit.prevent="saveAndGoToEditPage"
  >
    <v-row class="mt-2">
      <v-col>
        <InformationSharingAgreementBasicInformationEditCard
          v-model:title="informationSharingAgreementAttributes.title"
          v-model:purpose="informationSharingAgreementAttributes.purpose"
          v-model:external-group-contact-id="
            informationSharingAgreementAttributes.externalGroupContactId
          "
          v-model:external-group-contact-title="
            informationSharingAgreementAttributes.externalGroupContactTitle
          "
          v-model:internal-group-contact-id="
            informationSharingAgreementAttributes.internalGroupContactId
          "
          v-model:internal-group-contact-title="
            informationSharingAgreementAttributes.internalGroupContactTitle
          "
          v-model:internal-group-secondary-contact-email="managerEmail"
          class="border"
        />
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
          Create
        </v-btn>
        <v-btn
          :to="cancelTo"
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
import { useRoute, useRouter } from "vue-router"
import { useDisplay } from "vuetify"
import { isEmpty, isNil, isString } from "lodash"

import { VForm } from "vuetify/components"

import informationSharingAgreementsApi, {
  type InformationSharingAgreement,
} from "@/api/information-sharing-agreements-api"
import usersApi from "@/api/users-api"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"

import InformationSharingAgreementBasicInformationEditCard from "@/components/information-sharing-agreements/InformationSharingAgreementBasicInformationEditCard.vue"

const informationSharingAgreementAttributes = ref<Partial<InformationSharingAgreement>>({
  title: undefined,
  purpose: undefined,
  externalGroupContactId: undefined,
  externalGroupContactTitle: undefined,
  internalGroupContactId: undefined,
  internalGroupContactTitle: undefined,
})

const managerEmail = ref<string | null | undefined>(undefined)

const form = useTemplateRef("form")
const isLoading = ref(false)
const snack = useSnack()
const route = useRoute()
const router = useRouter()

const cancelTo = computed(() => {
  const rawReturnTo = route.query.returnTo
  if (isNil(rawReturnTo) || isEmpty(rawReturnTo) || !isString(rawReturnTo)) {
    return { name: "InformationSharingAgreementsPage" }
  }

  return rawReturnTo
})

async function saveAndGoToEditPage() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    const attributes: Partial<InformationSharingAgreement> = {
      ...informationSharingAgreementAttributes.value,
    }
    if (!isNil(managerEmail.value) && !isEmpty(managerEmail.value)) {
      const { user } = await usersApi.ensureFromDirectory(managerEmail.value)
      attributes.internalGroupSecondaryContactId = user.id
    }
    const { informationSharingAgreement } =
      await informationSharingAgreementsApi.create(attributes)
    snack.success("Information Sharing Agreement created.")
    await router.push({
      name: "information-sharing-agreements/InformationSharingAgreementEditDurationPage",
      params: {
        informationSharingAgreementId: informationSharingAgreement.id,
      },
    })
  } catch (error) {
    console.error(`Failed to create information sharing agreement: ${error}`, { error })
    snack.error(`Failed to create information sharing agreement: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const { smAndDown } = useDisplay()

useBreadcrumbs("New Information Sharing Agreement", [
  BASE_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "InformationSharingAgreementsPage",
    },
  },
])
</script>
