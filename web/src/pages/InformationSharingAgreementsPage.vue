<template>
  <v-card class="border">
    <v-card-text>
      <div class="d-flex flex-wrap ga-4 mb-4">
        <FilterSearchDebouncedTextField
          v-model="search"
          label="Search"
          density="compact"
        />
        <v-btn
          color="primary"
          :to="{
            name: 'information-sharing-agreements/InformationSharingAgreementNewPage',
          }"
          style="height: 40px"
        >
          <span class="text-pre-wrap">New Agreement</span>
        </v-btn>
      </div>

      <InformationSharingAgreementsEditDataTableServer :filters="filters" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import FilterSearchDebouncedTextField from "@/components/common/tables/FilterSearchDebouncedTextField.vue"
import InformationSharingAgreementsEditDataTableServer from "@/components/information-sharing-agreements/InformationSharingAgreementsEditDataTableServer.vue"

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    search: search.value,
  }
})

useBreadcrumbs("Information Sharing Agreements", [BASE_CRUMB])
</script>
