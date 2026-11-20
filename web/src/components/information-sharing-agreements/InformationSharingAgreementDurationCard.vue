<template>
  <v-card>
    <v-card-title class="bg-grey-lighten-4 d-flex align-center ga-3 px-6 py-4 text-wrap">
      <v-icon color="accent">mdi-clock-outline</v-icon>
      <span>{{ expirySentence }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6 pa-md-8">
      <v-alert
        variant="tonal"
        class="rounded-lg"
      >
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <div>The above information reflects the details of the current ISA</div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { DateTime } from "luxon"
import { isNil } from "lodash"

import { InformationSharingAgreementExpirationConditions } from "@/api/information-sharing-agreements-api"

const props = defineProps<{
  expirationCondition: InformationSharingAgreementExpirationConditions | null | undefined
  endDate: string | null | undefined
}>()

const formattedEndDate = computed(() => {
  if (isNil(props.endDate)) return null

  const date = DateTime.fromISO(props.endDate)
  if (!date.isValid) return props.endDate

  return date.toFormat("MMMM d, yyyy")
})

const expirySentence = computed(() => {
  if (isNil(formattedEndDate.value)) {
    return "This ISA does not have an expiry date configured"
  }

  if (
    props.expirationCondition ===
    InformationSharingAgreementExpirationConditions.COMPLETION_OF_PURPOSE
  ) {
    return `This ISA will expire on the completion of the YG purpose estimated to be ${formattedEndDate.value}`
  }

  return `This ISA will expire on ${formattedEndDate.value}`
})
</script>
