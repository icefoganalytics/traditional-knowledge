<template>
  <v-card>
    <v-card-title class="bg-grey-lighten-4 d-flex align-center ga-3 px-6 py-4">
      <v-icon color="accent">mdi-clipboard-text-outline</v-icon>
      <span>Additional Details</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6 pa-md-8">
      <div>
        <div class="text-overline text-grey-darken-1 mb-2">
          2. Level of detail appropriate for the Traditional Knowledge (TK)
        </div>
        <ul
          v-if="!isEmpty(detailLevelLabels)"
          class="ms-4"
        >
          <li
            v-for="label of detailLevelLabels"
            :key="label"
          >
            {{ label }}
          </li>
        </ul>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
        <div
          v-if="!isEmpty(detailNotes)"
          class="mt-2"
        >
          <div class="text-body-2 text-grey-darken-1">Additional requirements</div>
          <div class="text-grey-darken-3 whitespace-pre-wrap">{{ detailNotes }}</div>
        </div>
      </div>

      <v-divider class="my-6" />

      <div>
        <div class="text-overline text-grey-darken-1 mb-2">
          3. Format(s) the Traditional Knowledge (TK) is shared in
        </div>
        <ul
          v-if="!isEmpty(formatLabels)"
          class="ms-4"
        >
          <li
            v-for="label of formatLabels"
            :key="label"
          >
            {{ label }}
          </li>
        </ul>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
      </div>

      <v-divider class="my-6" />

      <div>
        <div class="text-overline text-grey-darken-1 mb-2">
          7. Any reference to the Traditional Knowledge (TK) is credited to
        </div>
        <ul
          v-if="!isEmpty(creditLineLabels)"
          class="ms-4"
        >
          <li
            v-for="label of creditLineLabels"
            :key="label"
          >
            {{ label }}
          </li>
        </ul>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
        <div
          v-if="!isEmpty(creditNotes)"
          class="mt-2"
        >
          <div class="text-body-2 text-grey-darken-1">Credit details</div>
          <div class="text-grey-darken-3 whitespace-pre-wrap">{{ creditNotes }}</div>
        </div>
      </div>

      <v-divider class="my-6" />

      <div>
        <div class="text-overline text-grey-darken-1 mb-2">8. Expiration notifications</div>
        <ul
          v-if="!isEmpty(expirationActionLabels)"
          class="ms-4"
        >
          <li
            v-for="label of expirationActionLabels"
            :key="label"
          >
            {{ label }}
          </li>
        </ul>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
        <div
          v-if="!isEmpty(expirationNotes)"
          class="mt-2"
        >
          <div class="text-body-2 text-grey-darken-1">Additional expiration requirements</div>
          <div class="text-grey-darken-3 whitespace-pre-wrap">{{ expirationNotes }}</div>
        </div>
      </div>

      <v-divider class="my-6" />

      <div>
        <div class="text-overline text-grey-darken-1 mb-2">
          9. In the event of a breach or violation of this agreement
        </div>
        <ul
          v-if="!isEmpty(breachActionLabels)"
          class="ms-4"
        >
          <li
            v-for="label of breachActionLabels"
            :key="label"
          >
            {{ label }}
          </li>
        </ul>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
        <div
          v-if="!isEmpty(breachNotes)"
          class="mt-2"
        >
          <div class="text-body-2 text-grey-darken-1">Additional breach measures</div>
          <div class="text-grey-darken-3 whitespace-pre-wrap">{{ breachNotes }}</div>
        </div>
      </div>

      <v-divider class="my-6" />

      <div>
        <div class="text-overline text-grey-darken-1 mb-2">10. Compelled disclosure</div>
        <div
          v-if="!isEmpty(disclosureNotes)"
          class="text-grey-darken-3 whitespace-pre-wrap"
        >
          {{ disclosureNotes }}
        </div>
        <div
          v-else
          class="text-grey-darken-3"
        >
          Not specified
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { isEmpty, isNil } from "lodash"

import {
  InformationSharingAgreementBreachActions,
  InformationSharingAgreementCreditLines,
  InformationSharingAgreementDetailLevels,
  InformationSharingAgreementExpirationActions,
  InformationSharingAgreementFormats,
} from "@/api/information-sharing-agreement-options"

const props = defineProps<{
  detailLevel: string | null | undefined
  detailNotes: string | null | undefined
  formats: string | null | undefined
  creditLines: string | null | undefined
  creditNotes: string | null | undefined
  expirationActions: string | null | undefined
  expirationNotes: string | null | undefined
  breachActions: string | null | undefined
  breachNotes: string | null | undefined
  disclosureNotes: string | null | undefined
}>()

const { t } = useI18n()

/** Maps a comma-joined column to its translated option labels. See TK-44. */
function selectedLabels(
  commaJoinedValues: string | null | undefined,
  translationKey: string,
  allowedValues: string[]
): string[] {
  if (isNil(commaJoinedValues) || isEmpty(commaJoinedValues)) return []

  return commaJoinedValues
    .split(",")
    .filter((value) => allowedValues.includes(value))
    .map((value) => t(`informationSharingAgreement.${translationKey}.${value}`))
}

const detailLevelLabels = computed(() =>
  selectedLabels(
    props.detailLevel,
    "detailLevels",
    Object.values(InformationSharingAgreementDetailLevels)
  )
)
const formatLabels = computed(() =>
  selectedLabels(props.formats, "formats", Object.values(InformationSharingAgreementFormats))
)
const creditLineLabels = computed(() =>
  selectedLabels(
    props.creditLines,
    "creditLines",
    Object.values(InformationSharingAgreementCreditLines)
  )
)
const expirationActionLabels = computed(() =>
  selectedLabels(
    props.expirationActions,
    "expirationActions",
    Object.values(InformationSharingAgreementExpirationActions)
  )
)
const breachActionLabels = computed(() =>
  selectedLabels(
    props.breachActions,
    "breachActions",
    Object.values(InformationSharingAgreementBreachActions)
  )
)
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap; /* preserves line breaks and wraps long text */
}
</style>
