import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useDeviation } from '../../context/DeviationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faBell } from '@fortawesome/free-solid-svg-icons';

const GlobalToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDeviation();

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060, position: 'fixed' }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          show={true}
          delay={5000}
          autohide
          className={`border-0 shadow-lg`}
        >
          <Toast.Header className="justify-content-between">
            <FontAwesomeIcon
                icon={toast.severity === 'CRITICAL' ? faExclamationTriangle : faBell}
                className={`me-2 ${toast.severity === 'CRITICAL' ? 'text-danger' : 'text-warning'}`}
            />
            <strong className="me-auto">{toast.severity} Alert</strong>
          </Toast.Header>
          <Toast.Body className={toast.severity === 'CRITICAL' ? 'text-danger fw-bold' : 'text-dark fw-bold'}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default GlobalToastContainer;
