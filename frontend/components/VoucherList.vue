<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Vouchers</h1>
    <form @submit.prevent="createVoucher" class="mb-6 space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label class="block mb-1 font-semibold">Voucher Word</label>
        <input v-model="newVoucher.voucherWord" type="text" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Voucher Number</label>
        <input v-model.number="newVoucher.voucherNumber" type="number" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Period (YYYY-MM)</label>
        <input v-model="newVoucher.period" type="text" class="w-full border rounded p-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Voucher Date</label>
        <input v-model="newVoucher.voucherDate" type="date" class="w-full border rounded p-2" required />
      </div>
      <button type="submit" class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Create Voucher</button>
    </form>

    <div class="bg-white rounded shadow p-4">
      <h2 class="text-xl font-semibold mb-2">Voucher List</h2>
      <table class="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-300 p-2">ID</th>
            <th class="border border-gray-300 p-2">Word</th>
            <th class="border border-gray-300 p-2">Number</th>
            <th class="border border-gray-300 p-2">Period</th>
            <th class="border border-gray-300 p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="voucher in vouchers" :key="voucher.id" class="hover:bg-gray-100">
            <td class="border border-gray-300 p-2">{{ voucher.id }}</td>
            <td class="border border-gray-300 p-2">{{ voucher.voucherWord }}</td>
            <td class="border border-gray-300 p-2">{{ voucher.voucherNumber }}</td>
            <td class="border border-gray-300 p-2">{{ voucher.period }}</td>
            <td class="border border-gray-300 p-2">{{ voucher.voucherDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'VoucherList',
  data() {
    return {
      vouchers: [],
      newVoucher: {
        voucherWord: '',
        voucherNumber: null,
        period: '',
        voucherDate: '',
      },
    };
  },
  methods: {
    async fetchVouchers() {
      try {
        const response = await axios.get('/api/v1/vouchers');
        this.vouchers = response.data;
      } catch (error) {
        console.error('Failed to fetch vouchers:', error);
      }
    },
    async createVoucher() {
      try {
        await axios.post('/api/v1/vouchers', this.newVoucher);
        this.newVoucher = {
          voucherWord: '',
          voucherNumber: null,
          period: '',
          voucherDate: '',
        };
        this.fetchVouchers();
      } catch (error) {
        console.error('Failed to create voucher:', error);
      }
    },
  },
  mounted() {
    this.fetchVouchers();
  },
};
</script>

<style scoped>
</style>
