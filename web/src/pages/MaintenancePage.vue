<template>
  <ErrorPageLayout
    heading="Temporarily Unavailable (503)"
    :message="t('apiError.503')"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import ErrorPageLayout from "@/components/common/ErrorPageLayout.vue"

const { t } = useI18n()
</script>
