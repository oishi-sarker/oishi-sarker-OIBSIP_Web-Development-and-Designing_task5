export const formatINR = (amount) => {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const STATUS_LABELS = {
  pending: 'Pending',
  received: 'Order Received',
  in_kitchen: 'In the Kitchen',
  sent_to_delivery: 'Sent to Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  received: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  in_kitchen: 'bg-ember-900/40 text-ember-300 border-ember-700/50',
  sent_to_delivery: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  delivered: 'bg-green-900/40 text-green-300 border-green-700/50',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700/50',
};

export const STATUS_FLOW = ['pending', 'received', 'in_kitchen', 'sent_to_delivery', 'delivered'];
