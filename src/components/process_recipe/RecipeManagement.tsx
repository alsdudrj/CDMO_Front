import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getCompanies, getProjects, getProducts, getRecipes, createRecipe, updateRecipe, deleteRecipe } from '../api/recipeApi';
import type { Company, Project, Product, RecipeDto, ProcessDto } from '../api/recipeApi';

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

    // Load Companies on mount
    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error("Failed to load companies", error);
        }
    };

    // Load Projects when Company changes
    useEffect(() => {
        if (selectedCompany) {
            loadProjects(selectedCompany);
        } else {
            setProjects([]);
            setProducts([]);
            setRecipes([]);
        }
    }, [selectedCompany]);

    const loadProjects = async (companyId: number) => {
         try {
            const data = await getProjects(companyId);
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    // Load Products when Project changes
    useEffect(() => {
        if (selectedProject) {
            loadProducts(selectedProject);
        } else {
            setProducts([]);
            setRecipes([]);
        }
    }, [selectedProject]);

    const loadProducts = async (projectId: number) => {
         try {
            const data = await getProducts(projectId);
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    // Load Recipes when Product changes
    useEffect(() => {
        if (selectedProduct) {
            loadRecipes(selectedProduct);
        } else {
            setRecipes([]);
        }
    }, [selectedProduct]);

    const loadRecipes = async (productId: number) => {
         try {
            const data = await getRecipes(productId);
            setRecipes(data);
        } catch (error) {
            console.error("Failed to load recipes", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
             try {
                await deleteRecipe(id);
                if (selectedProduct) loadRecipes(selectedProduct);
            } catch (error) {
                console.error("Failed to delete recipe", error);
            }
        }
    };

    const handleCreate = () => {
        setCurrentRecipe({
            name: '',
            description: '',
            targetQuantity: 0,
            unit: '',
            version: '',
            status: 'DRAFT',
            isActive: false,
            productId: selectedProduct!,
            processes: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = (recipe: RecipeDto) => {
        setCurrentRecipe({ ...recipe });
        setIsModalOpen(true);
    };

    const handleSave = async (recipe: RecipeDto) => {
        try {
            if (recipe.id) {
                await updateRecipe(recipe.id, recipe);
            } else {
                await createRecipe(recipe);
            }
            setIsModalOpen(false);
            if (selectedProduct) loadRecipes(selectedProduct);
        } catch (error) {
            console.error("Failed to save recipe", error);
            alert("Failed to save recipe");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Recipe Management</h1>
            
            {/* Filters */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label>Company: </label>
                    <select value={selectedCompany || ''} onChange={(e) => {
                        setSelectedCompany(Number(e.target.value));
                        setSelectedProject(undefined);
                        setSelectedProduct(undefined);
                    }}>
                        <option value="">Select Company</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Project: </label>
                    <select value={selectedProject || ''} onChange={(e) => {
                        setSelectedProject(Number(e.target.value));
                        setSelectedProduct(undefined);
                    }} disabled={!selectedCompany}>
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label>Product: </label>
                    <select value={selectedProduct || ''} onChange={(e) => setSelectedProduct(Number(e.target.value))} disabled={!selectedProject}>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '20px' }}>
                <button disabled={!selectedProduct} onClick={handleCreate}>Create Recipe</button>
            </div>

            {/* Recipe List */}
            <table border={1} cellPadding={5} style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Is Active</th>
                        <th>Description</th>
                        <th>Target Quantity</th>
                        <th>Unit</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {recipes.map(r => (
                        <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{r.version}</td>
                            <td>{r.status}</td>
                            <td>{r.isActive ? 'Yes' : 'No'}</td>
                            <td>{r.description}</td>
                            <td>{r.targetQuantity}</td>
                            <td>{r.unit}</td>
                            <td>
                                <button onClick={() => handleEdit(r)}>Edit</button>
                                <button onClick={() => r.id && handleDelete(r.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {recipes.length === 0 && <tr><td colSpan={8}>No recipes found</td></tr>}
                </tbody>
            </table>

            {/* Modal */}
            {isModalOpen && currentRecipe && (
                <RecipeFormModal 
                    recipe={currentRecipe} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

interface RecipeFormModalProps {
    recipe: RecipeDto;
    onClose: () => void;
    onSave: (recipe: RecipeDto) => void;
}

interface LocalProcessDto extends ProcessDto {
    tempId: string;
}

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ recipe, onClose, onSave }) => {
    // Initialize form data with tempIds for DnD stability
    const [formData, setFormData] = useState<RecipeDto>(recipe);
    const [localProcesses, setLocalProcesses] = useState<LocalProcessDto[]>(
        (recipe.processes || []).map(p => ({ ...p, tempId: p.id ? String(p.id) : Math.random().toString(36).substr(2, 9) }))
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(val) : val
        }));
    };

    const handleProcessChange = (index: number, field: keyof ProcessDto, value: any) => {
        const newProcesses = [...localProcesses];
        newProcesses[index] = { ...newProcesses[index], [field]: value };
        setLocalProcesses(newProcesses);
    };

    const addProcess = () => {
        const newProcess: LocalProcessDto = {
            name: '',
            stepOrder: localProcesses.length + 1,
            description: '',
            temp: 0,
            ph: 0,
            time: '',
            tempId: Math.random().toString(36).substr(2, 9)
        };
        setLocalProcesses([...localProcesses, newProcess]);
    };

    const removeProcess = (index: number) => {
        const newProcesses = localProcesses.filter((_, i) => i !== index);
        // Reorder steps
        newProcesses.forEach((p, i) => p.stepOrder = i + 1);
        setLocalProcesses(newProcesses);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(localProcesses);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update step orders
        items.forEach((item, index) => {
            item.stepOrder = index + 1;
        });

        setLocalProcesses(items);
    };

    const handleSave = () => {
        // Strip tempId before saving
        const finalRecipe: RecipeDto = {
            ...formData,
            processes: localProcesses.map(({ tempId, ...rest }) => rest)
        };
        onSave(finalRecipe);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '20px', width: '80%', maxHeight: '90%', overflowY: 'auto' }}>
                <h2>{formData.id ? 'Edit Recipe' : 'Create Recipe'}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <label>Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Version</label>
                        <input name="version" value={formData.version} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Status</label>
                        <input name="status" value={formData.status} onChange={handleChange} />
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                            Is Active
                        </label>
                    </div>
                    <div>
                        <label>Target Quantity</label>
                        <input type="number" name="targetQuantity" value={formData.targetQuantity} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Unit</label>
                        <input name="unit" value={formData.unit} onChange={handleChange} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                </div>

                <h3>Processes</h3>
                <button onClick={addProcess} style={{marginBottom: '10px'}}>Add Process</button>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="processes">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>Step</th>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Temp</th>
                                            <th>pH</th>
                                            <th>Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localProcesses.map((process, index) => (
                                            <Draggable key={process.tempId} draggableId={process.tempId} index={index}>
                                                {(provided) => (
                                                    <tr 
                                                        ref={provided.innerRef} 
                                                        {...provided.draggableProps} 
                                                        {...provided.dragHandleProps}
                                                        style={{ ...provided.draggableProps.style, background: 'white' }}
                                                    >
                                                        <td>{process.stepOrder}</td>
                                                        <td><input value={process.name} onChange={(e) => handleProcessChange(index, 'name', e.target.value)} /></td>
                                                        <td><input value={process.description} onChange={(e) => handleProcessChange(index, 'description', e.target.value)} /></td>
                                                        <td><input type="number" value={process.temp || ''} onChange={(e) => handleProcessChange(index, 'temp', Number(e.target.value))} style={{width: '60px'}} /></td>
                                                        <td><input type="number" value={process.ph || ''} onChange={(e) => handleProcessChange(index, 'ph', Number(e.target.value))} style={{width: '60px'}} /></td>
                                                        <td><input value={process.time} onChange={(e) => handleProcessChange(index, 'time', e.target.value)} /></td>
                                                        <td><button onClick={() => removeProcess(index)}>Remove</button></td>
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

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default RecipeManagement;