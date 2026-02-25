import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import styled from 'styled-components';
import type { ISignature } from '../../types';

const StyledCard = styled(Card)`
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
`;

const TableHeader = styled.th`
  font-size: 0.75rem;
  color: #adb5bd;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #f1f1f1 !important;
  padding-bottom: 12px !important;
  padding-top: 12px !important;
  background-color: white !important;
`;

const TableCell = styled.td`
  vertical-align: middle;
  padding: 16px 12px !important;
  border-bottom: 1px solid #f8f9fa !important;
  font-size: 0.9rem;
  background-color: white !important;
`;

const BatchDoc = styled.div`
  font-weight: 600;
  color: #212529;
  font-size: 0.9rem;
`;

const DocSub = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 2px;
`;

const WaitTime = styled.span`
  color: #fd7e14; /* Orange */
  font-weight: 600;
  font-size: 0.9rem;
`;

const CustomBadge = styled.span<{ $color: string }>`
    background-color: ${props => props.$color}15; /* 15% opacity */
    color: ${props => props.$color};
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    display: inline-block;
`;

interface Props {
  data: ISignature[];
}

const SignatureTable: React.FC<Props> = ({ data }) => {
  return (
    <StyledCard>
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold text-primary">Pending Signatures</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table borderless responsive className="mb-0 align-middle">
          <thead>
            <tr>
              <TableHeader className="ps-4">BATCH / DOC</TableHeader>
              <TableHeader>TYPE</TableHeader>
              <TableHeader>WAIT TIME</TableHeader>
              <TableHeader className="text-end pe-4">ACTION</TableHeader>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <TableCell className="ps-4">
                  <BatchDoc>{item.id}</BatchDoc>
                  <DocSub>{item.docName}</DocSub>
                </TableCell>
                <TableCell>
                  <CustomBadge $color={item.typeColor}>
                    {item.type}
                  </CustomBadge>
                </TableCell>
                <TableCell>
                  <WaitTime>{item.waitTime}</WaitTime>
                </TableCell>
                <TableCell className="text-end pe-4">
                  <Button variant="outline-primary" size="sm" className="px-3" style={{fontSize: '0.8rem', fontWeight: 600}}>
                    Review
                  </Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </StyledCard>
  );
};

export default SignatureTable;
