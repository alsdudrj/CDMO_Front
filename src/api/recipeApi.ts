import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; [cite_start]// [cite: 95]

// Types
export interface ProcessDto {
    id?: number;
    name: string;
    stepOrder: number;
    description: string;
    temp?: number;
    ph?: number;
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

// API Functions
export const getCompanies = async (): Promise<Company[]> => {
    const response = await axios.get(`${API_BASE_URL}/companies`); [cite_start]// [cite: 105]
    return response.data;
};

export const getProjects = async (companyId: number): Promise<Project[]> => {
    const response = await axios.get(`${API_BASE_URL}/companies/${companyId}/projects`); [cite_start]// [cite: 106]
    return response.data;
};

export const getProducts = async (projectId: number): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/products`); [cite_start]// [cite: 107]
    return response.data;
};

export const getRecipes = async (productId: number): Promise<RecipeDto[]> => {
    const response = await axios.get(`${API_BASE_URL}/recipes`, { params: { productId } }); [cite_start]// [cite: 101]
    return response.data;
};

export const createRecipe = async (recipe: RecipeDto): Promise<RecipeDto> => {
    const response = await axios.post(`${API_BASE_URL}/recipes`, recipe); [cite_start]// [cite: 102]
    return response.data;
};

export const updateRecipe = async (id: number, recipe: RecipeDto): Promise<RecipeDto> => {
    const response = await axios.put(`${API_BASE_URL}/recipes/${id}`, recipe); [cite_start]// [cite: 103]
    return response.data;
};

export const deleteRecipe = async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/recipes/${id}`); [cite_start]// [cite: 104]
};