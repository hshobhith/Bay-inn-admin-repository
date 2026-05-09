/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  Button, Empty, Pagination, Rate, Result, Skeleton, Tag, Tooltip
} from 'antd';
import React, { useEffect, useState } from 'react';
import { v4 as uniqueId } from 'uuid';
import useFetchData from '../../hooks/useFetchData';
import arrayToCommaSeparatedText from '../../utils/arrayToCommaSeparatedText';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';
import QueryOptions from '../shared/QueryOptions';
import RoomStatusUpdateModal from '../shared/RoomStatusUpdateModal';

const WA_ICON_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
  '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
  '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
  '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
  '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297' +
  '-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487' +
  '.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
  '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347' +
  'm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374' +
  'a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898' +
  'a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884' +
  'm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142' +
  ' 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335' +
  ' 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

function WhatsAppIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' width='14' height='14' style={{ color: '#25D366' }}>
      <path d={WA_ICON_PATH} />
    </svg>
  );
}

function buildWaGuestMessage(data) {
  const guestName = data?.guest_name || data?.booking_by?.fullName || 'Guest';
  const roomName = data?.room?.room_name || 'the room';
  const datesText = (data?.booking_dates || []).map((d) => d.split('T')[0]).join(', ');
  const statusMap = {
    pending: 'is pending confirmation',
    approved: 'has been approved ✅',
    rejected: 'has been rejected ❌',
    cancel: 'was cancelled',
    'in-reviews': 'stay is completed 🌟 Please share your review here: https://maps.app.goo.gl/jBr4xG46ZhZhU1Xg8',
    completed: 'is completed'
  };
  const statusText = statusMap[data?.booking_status] || `status: ${data?.booking_status}`;
  return [
    '🏨 *Hotel Booking Update*',
    '',
    `Hello ${guestName},`,
    '',
    `Your booking for *${roomName}* ${statusText}.`,
    '',
    `📅 Dates: ${datesText}`,
    `🔖 Booking ID: ${data?.id || 'N/A'}`,
    '',
    'Thank you for choosing us!'
  ].map(encodeURIComponent).join('%0A');
}

