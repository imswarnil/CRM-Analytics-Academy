<template>
  <ClientOnly>
    <div class="relative">
      <UPageCard
        variant="subtle"
        class="rounded-2xl overflow-hidden"
      >
        <!-- 16:9 responsive wrapper -->
        <div
          class="w-full"
          style="position: relative; padding-bottom: 56.25%; height: 0;"
        >
          <iframe
            src="https://www.youtube.com/embed/aPwndqsmaGk"
            title="Learn Salesforce CRM Analytics From Scratch – Intro Video"
            frameborder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"
          ></iframe>
        </div>
      </UPageCard>
    </div>
  </ClientOnly>
</template>
