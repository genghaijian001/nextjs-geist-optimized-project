<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Inventory</h1>
    <form @submit.prevent="addInbound" class="mb-6 space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label class="block mb-1 font-semibold">Warehouse ID</label>
        <input v-model.number="inbound.warehouseId" type="number" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Operator ID</label>
        <input v-model.number="inbound.operatorId" type="number" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Order ID</label>
        <input v-model="inbound.orderId" type="text" class="w-full border rounded p-2" />
      </div>
      <div v-for="(item, index) in inbound.items" :key="index" class="border p-2 rounded mb-2">
        <label class="block mb-1 font-semibold">Product ID</label>
        <input v-model.number="item.productId" type="number" class="w-full border rounded p-2" required />
        <label class="block mb-1 font-semibold">Quantity</label>
        <input v-model.number="item.quantity" type="number" step="0.01" class="w-full border rounded p-2" required />
        <label class="block mb-1 font-semibold">Price</label>
        <input v-model.number="item.price" type="number" step="0.01" class="w-full border rounded p-2" required />
        <button type="button" @click="removeItem(index)" class="mt-2 text-red-600 hover:underline">Remove Item</button>
      </div>
      <button type="button" @click="addItem" class="mb-4 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Add Item</button>
      <button type="submit" class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Add Inbound Inventory</button>
    </form>

    <div class="bg-white rounded shadow p-4">
      <h2 class="text-xl font-semibold mb-2">Inventory List</h2>
      <table class="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 p-2">ID</th>
            <th class="border border-gray-300 p-2">Product ID</th>
            <th class="border border-gray-300 p-2">Warehouse ID</th>
            <th class="border border-gray-300 p-2">Quantity</th>
            <th class="border border-gray-300 p-2">Average Cost</th>
            <th class="border border-gray-300 p-2">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inventory in inventories" :key="inventory.id" class="hover:bg-gray-100">
            <td class="border border-gray-300 p-2">{{ inventory.id }}</td>
            <td class="border border-gray-300 p-2">{{ inventory.productId }}</td>
            <td class="border border-gray-300 p-2">{{ inventory.warehouseId }}</td>
            <td class="border border-gray-300 p-2">{{ inventory.quantity }}</td>
            <td class="border border-gray-300 p-2">{{ inventory.averageCost }}</td>
            <td class="border border-gray-300 p-2">{{ inventory.lastUpdatedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'InventoryList',
  data() {
    return {
      inventories: [],
      inbound: {
        warehouseId: null,
        operatorId: null,
        orderId: '',
        items: [
          { productId: null, quantity: null, price: null },
        ],
      },
    };
  },
  methods: {
    async fetchInventories() {
      try {
        const response = await axios.get('/api/v1/inventory');
        this.inventories = response.data;
      } catch (error) {
        console.error('Failed to fetch inventories:', error);
      }
    },
    addItem() {
      this.inbound.items.push({ productId: null, quantity: null, price: null });
    },
    removeItem(index) {
      this.inbound.items.splice(index, 1);
    },
    async addInbound() {
      try {
        await axios.post('/api/v1/inventory/inbound', this.inbound);
        this.inbound = {
          warehouseId: null,
          operatorId: null,
          orderId: '',
          items: [
            { productId: null, quantity: null, price: null },
          ],
        };
        this.fetchInventories();
      } catch (error) {
        console.error('Failed to add inbound inventory:', error);
      }
    },
  },
  mounted() {
    this.fetchInventories();
  },
};
</script>

<style scoped>
</style>
