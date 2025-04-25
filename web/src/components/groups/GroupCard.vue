<template>
  <v-skeleton-loader
    v-if="isNil(group)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Group Details"
  >
    <template #header-actions>
      <v-btn
        :to="{
          name: 'administration/groups/GroupEditPage',
          params: {
            groupId,
          },
        }"
        color="primary"
      >
        Edit
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <DescriptionElement
          label="Name"
          :model-value="group.name"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          label="Acronym"
          :model-value="group.acronym"
          vertical
        />
      </v-col>
      <v-col cols="12">
        <DescriptionElement
          label="Description"
          :model-value="group.description"
          vertical
        />
      </v-col>
    </v-row>

    <template #actions>
      <v-btn
        :loading="isLoading"
        color="secondary"
        variant="outlined"
        v-bind="cancelButtonProps"
      >
        Return
      </v-btn>
      <v-spacer />
    </template>
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { toRefs } from "vue"

import { type VBtn } from "vuetify/lib/components/index.mjs"

import useGroup from "@/use/use-group"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

type CancelButtonOptions = VBtn["$props"]

const props = withDefaults(
  defineProps<{
    groupId: number
    cancelButtonProps?: CancelButtonOptions
  }>(),
  {
    cancelButtonProps: () => ({
      to: {
        name: "administration/GroupsPage",
      },
    }),
  }
)

const { groupId } = toRefs(props)
const { group, isLoading } = useGroup(groupId)
</script>
