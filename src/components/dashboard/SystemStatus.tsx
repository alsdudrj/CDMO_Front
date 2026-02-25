import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import type { ISystemAlert, ISystemStatus } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const StatusBlock = styled.div<{ $bgClass: string }>`
  border-radius: 8px;
  padding: 16px;
  color: white;
  height: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatusLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatusValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
`;

interface Props {
  alert: ISystemAlert;
  status: ISystemStatus[];
}

const SystemStatus: React.FC<Props> = ({ alert, status }) => {
  return (
    <div className="h-100 d-flex flex-column">
        <h5 className="mb-3 fw-bold text-primary">System Alerts</h5>
        <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
                <div className="d-flex align-items-start">
                    <div className="flex-grow-1">
                        <p className="mb-2 text-dark" style={{fontWeight: 500}}>{alert.message}</p>
                        {alert.linkText && (
                            <a href={alert.linkUrl} className="text-primary text-decoration-none fw-bold" style={{fontSize: '0.85rem'}}>
                                {alert.linkText} <FontAwesomeIcon icon={faArrowRight} size="xs" />
                            </a>
                        )}
                    </div>
                    {/* Circle graphic simulation */}
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center ms-3" style={{width: 60, height: 60}}>
                         <div style={{width: 30, height: 30, background: '#e9ecef', borderRadius: '50%'}}></div>
                    </div>
                </div>
            </Card.Body>
        </Card>

        <Row className="g-3 flex-grow-1">
            {status.map((item, index) => (
                <Col xs={6} key={index}>
                    <StatusBlock className={item.bgClass} $bgClass={item.bgClass}>
                        <StatusLabel>{item.name}</StatusLabel>
                        <StatusValue>{item.status}</StatusValue>
                    </StatusBlock>
                </Col>
            ))}
        </Row>
    </div>
  );
};

export default SystemStatus;
