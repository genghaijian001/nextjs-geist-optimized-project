import { createRouter, createWebHistory } from 'vue-router';
import VoucherList from '../components/VoucherList.vue';
import InventoryList from '../components/InventoryList.vue';

const routes = [
  {
    path: '/',
    name: 'Vouchers',
    component: VoucherList,
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryList,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
