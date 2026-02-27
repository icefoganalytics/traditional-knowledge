<template>
  <InformationSharingAgreementCreateArchiveItemForm
    :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import InformationSharingAgreementCreateArchiveItemForm from "@/components/information-sharing-agreements/archive-items/InformationSharingAgreementArchiveItemCreateForm.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() => parseInt(props.informationSharingAgreementId))

useBreadcrumbs("Create Knowledge Item from Agreement", [
  BASE_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "InformationSharingAgreementsPage",
    },
  },
  {
    title: `Agreement ${props.informationSharingAgreementId}`,
    to: {
      name: "information-sharing-agreements/InformationSharingAgreementPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    },
  },
])
</script>
