<script setup lang="ts">
useSeoMeta({
  title: 'Terms of Service - Minsik',
  description: 'Terms of Service for Minsik - the book discovery platform.',
})

const useProhibitions = [
  'Post false, misleading, or harmful content',
  'Attempt to gain unauthorized access to any part of the Service',
  'Use automated bots or scripts to scrape or interact with the Service',
  'Harass, abuse, or harm other users',
  'Violate any applicable local, national, or international law',
]
</script>

<template>
  <v-container
    class="py-12"
    max-width="800"
  >
    <v-row justify="center">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">
          Terms of Service
        </h1>

        <p class="text-body-2 text-secondary mb-8">
          Last updated: February 28, 2026
        </p>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            1. Acceptance of Terms
          </h2>

          <p class="text-body-2">
            By accessing or using Minsik ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            2. Use of the Service
          </h2>

          <p class="text-body-2 mb-3">
            You agree to use the Service only for lawful purposes and in a manner that does not infringe on the rights of others. You must not:
          </p>

          <v-list
            density="compact"
            class="pa-0"
          >
            <v-list-item
              v-for="item in useProhibitions"
              :key="item"
              :title="item"
              prepend-icon="mdi-close-circle-outline"
              class="px-0"
            />
          </v-list>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            3. User Accounts
          </h2>

          <p class="text-body-2">
            To access certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            4. User-Generated Content
          </h2>

          <p class="text-body-2">
            By submitting reviews, ratings, comments, or other content to the Service, you grant Minsik a non-exclusive, royalty-free, worldwide license to use, display, and distribute that content in connection with the Service. You represent that you own or have the necessary rights to the content you submit.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            5. Intellectual Property
          </h2>

          <p class="text-body-2">
            The Service and its original content, features, and functionality are owned by Minsik and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            6. Disclaimer of Warranties
          </h2>

          <p class="text-body-2">
            The Service is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. Minsik does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            7. Limitation of Liability
          </h2>

          <p class="text-body-2">
            To the fullest extent permitted by law, Minsik shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            8. Changes to Terms
          </h2>

          <p class="text-body-2">
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
          </p>
        </v-card>

        <v-card
          variant="outlined"
          class="mb-6 pa-6"
        >
          <h2 class="text-h6 font-weight-bold mb-3">
            9. Contact Us
          </h2>

          <p class="text-body-2">
            If you have any questions about these Terms, please contact us through our
            <a
              href="https://jakubtutka.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >website</a>.
          </p>
        </v-card>

        <div class="d-flex mt-8 justify-center">
          <v-btn
            variant="outlined"
            to="/"
            prepend-icon="mdi-arrow-left"
          >
            Back to Home
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
