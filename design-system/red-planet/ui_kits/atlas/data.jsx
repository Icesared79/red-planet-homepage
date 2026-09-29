const SOURCES = [
  { id: 'SRC-0142', name: 'Fairfield County Recorder', kind: 'Recorder', market: 'CT', status: 'live', rows: 2418339, last: '9h', cadence: 'Nightly' },
  { id: 'SRC-0151', name: 'New Haven Town Clerk', kind: 'Recorder', market: 'CT', status: 'live', rows: 1302118, last: '9h', cadence: 'Nightly' },
  { id: 'SRC-0077', name: 'Hartford Superior Court', kind: 'Court', market: 'CT', status: 'stale', rows: 880412, last: '3d', cadence: 'Nightly' },
  { id: 'SRC-0310', name: 'Miami-Dade Tax Collector', kind: 'Tax', market: 'FL', status: 'failed', rows: 1204551, last: 'E-504', cadence: 'Nightly' },
  { id: 'SRC-0322', name: 'Broward County Commission', kind: 'Government', market: 'FL', status: 'live', rows: 48210, last: '11h', cadence: 'Daily' },
  { id: 'SRC-0402', name: 'Erie County Clerk', kind: 'Recorder', market: 'NY', status: 'activating', rows: 0, last: '—', cadence: 'Nightly' },
  { id: 'SRC-0405', name: 'Niagara County Treasurer', kind: 'Tax', market: 'NY', status: 'live', rows: 312904, last: '9h', cadence: 'Nightly' },
  { id: 'SRC-0520', name: 'Wake County Register of Deeds', kind: 'Recorder', market: 'NC', status: 'live', rows: 1998230, last: '9h', cadence: 'Nightly' },
  { id: 'SRC-0533', name: 'Mecklenburg Code Enforcement', kind: 'Code', market: 'NC', status: 'dormant', rows: 102377, last: '41d', cadence: 'Paused' },
  { id: 'SRC-0611', name: 'NYC ACRIS · Manhattan', kind: 'Recorder', market: 'NYC', status: 'live', rows: 3104882, last: '9h', cadence: 'Nightly' },
  { id: 'SRC-0189', name: 'Stamford Building Dept.', kind: 'Code', market: 'CT', status: 'stale', rows: 77120, last: '2d', cadence: 'Nightly' },
  { id: 'SRC-0344', name: 'Palm Beach Clerk of Court', kind: 'Court', market: 'FL', status: 'failed', rows: 640019, last: 'E-429', cadence: 'Nightly' },
];
const GEOGRAPHIES = [
  { id: 'g1', name: 'Connecticut', status: 'live', meta: '9h' },
  { id: 'g2', name: 'Florida', status: 'live', meta: '9h' },
  { id: 'g3', name: 'North Carolina', status: 'live', meta: '9h' },
  { id: 'g4', name: 'New York · Niagara and Erie', status: 'live', meta: '9h' },
  { id: 'g5', name: 'New York City · Manhattan', status: 'live', meta: '9h' },
  { id: 'g6', name: 'Rhode Island', status: 'activating', meta: '62%' },
];
const FLOW = {
  stages: [{ key: 'src', label: 'Sources', count: '2,418' }, { key: 'tbl', label: 'Tables', count: 312 }, { key: 'lyr', label: 'Layers', count: 41 }, { key: 'plc', label: 'Places', count: 6 }, { key: 'sto', label: 'Storage', count: 3 }],
  nodes: [
    { id: 's1', stage: 'src', label: 'Fairfield Recorder', meta: 'SRC-0142', status: 'live' }, { id: 's2', stage: 'src', label: 'Hartford Court', meta: 'SRC-0077', status: 'stale' }, { id: 's3', stage: 'src', label: 'Miami-Dade Tax', meta: 'SRC-0310', status: 'failed' }, { id: 's4', stage: 'src', label: 'Broward Commission', meta: 'SRC-0322', status: 'live' }, { id: 's5', stage: 'src', label: 'Erie County Clerk', meta: 'SRC-0402', status: 'activating' },
    { id: 't1', stage: 'tbl', label: 'deeds', meta: '9.8M rows', status: 'live' }, { id: 't2', stage: 'tbl', label: 'liens', meta: '2.1M rows', status: 'live' }, { id: 't3', stage: 'tbl', label: 'tax_status', meta: '4.4M rows', status: 'stale' }, { id: 't4', stage: 'tbl', label: 'decisions', meta: '48K rows', status: 'live' },
    { id: 'l1', stage: 'lyr', label: 'Ownership', meta: 'resolved', status: 'live' }, { id: 'l2', stage: 'lyr', label: 'Distress events', meta: 'events', status: 'live' }, { id: 'l3', stage: 'lyr', label: 'Land-use decisions', meta: 'decisions', status: 'live' },
    { id: 'p1', stage: 'plc', label: 'Parcels', meta: '18.2M', status: 'live' }, { id: 'p2', stage: 'plc', label: 'Governing bodies', meta: '3,114', status: 'live' },
    { id: 'o1', stage: 'sto', label: 'Version archive', meta: '777.9M all-time', status: 'live' }, { id: 'o2', stage: 'sto', label: 'Serving warehouse', meta: '502.4M verified', status: 'live' },
  ],
  edges: [{ from: 's1', to: 't1' }, { from: 's1', to: 't2' }, { from: 's2', to: 't2' }, { from: 's3', to: 't3', status: 'failed' }, { from: 's4', to: 't4' }, { from: 's5', to: 't1' }, { from: 't1', to: 'l1' }, { from: 't2', to: 'l2' }, { from: 't3', to: 'l2', status: 'failed' }, { from: 't4', to: 'l3' }, { from: 'l1', to: 'p1' }, { from: 'l2', to: 'p1' }, { from: 'l3', to: 'p2' }, { from: 'l1', to: 'p2' }, { from: 'p1', to: 'o1' }, { from: 'p1', to: 'o2' }, { from: 'p2', to: 'o1' }, { from: 'p2', to: 'o2' }],
};
Object.assign(window, { SOURCES, FLOW, GEOGRAPHIES });
