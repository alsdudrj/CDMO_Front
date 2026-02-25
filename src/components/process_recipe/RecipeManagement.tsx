import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd'; // 타입 에러 방지를 위한 분리
import Sidebar from '../layout/Sidebar';
import { 
    getCompanies, getProjects, getProducts, getRecipes, 
    createRecipe, updateRecipe, deleteRecipe 
} from '../../api/recipeApi'; 
import type { Company, Project, Product, RecipeDto, ProcessDto } from '../../api/recipeApi';

const RecipeManagement: React.FC = () => {
    // State
    const [companies, setCompanies] = useState<Company[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [recipes, setRecipes] = useState<RecipeDto[]>([]);

    const [selectedCompany, setSelectedCompany] = useState<number | undefined>();
    const [selectedProject, setSelectedProject] = useState<number | undefined>();
    const [selectedProduct, setSelectedProduct] = useState<number | undefined>();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState<RecipeDto | null>(null);

    // Data Loading Effects
    useEffect(() => { loadCompanies(); }, []);
    
    useEffect(() => {
        if (selectedCompany) loadProjects(selectedCompany);
        else { setProjects([]); setProducts([]); setRecipes([]); }
    }, [selectedCompany]);

    useEffect(() => {
        if (selectedProject) loadProducts(selectedProject);
        else { setProducts([]); setRecipes([]); }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedProduct) loadRecipes(selectedProduct);
        else setRecipes([]);
    }, [selectedProduct]);

    const loadCompanies = async () => {
        try { const data = await getCompanies(); setCompanies(data); } 
        catch (error) { console.error("Failed to load companies", error); }
    };
    const loadProjects = async (companyId: number) => {
        try { const data = await getProjects(companyId); setProjects(data); } 
        catch (error) { console.error("Failed to load projects", error); }
    };
    const loadProducts = async (projectId: number) => {
        try { const data = await getProducts(projectId); setProducts(data); } 
        catch (error) { console.error("Failed to load products", error); }
    };
    const loadRecipes = async (productId: number) => {
        try { const data = await getRecipes(productId); setRecipes(data); } 
        catch (error) { console.error("Failed to load recipes", error); }
    };

    // Actions
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
             try {
                await deleteRecipe(id);
                if (selectedProduct) loadRecipes(selectedProduct);
            } catch (error) { console.error("Failed to delete recipe", error); }
        }
    };

    const handleCreate = () => {
        setCurrentRecipe({
            name: '', description: '', targetQuantity: 0, unit: '', version: '', status: 'DRAFT',
            isActive: false, productId: selectedProduct!, processes: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = (recipe: RecipeDto) => {
        setCurrentRecipe({ ...recipe });
        setIsModalOpen(true);
    };

    const handleSave = async (recipe: RecipeDto) => {
        try {
            if (recipe.id) await updateRecipe(recipe.id, recipe);
            else await createRecipe(recipe);
            setIsModalOpen(false);
            if (selectedProduct) loadRecipes(selectedProduct);
        } catch (error) {
            console.error("Failed to save recipe", error);
            alert("Failed to save recipe");
        }
    };

return (
        // 1. 전체를 가로로 배치하는 d-flex 컨테이너
        <div className="d-flex" style={{ backgroundColor: '#4a69d4', minHeight: '100vh' }}>
            
            {/* 2. 좌측 사이드바 렌더링 */}
            <Sidebar />

            {/* 3. 우측 메인 컨텐츠 영역 (사이드바 너비만큼 왼쪽 여백 밀어내기) */}
            <div className="container-fluid py-4" style={{ marginLeft: '250px', width: 'calc(100% - 250px)' }}>            
                
                {/* 상단 타이틀 및 액션 버튼 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-white m-0 fw-bold">Process Recipes</h2>
                    <button className="btn btn-light text-primary shadow-sm fw-bold" disabled={!selectedProduct} onClick={handleCreate}>
                        <i className="fas fa-plus me-2"></i> Create Recipe
                    </button>
                </div>
                
                {/* Filters Card */}
                <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small">COMPANY</label>
                                <select className="form-select" value={selectedCompany || ''} onChange={(e) => {
                                    setSelectedCompany(Number(e.target.value));
                                    setSelectedProject(undefined);
                                    setSelectedProduct(undefined);
                                }}>
                                    <option value="">Select Company...</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small">PROJECT</label>
                                <select className="form-select" value={selectedProject || ''} onChange={(e) => {
                                    setSelectedProject(Number(e.target.value));
                                    setSelectedProduct(undefined);
                                }} disabled={!selectedCompany}>
                                    <option value="">Select Project...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted fw-bold small">PRODUCT</label>
                                <select className="form-select" value={selectedProduct || ''} 
                                    onChange={(e) => setSelectedProduct(Number(e.target.value))} disabled={!selectedProject}>
                                    <option value="">Select Product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipe List Card */}
                <div className="card shadow-sm border-0" style={{ borderRadius: '10px' }}>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3 text-muted small fw-bold">NAME</th>
                                        <th className="py-3 text-muted small fw-bold">VERSION</th>
                                        <th className="py-3 text-muted small fw-bold">STATUS</th>
                                        <th className="py-3 text-muted small fw-bold">IS ACTIVE</th>
                                        <th className="py-3 text-muted small fw-bold">TARGET QTY</th>
                                        <th className="px-4 py-3 text-end text-muted small fw-bold">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipes.map(r => (
                                        <tr key={r.id}>
                                            <td className="px-4 fw-bold text-dark">{r.name}</td>
                                            <td><span className="badge bg-light text-dark border">{r.version}</span></td>
                                            <td>
                                                <span className={`badge ${r.status === 'APPROVED' ? 'bg-success' : r.status === 'REVIEW' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${r.isActive ? 'bg-primary' : 'bg-danger'}`}>
                                                    {r.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-muted">{r.targetQuantity} {r.unit}</td>
                                            <td className="px-4 text-end">
                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(r)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => r.id && handleDelete(r.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {recipes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-muted">
                                                {selectedProduct ? "No recipes found for this product. Click 'Create Recipe' to add one." : "Please select a product to view recipes."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Modal Components */}
                {isModalOpen && currentRecipe && (
                    <RecipeFormModal recipe={currentRecipe} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
                )}
            </div>
        </div>
    );
};
// --- Modal Component ---
interface RecipeFormModalProps {
    recipe: RecipeDto;
    onClose: () => void;
    onSave: (recipe: RecipeDto) => void;
}

interface LocalProcessDto extends ProcessDto {
    tempId: string;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ recipe, onClose, onSave }) => {
    const [formData, setFormData] = useState<RecipeDto>(recipe);
    const [localProcesses, setLocalProcesses] = useState<LocalProcessDto[]>(
        (recipe.processes || []).map(p => ({ ...p, tempId: p.id ? String(p.id) : Math.random().toString(36).substr(2, 9) }))
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(val) : val }));
    };

    const handleProcessChange = (index: number, field: keyof ProcessDto, value: any) => {
        const newProcesses = [...localProcesses];
        newProcesses[index] = { ...newProcesses[index], [field]: value };
        setLocalProcesses(newProcesses);
    };

    const addProcess = () => {
        const newProcess: LocalProcessDto = {
            name: '', stepOrder: localProcesses.length + 1, description: '', temp: 0, ph: 0, time: '',
            tempId: Math.random().toString(36).substr(2, 9)
        };
        setLocalProcesses([...localProcesses, newProcess]);
    };

    const removeProcess = (index: number) => {
        const newProcesses = localProcesses.filter((_, i) => i !== index);
        newProcesses.forEach((p, i) => p.stepOrder = i + 1); // 재정렬 로직
        setLocalProcesses(newProcesses);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(localProcesses);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // 핵심 로직: 드래그 앤 드롭 후 stepOrder 재계산
        items.forEach((item, index) => { item.stepOrder = index + 1; });
        setLocalProcesses(items);
    };

    const handleSave = () => {
        const finalRecipe: RecipeDto = {
            ...formData,
            processes: localProcesses.map(({ tempId, ...rest }) => rest)
        };
        onSave(finalRecipe);
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '10px' }}>
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold">{formData.id ? 'Edit Recipe' : 'Create Recipe'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Name</label>
                                <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small">Version</label>
                                <input className="form-control" name="version" value={formData.version} onChange={handleChange} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold small">Status</label>
                                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="REVIEW">REVIEW</option>
                                    <option value="APPROVED">APPROVED</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Target Quantity</label>
                                <input className="form-control" type="number" name="targetQuantity" value={formData.targetQuantity} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold small">Unit</label>
                                <input className="form-control" name="unit" value={formData.unit} onChange={handleChange} placeholder="e.g., L, kg" />
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <div className="form-check form-switch mb-2">
                                    <input className="form-check-input" type="checkbox" id="isActiveCheck" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                    <label className="form-check-label fw-bold small" htmlFor="isActiveCheck">Is Active</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-bold small">Description</label>
                                <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows={2} />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold m-0">Processes</h6>
                            <button className="btn btn-sm btn-outline-primary" onClick={addProcess}>+ Add Process</button>
                        </div>
                        
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="processes">
                                {(provided) => (
                                    <div className="table-responsive" {...provided.droppableProps} ref={provided.innerRef}>
                                        <table className="table table-bordered table-sm align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="text-center" style={{ width: '60px' }}>Step</th>
                                                    <th>Name</th>
                                                    <th>Description</th>
                                                    <th style={{ width: '80px' }}>Temp</th>
                                                    <th style={{ width: '80px' }}>pH</th>
                                                    <th style={{ width: '100px' }}>Time</th>
                                                    <th className="text-center" style={{ width: '80px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {localProcesses.map((process, index) => (
                                                    <Draggable key={process.tempId} draggableId={process.tempId} index={index}>
                                                        {(provided, snapshot) => (
                                                            <tr ref={provided.innerRef} {...provided.draggableProps} 
                                                                className={snapshot.isDragging ? "bg-light shadow-sm" : ""}
                                                                style={{ ...provided.draggableProps.style, backgroundColor: 'white' }}>
                                                                <td className="text-center" {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
                                                                    <i className="fas fa-grip-vertical text-muted me-2"></i>
                                                                    {process.stepOrder}
                                                                </td>
                                                                <td><input className="form-control form-control-sm" value={process.name} onChange={(e) => handleProcessChange(index, 'name', e.target.value)} /></td>
                                                                <td><input className="form-control form-control-sm" value={process.description} onChange={(e) => handleProcessChange(index, 'description', e.target.value)} /></td>
                                                                <td><input className="form-control form-control-sm" type="number" value={process.temp || ''} onChange={(e) => handleProcessChange(index, 'temp', Number(e.target.value))} /></td>
                                                                <td><input className="form-control form-control-sm" type="number" value={process.ph || ''} onChange={(e) => handleProcessChange(index, 'ph', Number(e.target.value))} /></td>
                                                                <td><input className="form-control form-control-sm" value={process.time} onChange={(e) => handleProcessChange(index, 'time', e.target.value)} placeholder="e.g., 2h 30m" /></td>
                                                                <td className="text-center">
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeProcess(index)}>
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                    <div className="modal-footer bg-light border-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>Save Recipe</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeManagement;