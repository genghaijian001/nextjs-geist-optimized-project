<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow p-4 flex space-x-4">
      <router-link to="/" class="text-gray-700 hover:text-black">Vouchers</router-link>
      <router-link to="/inventory" class="text-gray-700 hover:text-black">Inventory</router-link>
    </nav>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
</style>
