<template>
  <ErrorPageLayout
    heading="Not Found (404)"
    :message="t('apiError.404')"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import ErrorPageLayout from "@/components/common/ErrorPageLayout.vue"

const { t } = useI18n()
</script>
