<template>
  <AuthenticatedPostForm
    :action-url="generateConfidentialityAcknowledgementUrl"
    text="Download Information Sharing Agreement"
    :activator-props="{
      title: 'Download the information sharing agreement for printing and signature',
      ...activatorProps,
    }"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import informationSharingAgreementsApi from "@/api/information-sharing-agreements-api"

import AuthenticatedPostForm, {
  type ActivatorProps,
} from "@/components/common/AuthenticatedPostForm.vue"

const props = withDefaults(
  defineProps<{
    informationSharingAgreementId: number
    activatorProps?: ActivatorProps
  }>(),
  {
    activatorProps: () => ({}),
  }
)

const generateConfidentialityAcknowledgementUrl = computed(() =>
  informationSharingAgreementsApi.generateConfidentialityAcknowledgementPath(
    props.informationSharingAgreementId
  )
)
</script>
