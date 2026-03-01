import axios from 'axios';

const API_BASE_URL = 'http://localhost:9500/api';

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 꺼내 헤더에 삽입
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // 로그인 시 저장한 키값 확인
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export interface ProcessDto {
    id?: number;
    name: string;
    stepOrder: number;
    description: string;
    temp?: number;
    ph?: number;
    doValue?: number; // 추가    
    time: string;
}

export interface RecipeDto {
    id?: number;
    name: string;
    description: string;
    targetQuantity: number;
    unit: string;
    version: string;
    status: string;
    isActive: boolean;
    productId: number;
    processes: ProcessDto[];
}

export interface Company {
    id: number;
    name: string;
}

export interface Project {
    id: number;
    name: string;
    company: Company;
}

export interface Product {
    id: number;
    name: string;
    project: Project;
}

// export const getRecipes = async (productId: number): Promise<RecipeDto[]> => {
//     const response = await axios.get(`${API_BASE_URL}/recipes`, { params: { productId } });
//     return response.data;
// };

// export const createRecipe = async (recipe: RecipeDto): Promise<RecipeDto> => {
//     const response = await axios.post(`${API_BASE_URL}/recipes`, recipe);
//     return response.data;
// };

// export const updateRecipe = async (id: number, recipe: RecipeDto): Promise<RecipeDto> => {
//     const response = await axios.put(`${API_BASE_URL}/recipes/${id}`, recipe);
//     return response.data;
// };

// export const deleteRecipe = async (id: number): Promise<void> => {
//     await axios.delete(`${API_BASE_URL}/recipes/${id}`);
// };

// export const getCompanies = async (): Promise<Company[]> => {
//     const response = await axios.get(`${API_BASE_URL}/companies`);
//     return response.data;
// };

// export const getProjects = async (companyId: number): Promise<Project[]> => {
//     const response = await axios.get(`${API_BASE_URL}/companies/${companyId}/projects`);
//     return response.data;
// };

// export const getProducts = async (projectId: number): Promise<Product[]> => {
//     const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/products`);
//     return response.data;
// };


/* (26.03.01 민영 추가) API 호출 함수 변경 */

export const getRecipes = async (productId: number): Promise<RecipeDto[]> => {
    const response = await apiClient.get('/recipes', { params: { productId } });
    return response.data;
};

export const createRecipe = async (recipe: RecipeDto): Promise<RecipeDto> => {
    const response = await apiClient.post('/recipes', recipe);
    return response.data;
};

export const updateRecipe = async (id: number, recipe: RecipeDto): Promise<RecipeDto> => {
    const response = await apiClient.put(`/recipes/${id}`, recipe);
    return response.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
    await apiClient.delete(`/recipes/${id}`);
};

export const getCompanies = async (): Promise<Company[]> => {
    const response = await apiClient.get('/companies');
    return response.data;
};

export const getProjects = async (companyId: number): Promise<Project[]> => {
    const response = await apiClient.get(`/companies/${companyId}/projects`);
    return response.data;
};

export const getProducts = async (projectId: number): Promise<Product[]> => {
    const response = await apiClient.get(`/projects/${projectId}/products`);
    return response.data;
};