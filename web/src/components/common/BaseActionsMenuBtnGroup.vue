<template>
  <!--
    TODO: figure out how to make the various colors of this component more configurable.
    I might need to go back to the Vuetify basics and just support the "color" prop,
    and customize the "variant" so that it looks right for a given color.
  -->
  <v-btn-group
    :class="['d-flex my-0 border-sm border-opacity-100', borderColorClass, textColorClass]"
    :color="color"
    density="comfortable"
    divided
    variant="tonal"
  >
    <v-btn
      :class="['flex-grow-1', borderColorClass, textColorClass]"
      :color="color"
      :to="primaryButtonTo"
      :loading="loading"
      v-bind="primaryButtonProps"
      @click="emit('click')"
    >
      {{ primaryButtonText }}
    </v-btn>
    <v-btn
      :class="[borderColorClass, textColorClass]"
      :color="color"
      icon="mdi-chevron-down"
      size="large"
      :loading="loading"
      :disabled="!$slots.default"
      v-bind="openMenuButtonProps"
    >
      <v-icon size="large" />

      <v-menu
        location="bottom"
        activator="parent"
        v-bind="menuProps"
      >
        <v-list
          variant="elevated"
          class="py-0"
        >
          <slot></slot>
        </v-list>
      </v-menu>
    </v-btn>
    <!-- Place to put dialogs so they don't get removed from DOM when the menu closes -->
    <slot name="dialogs"></slot>
  </v-btn-group>
</template>

<script lang="ts">
import { type ButtonHTMLAttributes } from "vue"
import { type VBtn } from "vuetify/components"

type PrimaryButtonProps = VBtn["$props"] & ButtonHTMLAttributes
export { type PrimaryButtonProps } // two line type definition avoids breaking Vue syntax highlighting
</script>

<script setup lang="ts">
import { toRefs } from "vue"
import { type RouteLocationRaw } from "vue-router"

import { type VMenu } from "vuetify/components"

import useVuetifyColorClassesAsSpecificColorClasses from "@/use/utils/use-vuetify-color-classes-as-specific-color-classes"

const props = withDefaults(
  defineProps<{
    primaryButtonText: string
    primaryButtonTo?: RouteLocationRaw
    loading?: boolean
    color?: string
    textColor?: string
    primaryButtonProps?: PrimaryButtonProps
    openMenuButtonProps?: VBtn["$props"]
    menuProps?: VMenu["$props"]
  }>(),
  {
    primaryButtonTo: undefined,
    loading: false,
    color: "primary",
    textColor: (props) => props.color || "primary",
    primaryButtonProps: () => ({}),
    openMenuButtonProps: () => ({}),
    menuProps: () => ({}),
  }
)

const emit = defineEmits<{
  click: [void]
}>()

const { textColor } = toRefs(props)
const borderColorClass = useVuetifyColorClassesAsSpecificColorClasses(textColor, "border")
const textColorClass = useVuetifyColorClassesAsSpecificColorClasses(textColor, "text")
</script>

<style scoped>
/* infers color from button text color so white text will produce a white border */
.v-btn-group--divided .v-btn:not(:last-child) {
  border-inline-end: 1px solid currentColor;
}
</style>
