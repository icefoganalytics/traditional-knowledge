<template>
  <div class="fill-height">
    <v-row
      class="h-100vh mh-100 auth my-0"
      :class="{ 'fill-height': !mdAndDown }"
    >
      <v-col
        cols="12"
        lg="8"
        xl="9"
        class="d-lg-flex align-center justify-center"
        style="overflow: hidden"
      >
        <v-icon
          class="d-none d-lg-flex"
          color="secondary"
          size="400"
          style="opacity: 1"
          >mdi-library</v-icon
        >
      </v-col>
      <v-col
        cols="12"
        lg="4"
        xl="3"
        class="d-flex align-center justify-center pl-0"
        style="border-left: 10px #466653 solid; background-color: #466653"
      >
        <div
          class="d-flex align-center justify-center py-5"
          style="width: 100%; background-color: #f9f4d4"
          :style="{
            borderLeft: mdAndDown ? '10px #466653 solid' : '10px #466653 solid',
            marginLeft: mdAndDown ? '16px' : '-20px',
            marginRight: mdAndDown ? '16px' : '0px',
          }"
        >
          <v-icon
            v-if="mdAndDown"
            color="secondary"
            :size="smAndUp ? 200 : 100"
            >mdi-library</v-icon
          >
          <div class="text-center">
            <h2 class="text-h3 font-weight-semibold mb-2">Yukon's {{ APPLICATION_NAME }}</h2>
            <div class="text-subtitle-1 mb-6 mt-n3 font-weight-bold">Yukon Government</div>
            <div class="mt-6 text-center">
              <v-btn
                color="primary"
                @click="loginWithRedirect"
              >
                Sign in
              </v-btn>
              <div class="text-subtitle-1 mt-5">Using your YNET Credentials</div>
              <v-divider class="my-2" />
              <em style="font-weight: 700">Secure Digital Storage</em>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useDisplay } from "vuetify/lib/framework.mjs"

import { APPLICATION_NAME } from "@/config"
import useCurrentUser from "@/use/use-current-user"

const { mdAndDown, smAndUp } = useDisplay()

const { reset: resetCurrentUser } = useCurrentUser()

const { loginWithRedirect } = useAuth0()

onMounted(() => {
  resetCurrentUser()
})
</script>
