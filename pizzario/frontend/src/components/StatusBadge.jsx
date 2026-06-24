import { STATUS_LABELS, STATUS_COLORS } from '../utils/format.js';

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const cls = STATUS_COLORS[status] || 'bg-char-800 text-char-200 border-char-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

export function StatusTimeline({ history = [], current }) {
  return (
    <ol className="relative border-l-2 border-ember-800 ml-3 space-y-5 py-2">
      {history.map((h, idx) => (
        <li key={idx} className="ml-6">
          <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 bg-ember-500 rounded-full ring-4 ring-char-900"></span>
          <h4 className="font-semibold text-char-50">{STATUS_LABELS[h.status] || h.status}</h4>
          <p className="text-xs text-char-400">
            {new Date(h.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
          {h.note && <p className="text-sm text-char-300 mt-1">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}
