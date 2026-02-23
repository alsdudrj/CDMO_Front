import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mes-layout">
      <Sidebar />
      <div className="mes-main">
        <Header />
        <main className="mes-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
