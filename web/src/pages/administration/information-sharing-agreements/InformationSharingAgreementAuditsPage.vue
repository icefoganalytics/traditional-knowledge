<template>
  <InformationSharingAgreementAuditCard
    :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
  />
</template>

<script lang="ts" setup>
import { computed } from "vue"

import { formatInformationSharingAgreementNumber } from "@/utils/formatters"

import InformationSharingAgreementAuditCard from "@/components/information-sharing-agreements/InformationSharingAgreementAuditCard.vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)

const informationSharingAgreementNumber = computed(() =>
  formatInformationSharingAgreementNumber(informationSharingAgreementIdAsNumber.value)
)

useBreadcrumbs(
  computed(() => `${informationSharingAgreementNumber.value} - Audit`),
  computed(() => [
    ADMIN_CRUMB,
    {
      title: "Information Sharing Agreements",
      to: {
        name: "administration/InformationSharingAgreementsPage",
      },
    },
    {
      title: informationSharingAgreementNumber.value,
      to: {
        name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
        params: {
          informationSharingAgreementId: props.informationSharingAgreementId,
        },
      },
    },
  ])
)
</script>
