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
        <div class="d-none d-lg-block text-secondary px-16">
          <p
            v-for="(paragraph, index) in disclaimerParagraphs"
            :key="index"
            class="text-h6 font-weight-regular mb-6"
          >
            {{ paragraph }}
          </p>
        </div>
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
            borderLeft: '10px #466653 solid',
            marginLeft: mdAndDown ? '16px' : '-20px',
            marginRight: mdAndDown ? '16px' : '0px',
          }"
        >
          <div class="text-center px-5">
            <h2 class="text-h3 font-weight-semibold mb-4 mx-10">Traditional Knowledge Vault</h2>
            <div class="mt-6 text-center">
              <v-btn
                class="text-none"
                color="primary"
                @click="doLogin"
              >
                Sign in
              </v-btn>
              <div class="text-subtitle-1 mt-5">Sign in using MyYukon Credentials</div>
              <v-divider class="my-2" />
              <em style="font-weight: 700">
                The MyYukon service is being used for safe and secure access to the TK Vault. The TK
                Vault is a shared space for intergovernmental collaboration and is not publicly
                accessible
              </em>
            </div>

            <template v-if="mdAndDown">
              <v-divider class="my-5" />

              <div class="text-caption text-left text-secondary">
                <p
                  v-for="(paragraph, index) in disclaimerParagraphs"
                  :key="index"
                  class="mb-2"
                >
                  {{ paragraph }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue"
import { useAuth0 } from "@auth0/auth0-vue"
import { useDisplay } from "vuetify"

import useCurrentUser from "@/use/use-current-user"

const { mdAndDown } = useDisplay()

const { reset: resetCurrentUser } = useCurrentUser()

const { loginWithRedirect } = useAuth0()

const disclaimerParagraphs = [
  "The Vault is a secure digital storage mechanism intended to improve how the Government of Yukon reflects, respects and protects Traditional Knowledge in a way that is authorized, appropriate and accountable.",
  "It is important to note that the Traditional Knowledge contents within have been shared under a government-to-government Information Sharing Agreement that sets out the commitments and responsibilities each government has agreed to uphold.",
  "By logging in, you acknowledge and agree to uphold the commitments made by your respective government as set out in the terms and conditions of the relevant Information Sharing Agreement.",
]

onMounted(() => {
  resetCurrentUser()
})

function doLogin() {
  loginWithRedirect({
    appState: { target: "/dashboard" },
  })
}
</script>
