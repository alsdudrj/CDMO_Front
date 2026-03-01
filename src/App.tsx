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
import TestPage from './sub/TestPage';
import MESDashboard from './components/dashboard/MESDashboard';
import TempData from './sub/TempData';
import DoData from './sub/DoData';
import PhData from './sub/PhData';
import ProcessRealTime from './components/process_progress/ProcessRealTime';
import RecipeManagement from './components/process_recipe/RecipeManagement';
import AuditLog from './components/auditLog/AuditLog';

const App = () => {
  return (
    <>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/admin" element={<Admin/>}/>

            {/*포트폴리오 추가*/}
            <Route path="/dashboard" element={<MESDashboard/>} />
            <Route path="/recipe" element={<RecipeManagement />} />
            <Route path="/process" element={<ProcessRealTime/>} />
            <Route path="/audit-log" element={<AuditLog/>} />

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

            {/*테스트 페이지*/}
            <Route path="/test" element={<TestPage/>}/>
            <Route path="/test2" element={<TempData/>}/>
            <Route path="/test3" element={<DoData/>}/>
            <Route path="/test4" element={<PhData/>}/>
        </Routes>
    </BrowserRouter>
    </>
  );
};
export default App;