// Wrapper for backend connected API implementation.
// Exposes `api` object for existing callsites while also forward-exporting named functions.
import * as backend from "./api-backend";

export const api = {
  listSales: backend.listSales,
  createSale: backend.createSale,
  listWastage: backend.listWastage,
  createWastage: backend.createWastage,
  listProducts: backend.listProducts,
  updateStock: backend.updateStock,
  getDashboardData: backend.getDashboardData,
  getSalesReport: backend.getSalesReport,
  getWastageReport: backend.getWastageReport,
  listUsers: backend.listUsers,
  createUser: backend.createUser,
  updateUser: backend.updateUser,
  toggleUserStatus: backend.toggleUserStatus,
  resetUserPassword: backend.resetUserPassword,
};

// Also export named functions for direct imports
export const {
  listSales,
  createSale,
  listWastage,
  createWastage,
  listProducts,
  updateStock,
  getDashboardData,
  getSalesReport,
  getWastageReport,
  listUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
} = backend;

export type ApiError = backend.ApiError;
