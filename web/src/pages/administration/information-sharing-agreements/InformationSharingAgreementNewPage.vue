<template>
  <InformationSharingAgreementCreateForm />
</template>

<script setup lang="ts">
import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"
import InformationSharingAgreementCreateForm from "@/components/information-sharing-agreements/InformationSharingAgreementCreateForm.vue"

useBreadcrumbs("New Information Sharing Agreement", [
  ADMIN_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "administration/InformationSharingAgreementsPage",
    },
  },
])
</script>
