<template>
  <v-skeleton-loader
    v-if="isNil(informationSharingAgreement)"
    type="table"
  />
  <v-alert
    v-else-if="isNil(groupId)"
    type="error"
    title="We could not determine your group ID for this information sharing agreement."
  />
  <v-alert
    v-else-if="!isGroupAdminFor(groupId)"
    type="error"
    title="You are not a group admin for this information sharing agreement."
  />
  <InformationSharingAgreementAccessGrantCreateForm
    v-else
    :information-sharing-agreement-id="informationSharingAgreementIdAsNumber"
    :group-id="groupId"
  />
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import { formatInformationSharingAgreementNumber } from "@/utils/formatters"
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useInformationSharingAgreement from "@/use/use-information-sharing-agreement"

import InformationSharingAgreementAccessGrantCreateForm from "@/components/information-sharing-agreement-access-grants/InformationSharingAgreementAccessGrantCreateForm.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementId)
)

const { currentUser, isGroupAdminFor } = useCurrentUser<true>()

const { informationSharingAgreement } = useInformationSharingAgreement(
  informationSharingAgreementIdAsNumber
)

const groupId = computed(() => {
  if (isNil(informationSharingAgreement.value)) return null

  const { externalGroupId, internalGroupId } = informationSharingAgreement.value

  if (currentUser.value.isExternal) {
    return externalGroupId
  } else {
    return internalGroupId
  }
})

useBreadcrumbs("Grant Access", [
  ADMIN_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "administration/InformationSharingAgreementsPage",
    },
  },
  {
    title: formatInformationSharingAgreementNumber(informationSharingAgreementIdAsNumber.value),
    to: {
      name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
      params: {
        informationSharingAgreementId: props.informationSharingAgreementId,
      },
    },
  },
])
</script>
