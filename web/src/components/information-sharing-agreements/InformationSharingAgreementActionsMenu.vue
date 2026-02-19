<template>
  <InformationSharingAgreementDraftActionsMenu
    v-if="informationSharingAgreementStatus === InformationSharingAgreementStatuses.DRAFT"
    :information-sharing-agreement-id="informationSharingAgreementId"
  />
  <BaseActionsMenuBtnGroup
    v-else
    primary-button-text="Error"
    color="error"
    :primary-button-props="{
      prependIcon: 'mdi-alert-circle',
      title: 'This agreement has an unrecognized status and cannot be acted upon.',
    }"
    :open-menu-button-props="{
      disabled: true,
    }"
  />
</template>

<script setup lang="ts">
import { InformationSharingAgreementStatuses } from "@/use/use-information-sharing-agreement"

import BaseActionsMenuBtnGroup from "@/components/common/BaseActionsMenuBtnGroup.vue"

import InformationSharingAgreementDraftActionsMenu from "@/components/information-sharing-agreements/draft/InformationSharingAgreementDraftActionsMenu.vue"

defineProps<{
  informationSharingAgreementId: number
  informationSharingAgreementStatus: InformationSharingAgreementStatuses
}>()
</script>

<style scoped></style>
