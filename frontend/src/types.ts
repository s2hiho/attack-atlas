export interface LogEvent {
  [key: string]: unknown;
  Time?: string;
  EventID?: string | number;
  LogType?: string;
  Source?: string;
  Severity?: string;
  Process?: string;
  User?: string;
  Target?: string;
  Host?: string;
  LogFile?: string;
}
export interface RouteNode {
  id: string;
  label: string;
  process?: string;
  time: string;
  event_id: number;
  severity: string;
  type: string;
}
export interface UploadData {
  summary: { filenames: string[]; total_files: number; total_events: number; sources: string[] };
  events: LogEvent[];
  route: { nodes: RouteNode[]; edges: { id: string; source: string; target: string; relation: string }[] };
}
