import axios from 'axios';

const API_BASE = 'http://localhost:9500/api'

export const getProductionStatus = () => axios.get(`${API_BASE}/production`);
export const getWorkOrder = () => axios.get(`${API_BASE}/work-orders`);
export const getEquipmentStatus = () => axios.get(`${API_BASE}/equipment`);
export const getInventoryStatus = () => axios.get(`${API_BASE}/inventory`);