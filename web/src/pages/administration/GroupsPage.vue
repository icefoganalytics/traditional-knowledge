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
            name: 'administration/groups/GroupNewPage',
          }"
          style="height: 40px"
        >
          New Group
        </v-btn>
      </div>

      <GroupsEditDataTableServer :filters="filters" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import FilterSearchDebouncedTextField from "@/components/common/tables/FilterSearchDebouncedTextField.vue"
import GroupsEditDataTableServer from "@/components/groups/GroupsEditDataTableServer.vue"

import useBreadcrumbs, { ADMIN_CRUMB } from "@/use/use-breadcrumbs"

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    search: search.value,
  }
})

useBreadcrumbs("Groups", [ADMIN_CRUMB])
</script>
