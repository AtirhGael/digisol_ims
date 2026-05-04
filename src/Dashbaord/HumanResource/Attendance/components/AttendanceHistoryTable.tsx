import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell } from '@table-library/react-table-library/table';
import React from 'react';

interface AttendanceHistoryTableProps {
  data: any;
  pagination: any;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({ data, pagination }) => (
  <div className="overflow-x-auto">
    <Table data={data} pagination={pagination}>
      {list => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Name</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Status</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Department</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Check In</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Check Out</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Hours</HeaderCell>
              <HeaderCell className='font-normal text-[#8C8C8C] py-3!'>Actions</HeaderCell>
            </HeaderRow>
          </Header>
          <Body>
            {list.map((item: any) => (
              <Row key={item.id} item={item}>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.name}</Cell>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.status}</Cell>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.department}</Cell>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.checkIn}</Cell>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.checkOut}</Cell>
                <Cell className='font-normal text-black text-sm py-3! border-b-gray-200 border-b'>{item.hoursWorked}</Cell>
                <Cell className='font-normal text-gray-400 text-sm py-3! border-b-gray-200 border-b'>
                  <button className='px-4 py-1 hover:text-secondary cursor-pointer duration-100'>
                    {item.actions}
                  </button>
                </Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
  </div>
);
