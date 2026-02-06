import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

import Admin from './sub/Admin';
import Forgot from './sub/Forgot';
import Member from './sub/Member';
import Reset from './sub/Reset';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './sub/Login';
import SalesManagement from './sub/SalesManagement';
import ProductionManagement from './sub/ProductionManagement';
import PurchaseMaterial from './sub/PurchaseMaterial';
import InventoryManagement from './sub/InventoryManagement';
import KpiManagement from './sub/KpiManagement';
import SystemManagement from './sub/SystemManagement';
import StandardManagement from './sub/StandardManagement';
import SearchPage from './sub/SearchPage';

const App = () => {
  return (
    <>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/admin" element={<ProtectedRoute><Admin/></ProtectedRoute>}/>

            <Route path="/sales" element={<ProtectedRoute><SalesManagement/></ProtectedRoute>}/>
            <Route path="/pmanagement" element={<ProtectedRoute><ProductionManagement/></ProtectedRoute>}/>
            <Route path="/pm" element={<ProtectedRoute><PurchaseMaterial/></ProtectedRoute>}/>
            <Route path="/im" element={<ProtectedRoute><InventoryManagement/></ProtectedRoute>}/>
            <Route path="/kpi" element={<ProtectedRoute><KpiManagement/></ProtectedRoute>}/>
            <Route path="/standard" element={<ProtectedRoute><StandardManagement/></ProtectedRoute>}/>
            <Route path="/system" element={<ProtectedRoute><SystemManagement/></ProtectedRoute>}/>

            <Route path="/forgot" element={<Forgot/>}/>
            <Route path="/member" element={<Member/>}/>
            <Route path="/reset" element={<Reset/>}/>
            <Route path="/search" element={<SearchPage />} />
        </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;