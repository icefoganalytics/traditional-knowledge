<template>
  <ErrorPageLayout
    heading="Server Error (500)"
    :message="t('apiError.500')"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import ErrorPageLayout from "@/components/common/ErrorPageLayout.vue"

const { t } = useI18n()
</script>
