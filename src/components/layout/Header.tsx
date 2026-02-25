import React from 'react';
import { Form, InputGroup, Dropdown, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const SearchInput = styled(Form.Control)`
  border-radius: 20px 0 0 20px;
  border-right: none;
  background-color: #f8f9fa;
  &:focus {
    box-shadow: none;
    background-color: #fff;
    border-color: #ced4da;
  }
`;

const SearchButton = styled(Button)`
  border-radius: 0 20px 20px 0;
  border-left: none;
  background-color: #0d6efd; /* Primary Blue */
  border-color: #0d6efd;
  color: white;
  &:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Header = () => {
  return (
    <div className="mes-header justify-content-between bg-white shadow-sm">
      <InputGroup style={{ maxWidth: '300px' }}>
        <SearchInput placeholder="Search for..." />
        <SearchButton variant="primary">
          <FontAwesomeIcon icon={faSearch} />
        </SearchButton>
      </InputGroup>

      <div className="d-flex align-items-center gap-4">
        <FontAwesomeIcon icon={faBell} className="text-secondary" style={{ cursor: 'pointer', fontSize: '1.2rem' }} />

        <Dropdown align="end">
          <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
            <UserProfile>
              <div className="text-end d-none d-md-block">
                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Dr. Min-su</div>
                <div className="text-muted text-xs">Admin</div>
              </div>
              <Avatar>
                {/* Placeholder or image if available */}
                <FontAwesomeIcon icon={faUserCircle} size="lg" />
              </Avatar>
            </UserProfile>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item href="#/profile">Profile</Dropdown.Item>
            <Dropdown.Item href="#/settings">Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href="#/logout">Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

// Custom Toggle for Dropdown to remove default caret
// eslint-disable-next-line react/display-name
const CustomToggle = React.forwardRef<HTMLDivElement, { children: React.ReactNode; onClick: (e: React.MouseEvent) => void }>(
  ({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {children}
    </div>
  )
);

export default Header;
