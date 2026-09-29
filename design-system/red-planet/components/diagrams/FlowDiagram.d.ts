export interface FlowStage { key: string; label: string; count?: number | string; }
export interface FlowNode { id: string; stage: string; label: string; meta?: string; status?: 'live' | 'dormant' | 'activating' | 'stale' | 'failed'; }
export interface FlowEdge { from: string; to: string; status?: 'ok' | 'failed'; attention?: boolean; }
/**
 * Lineage diagram: columns of nodes (sources → tables → layers → places → storage) joined by thin curved connectors. Selecting a node traces its upstream and downstream path.
 * @startingPoint section="Atlas" subtitle="Lineage flow — sources to storage" viewport="1000x420"
 */
export interface FlowDiagramProps {
  stages: FlowStage[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  className?: string;
}
export declare function FlowDiagram(props: FlowDiagramProps): JSX.Element;