function Orders() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [query, setQuery] = useState({
    search: '', sort: 'desc', page: '1', rows: '10'
  });
  const [statusUpdateModal, setStatusUpdateModal] = useState(
    { open: false, roomId: null, status: null }
  );

  // fetch booking-list API data
  const [loading, error, response] = useFetchData(`/api/v1/get-all-booking-orders?keyword=${query.search}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, fetchAgain);

  // reset query options
  useEffect(() => {
    setQuery((prevState) => ({ ...prevState, page: '1' }));
  }, [query.rows, query.search]);

  return (
    <div>
      {/* booking list ― query section */}
      <QueryOptions query={query} setQuery={setQuery} disabledSearch />

      {/* room list ― content section */}
      <div className='w-full flex flex-row flex-wrap items-center justify-center gap-2'>
        {error ? (
          <Result
            title='Failed to fetch'
            subTitle={error}
            status='error'
          />
        ) : (
          <Skeleton loading={loading} paragraph={{ rows: 10 }} active>
            {response?.data?.rows?.length === 0 ? (
              <Empty
                className='mt-10'
                description={(<span>Sorry! Any data was not found.</span>)}
              />
            ) : (
              <div className='table-layout'>
                <div className='table-layout-container'>
                  <table className='data-table'>
                    {/* data table ― head */}
                    <thead className='data-table-head'>
                      <tr className='data-table-head-tr'>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booking Dates
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booking Status
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Booked By
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booked Room
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Review & Ratting
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Booking Actions
                        </th>
                      </tr>
                    </thead>

                    {/* data table ― body */}
                    <tbody>
                      {response?.data?.rows?.map((data) => (
                        <tr className='data-table-body-tr' key={uniqueId()}>
                          <td className='data-table-body-tr-td'>
                            {arrayToCommaSeparatedText(data?.booking_dates?.map(
                              (date) => (date.split('T')[0])
                            ))}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Tag
                              className='w-[100px] text-center uppercase'
                              color={bookingStatusAsResponse(data?.booking_status).color}
                            >
                              {bookingStatusAsResponse(data?.booking_status).level}
                            </Tag>
                          </td>
                          <td className='data-table-body-tr-td'>
                            {/* Guest booking info */}
                            {data?.guest_name ? (
                              <div style={{ lineHeight: '1.6' }}>
                                <div>
                                  <strong>Name:</strong>
                                  {' '}
                                  {data.guest_name}
                                </div>
                                <div>
                                  <strong>Mobile:</strong>
                                  {' '}
                                  {data.guest_mobile}
                                </div>
                                {data.guest_aadhar && (
                                  <div>
                                    <strong>Aadhar:</strong>
                                    {' '}
                                    {data.guest_aadhar}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Registered user booking */
                              <div style={{ lineHeight: '1.6' }}>
                                <div>
                                  <strong>Name:</strong>
                                  {' '}
                                  {data?.booking_by?.fullName || 'N/A'}
                                </div>
                                {data?.booking_by?.phone && (
                                  <div>
                                    <strong>Phone:</strong>
                                    {' '}
                                    {data.booking_by.phone}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className='data-table-body-tr-td'>
                            {data?.room?.room_name}
                          </td>
                          <Tooltip
                            title={data?.reviews?.message}
                            placement='top'
                            trigger='hover'
                          >
                            <td className='data-table-body-tr-td text-center'>
                              {data?.reviews ? (
                                <Rate value={data?.reviews?.rating} disabled />
                              ) : 'N/A'}
                            </td>
                          </Tooltip>
                          <td className='data-table-body-tr-td !px-0 text-center'>
                            <div className='flex flex-col items-center gap-1'>
                              {data?.booking_status !== 'cancel' &&
                              data?.booking_status !== 'rejected' &&
                              data?.booking_status !== 'in-reviews' &&
                              data?.booking_status !== 'completed' ? (
                                <Button
                                  className='inline-flex items-center !px-2'
                                  type='primary'
                                  onClick={() => setStatusUpdateModal((prevState) => ({
                                    ...prevState, open: true, roomId: data?.id, status: data?.booking_status
                                  }))}
                                >
                                  Update Status
                                </Button>
                                ) : null}
                              {/* WhatsApp button to message guest */}
                              {(data?.guest_mobile || data?.booking_by?.phone) ? (() => {
                                const raw = (data?.guest_mobile || data?.booking_by?.phone || '').replace(/\D/g, '');
                                const waNumber = raw.length === 10 ? `91${raw}` : raw;
                                const waMessage = buildWaGuestMessage(data);
                                const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;
                                return (
                                  <Button
                                    className='inline-flex items-center gap-1 !px-2 !border-green-500 !text-green-600 hover:!bg-green-50'
                                    type='default'
                                    onClick={() => window.open(waUrl, '_blank')}
                                  >
                                    <WhatsAppIcon />
                                    WhatsApp
                                  </Button>
                                );
                              })() : (
                                <span className='text-gray-400 text-xs'>No contact</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Skeleton>
        )}
      </div>

      {/* booking list ― pagination */}
      {response?.data?.total_page > 1 && (
        <Pagination
          className='my-5'
          onChange={(e) => setQuery((prevState) => ({ ...prevState, page: e }))}
          total={response?.data?.total_page * 10}
          current={response?.data?.current_page}
        />
      )}

      {/* room status update modal component */}
      {statusUpdateModal?.open && (
        <RoomStatusUpdateModal
          statusUpdateModal={statusUpdateModal}
          setStatusUpdateModal={setStatusUpdateModal}
          setFetchAgain={setFetchAgain}
        />
      )}
    </div>
  );
}

export default Orders;
