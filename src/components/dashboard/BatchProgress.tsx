import React from 'react';
import { Card, ProgressBar, Button } from 'react-bootstrap';
import styled from 'styled-components';
import type { IBatch } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faChartLine } from '@fortawesome/free-solid-svg-icons';

const BatchItem = styled.div`
  padding: 1.5rem 0;
  border-bottom: 1px solid #f1f1f1;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const BatchId = styled.span`
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 4px;
  display: inline-block;
  border: 1px solid #e9ecef;
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 8px;
  border-radius: 4px;
  background-color: #e9ecef;
  margin-top: 12px;

  .progress-bar {
    border-radius: 4px;
    background-color: #0d6efd; /* Primary */
  }
`;

const HeaderTitle = styled.h5`
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface Props {
  data: IBatch[];
}

const BatchProgress: React.FC<Props> = ({ data }) => {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <HeaderTitle>
            <FontAwesomeIcon icon={faChartLine} className="text-primary" />
            Active Batch Progress
        </HeaderTitle>
        <div className="d-flex align-items-center gap-2">
            <Button variant="link" className="text-decoration-none small fw-bold text-primary p-0">View All Batches</Button>
            <Button variant="link" className="text-decoration-none text-muted p-0 ms-2">
                 <FontAwesomeIcon icon={faEllipsisV} />
            </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {data.map((batch) => (
          <BatchItem key={batch.id}>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-0 fw-bold" style={{fontSize: '0.95rem'}}>{batch.productName}</h6>
                <BatchId>{batch.id}</BatchId>
              </div>
              <div className="text-end">
                <div className="text-secondary fw-bold" style={{fontSize: '0.85rem'}}>{batch.step}</div>
                <div className="text-primary text-xs fw-bold mt-1">ETA: {batch.eta}</div>
              </div>
            </div>
            <StyledProgressBar now={batch.progress} />
            <div className="text-end mt-1">
                <small className="text-primary fw-bold" style={{fontSize: '0.75rem'}}>{batch.progress}%</small>
            </div>
          </BatchItem>
        ))}
      </Card.Body>
    </Card>
  );
};

export default BatchProgress;
