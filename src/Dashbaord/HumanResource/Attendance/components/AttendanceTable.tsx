import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell } from '@table-library/react-table-library/table';
import React from 'react';

interface AttendanceTableProps {
  data: any;
  pagination: any;
  openActionId: number | null;
  setOpenActionId: (id: number | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, pagination, openActionId, setOpenActionId, dropdownRef }) => (
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
                  <button className='px-4 py-1 hover:text-secondary cursor-pointer duration-100'
                    onClick={() => { setOpenActionId(openActionId === item.id ? null : item.id) }}>
                    {item.actions}
                  </button>
                  {openActionId === item.id && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-32 bg-white shadow rounded-lg z-10 border">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-t-lg">View</button>
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-b-lg">Delete</button>
                    </div>
                  )}
                </Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
  </div>
);
