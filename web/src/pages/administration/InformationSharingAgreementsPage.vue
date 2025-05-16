<template>
  <v-card>
    <v-card-text>
      <div class="d-flex">
        <FilterSearchDebouncedTextField
          v-model="search"
          class="mb-4 mr-5"
          label="Search"
          density="compact"
        />
        <v-btn
          color="primary"
          :to="{
            name: 'administration/information-sharing-agreements/InformationSharingAgreementNewPage',
          }"
          style="height: 40px"
        >
          New Information Sharing Agreement
        </v-btn>
      </div>

      <InformationSharingAgreementsEditDataTableServer :filters="filters" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

import FilterSearchDebouncedTextField from "@/components/common/tables/FilterSearchDebouncedTextField.vue"
import InformationSharingAgreementsEditDataTableServer from "@/components/information-sharing-agreements/InformationSharingAgreementsEditDataTableServer.vue"

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    search: search.value,
  }
})

useBreadcrumbs("Groups", [ADMIN_CRUMB])
</script>
