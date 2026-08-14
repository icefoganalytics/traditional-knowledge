<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    @submit.prevent="saveAndGoToAgreementPage"
  >
    <v-row>
      <v-col cols="12">
        <p class="text-body-2 text-medium-emphasis">
          These sections are optional. Completing them produces a complete draft agreement
          when you download it.
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          2. What level of detail is appropriate for the Traditional Knowledge (TK) being
          received into Yukon Government's conditional custody?
        </h3>
        <CommaJoinedCheckboxGroup
          v-model="informationSharingAgreement.detailLevel"
          :options="detailLevelOptions"
        />
        <v-textarea
          v-model="informationSharingAgreement.detailNotes"
          label="Additional requirements"
          hint="For example, if review, approval or confirmation is required when Traditional Knowledge is summarized."
          persistent-hint
          rows="3"
          auto-grow
        />
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          3. Traditional Knowledge (TK) is shared in the following format(s)
        </h3>
        <CommaJoinedCheckboxGroup
          v-model="informationSharingAgreement.formats"
          :options="formatOptions"
        />
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          7. Any reference to the Traditional Knowledge (TK) provided shall be acknowledged
          with due credit and belonging to
        </h3>
        <CommaJoinedCheckboxGroup
          v-model="informationSharingAgreement.creditLines"
          :options="creditLineOptions"
        />
        <v-textarea
          v-model="informationSharingAgreement.creditNotes"
          label="Credit details"
          rows="3"
          auto-grow
        />
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          8. Expiration notifications
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-2">
          By default, completion or expiration of this agreement permanently removes the
          Traditional Knowledge from the Vault. Select any notifications that apply.
        </p>
        <CommaJoinedCheckboxGroup
          v-model="informationSharingAgreement.expirationActions"
          :options="expirationActionOptions"
        />
        <v-textarea
          v-model="informationSharingAgreement.expirationNotes"
          label="Additional expiration requirements"
          rows="3"
          auto-grow
        />
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          9. In the event of a breach or violation of this agreement
        </h3>
        <CommaJoinedCheckboxGroup
          v-model="informationSharingAgreement.breachActions"
          :options="breachActionOptions"
        />
        <v-textarea
          v-model="informationSharingAgreement.breachNotes"
          label="Additional breach measures"
          rows="3"
          auto-grow
        />
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <v-row>
      <v-col cols="12">
        <h3 class="text-subtitle-1 font-weight-bold">
          10. Compelled disclosure
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-2">
          Under Yukon legislation, Yukon Government could be compelled to disclose
          information in its custody. Indicate if additional protocols may be required.
        </p>
        <v-textarea
          v-model="informationSharingAgreement.disclosureNotes"
          label="Additional disclosure protocols"
          rows="3"
          auto-grow
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
          Save
        </v-btn>
        <v-btn
          :to="{
            name: 'information-sharing-agreements/InformationSharingAgreementEditPage',
            params: {
              informationSharingAgreementId,
            },
          }"
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
import { computed, useTemplateRef } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useDisplay } from "vuetify"
import { isNil } from "lodash"

import {
  InformationSharingAgreementBreachActions,
  InformationSharingAgreementCreditLines,
  InformationSharingAgreementDetailLevels,
  InformationSharingAgreementExpirationActions,
  InformationSharingAgreementFormats,
} from "@/api/information-sharing-agreement-options"

import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"
import useSnack from "@/use/use-snack"

import CommaJoinedCheckboxGroup from "@/components/common/CommaJoinedCheckboxGroup.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)
const { informationSharingAgreement, isLoading, save } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const { t } = useI18n()

function buildOptions(values: string[], translationKey: string) {
  return values.map((value) => ({
    value,
    label: t(`informationSharingAgreement.${translationKey}.${value}`),
  }))
}

const detailLevelOptions = computed(() =>
  buildOptions(Object.values(InformationSharingAgreementDetailLevels), "detailLevels")
)
const formatOptions = computed(() =>
  buildOptions(Object.values(InformationSharingAgreementFormats), "formats")
)
const creditLineOptions = computed(() =>
  buildOptions(Object.values(InformationSharingAgreementCreditLines), "creditLines")
)
const expirationActionOptions = computed(() =>
  buildOptions(Object.values(InformationSharingAgreementExpirationActions), "expirationActions")
)
const breachActionOptions = computed(() =>
  buildOptions(Object.values(InformationSharingAgreementBreachActions), "breachActions")
)

const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function saveAndGoToAgreementPage() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  try {
    await save()
    snack.success("Additional details updated.")

    await router.push({
      name: "information-sharing-agreements/InformationSharingAgreementPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    })
  } catch (error) {
    console.error(`Failed to update additional details: ${error}`, { error })
    snack.error(`Failed to update additional details: ${error}`)
  }
}

const { smAndDown } = useDisplay()
</script>
