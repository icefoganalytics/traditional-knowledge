<template>
  <v-card>
    <v-card-title class="bg-grey-lighten-4 d-flex align-center ga-3 px-6 py-4 text-wrap">
      <v-icon color="accent">mdi-lock-outline</v-icon>
      <span>{{ confidentialitySentence }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6 pa-md-8">
      <div class="text-body-2 text-grey-darken-1 mb-2">
        This TK is intended to be reflected or considered to:
      </div>
      <div class="text-grey-darken-3 whitespace-pre-wrap">
        {{ authorizedApplication || "Not specified" }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { InformationSharingAgreementConfidentialityType } from "@/api/information-sharing-agreements-api"

const props = defineProps<{
  confidentialityType: InformationSharingAgreementConfidentialityType | null | undefined
  authorizedApplication: string | null | undefined
}>()

const confidentialitySentence = computed(() => {
  switch (props.confidentialityType) {
    case InformationSharingAgreementConfidentialityType.ACCORDANCE:
      return "This TK is being accepted in accordance with the terms and conditions of this ISA."
    case InformationSharingAgreementConfidentialityType.ACCEPTED_IN_CONFIDENCE:
      return "This TK is being formally accepted in confidence. Please refer to the Confidentiality Receipt for more details."
    default:
      return "Confidentiality is not configured"
  }
})
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap; /* preserves line breaks and wraps text if it's too long */
}
</style>
