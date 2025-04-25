<template>
  <v-skeleton-loader
    v-if="isNil(group)"
    type="card"
  />
  <v-card v-else>
    <v-card-title>Group Details</v-card-title>
    <v-card-text>
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

      <v-row>
        <v-col class="d-flex justify-end">
          <v-btn
            :loading="isLoading"
            color="secondary"
            variant="outlined"
            v-bind="cancelButtonProps"
          >
            Return
          </v-btn>
          <v-spacer />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { toRefs } from "vue"

import { type VBtn } from "vuetify/lib/components/index.mjs"

import useGroup from "@/use/use-group"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

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
