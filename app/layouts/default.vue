<template>
  <div>
    <AppHeader />
        <GoogleAd variant="horizontal" />
    <UMain>
      <slot />
    </UMain>
        <GoogleAd variant="horizontal" />
    <AppFooter />
  </div>
</template>
