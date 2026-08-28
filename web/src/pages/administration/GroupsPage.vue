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
          v-if="isSystemAdmin"
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
import useCurrentUser from "@/use/use-current-user"

const search = ref("")

const filters = computed(() => {
  if (isNil(search.value) || isEmpty(search.value)) return {}

  return {
    search: search.value,
  }
})

const { isSystemAdmin } = useCurrentUser<true>()

useBreadcrumbs("Groups", [
  ADMIN_CRUMB,
  {
    title: "Groups",
    to: {
      name: "administration/GroupsPage",
    },
  },
])
</script>
