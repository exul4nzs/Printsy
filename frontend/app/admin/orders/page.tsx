'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-emerald-100 text-emerald-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['shipped', 'completed', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
  paid: ['processing', 'cancelled'],
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
        STATUS_COLORS[status] || 'bg-warm-gray-100 text-warm-gray-800',
      )}
    >
      {status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [page_size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Debounced search input
  const [searchInput, setSearchInput] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders({
        status: statusFilter || undefined,
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        page_size,
      });
      setOrders(data.results);
      setCount(data.count);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err?.response?.data?.error || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, dateFrom, dateTo, page, page_size]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Debounce search after 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Reload current page
      await loadOrders();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err?.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    { label: 'Order', key: 'order_number' },
    { label: 'Customer', key: 'customer_name' },
    { label: 'Items', key: 'items' },
    { label: 'Total', key: 'total_amount' },
    { label: 'Status', key: 'status' },
    { label: 'Date', key: 'created_at' },
    { label: 'Actions', key: 'actions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-gray-900">Orders</h1>
          <p className="text-warm-gray-500 mt-1">{count} total orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="btn-outline px-3 py-2 text-sm flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, name, email…"
              className="input pl-10"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input sm:w-44"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="input sm:w-40"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="input sm:w-40"
            placeholder="To"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray-50 border-b border-warm-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-3 px-4 font-semibold text-warm-gray-600 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
                    <span className="text-warm-gray-500">Loading orders…</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-warm-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const nextStatuses = STATUS_FLOW[order.status] || [];
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-warm-gray-100 last:border-0 hover:bg-warm-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-warm-gray-900">
                        #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-warm-gray-900 font-medium">
                          {order.customer_name || '—'}
                        </div>
                        {order.customer_email && (
                          <div className="text-xs text-warm-gray-400">{order.customer_email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-warm-gray-600 text-xs">
                        {order.items && order.items.length > 0
                          ? order.items.map((item: any, i: number) => (
                              <div key={i}>
                                {item.size || item.variant_id || '?'} × {item.quantity || 1}
                              </div>
                            ))
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-warm-gray-900">
                        {formatPrice(Number(order.total_amount))}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-warm-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {nextStatuses.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {nextStatuses.map((ns) => (
                              <button
                                key={ns}
                                onClick={() => handleStatusUpdate(order.id, ns)}
                                disabled={isUpdating}
                                className={cn(
                                  'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                                  'bg-warm-gray-100 text-warm-gray-700 hover:bg-accent hover:text-white',
                                  isUpdating && 'opacity-50 cursor-not-allowed',
                                )}
                              >
                                {ns === 'processing' ? 'Process' :
                                 ns === 'ready' ? 'Ready' :
                                 ns === 'completed' ? 'Complete' :
                                 ns === 'shipped' ? 'Ship' :
                                 ns === 'cancelled' ? 'Cancel' : ns}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-warm-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-warm-gray-200">
            <p className="text-sm text-warm-gray-500">
              Showing {(page - 1) * page_size + 1}–{Math.min(page * page_size, count)} of {count}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg bg-warm-gray-100 hover:bg-warm-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-warm-gray-600 font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg bg-warm-gray-100 hover:bg-warm-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
