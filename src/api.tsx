import axios from 'axios';

const API_BASE = 'http://localhost:9500/api'

export const apiClient = axios.create({
    baseURL: API_BASE,
});

export const getProductionStatus = () => axios.get(`${API_BASE}/production`);
export const getWorkOrder = () => axios.get(`${API_BASE}/work-orders`);
export const getEquipmentStatus = () => axios.get(`${API_BASE}/equipment`);
export const getInventoryStatus = () => axios.get(`${API_BASE}/inventory`);

//audit log 인터페이스
export interface AuditLogDto {
    id: number;
    entityName: string;
    entityId: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PROCESS';
    username: string;
    beforeValue: string; // JSON String
    afterValue: string;  // JSON String
    createdAt: string;
}

export interface AuditLogSearchParams {
    keyword?: string
    action?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
}

export const getAuditLogs = async (
    params?: AuditLogSearchParams
): Promise<PageResponse<AuditLogDto>> => {

    const response = await apiClient.get('/audit-logs', {
        params
    });

    return response.data;
};

export interface PageResponse<T> {
    content: T[]
    totalPages: number
    totalElements: number
    number: number
}

export const approveDeviation = (id: string, approvalData: any) => 
    apiClient.post(`/deviations/${id}/approve`, approvalData);