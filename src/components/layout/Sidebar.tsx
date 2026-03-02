import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faVial,
  faExclamationTriangle,
  faFileSignature,
  faWarehouse,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { useDeviation } from '../../context/DeviationContext';

const SidebarContainer = styled.div`
  /* Inherits styles from .mes-sidebar in global.scss but we add internal layout here */
  padding-top: 1.5rem;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #adb5bd;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.95rem;

  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${props => props.$active && `
    color: white;
    background-color: rgba(255, 255, 255, 0.15);
    border-left: 4px solid #0d6efd; /* Use primary color */
  `}
`;

const IconWrapper = styled.div`
  width: 24px;
  text-align: center;
  margin-right: 12px;
`;

const Badge = styled.span`
  background-color: #dc3545;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: auto;
`;

const Logo = styled.div`
  padding: 0 24px 24px 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }
`;

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { unreadCount } = useDeviation();

  return (
    <div className="mes-sidebar d-flex flex-column">
      <SidebarContainer>
        <Logo>
          <FontAwesomeIcon icon={faChartLine} size="lg" />
          <h4>MES Dashboard</h4>
        </Logo>
        <Nav className="flex-column">
          <NavLink to="/dashboard" $active={path === '/dashboard'}>
            <IconWrapper><FontAwesomeIcon icon={faChartLine} /></IconWrapper>
            Dashboard
          </NavLink>        
          <NavLink to="/recipe" $active={path === '/recipe'}>
            <IconWrapper><FontAwesomeIcon icon={faChartLine} /></IconWrapper>
            Process Recipes
          </NavLink>          
          <NavLink to="/batch" $active={path.startsWith('/batch')}>
            <IconWrapper><FontAwesomeIcon icon={faVial} /></IconWrapper>
            Batch Management
          </NavLink>
          <NavLink to="/deviations" $active={path.startsWith('/deviations')}>
            <IconWrapper><FontAwesomeIcon icon={faExclamationTriangle} /></IconWrapper>
            Deviations
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </NavLink>
          <NavLink to="/signatures" $active={path.startsWith('/signatures')}>
            <IconWrapper><FontAwesomeIcon icon={faFileSignature} /></IconWrapper>
            e-Signatures
          </NavLink>
          <NavLink to="/inventory" $active={path.startsWith('/inventory')}>
            <IconWrapper><FontAwesomeIcon icon={faWarehouse} /></IconWrapper>
            Material Inventory
          </NavLink>
          <NavLink to="/reports" $active={path.startsWith('/reports')}>
            <IconWrapper><FontAwesomeIcon icon={faFileAlt} /></IconWrapper>
            Reports & Analytics
          </NavLink>
          <NavLink to="/process" $active={path.startsWith('/reports')}>
            <IconWrapper><FontAwesomeIcon icon={faFileAlt} /></IconWrapper>
            Process Progress (Real-Time)
          </NavLink>
        </Nav>
      </SidebarContainer>
    </div>
  );
};

export default Sidebar;
