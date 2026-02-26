export type ConversationState =
  | 'collecting_intent'
  | 'awaiting_confirmation'
  | 'job_created'
  | 'monitoring'
  | 'completed'
  | 'failed';

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string | null;
  state: ConversationState;
  active_proposal_version: number;
  inserted_at: string;
  updated_at: string;
}

export interface ConversationMessageRecord {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_trace_ref?: string | null;
  inserted_at: string;
  updated_at: string;
}

export interface ConversationProposalRecord {
  id: string;
  conversation_id: string;
  version: number;
  normalized_query: string;
  filters_json?: Record<string, unknown> | null;
  collection_plan?: Record<string, unknown> | null;
  reuse_candidates?: ReuseCandidateRecord[] | null;
  status: 'pending' | 'confirmed' | 'superseded';
  inserted_at: string;
  updated_at: string;
}

export interface ReuseCandidateRecord {
  job_id: string;
  query: string;
  updated_at: string;
  similarity_score: number;
}

export interface ClarificationRecord {
  missing_fields: string[];
  question: string;
}

export interface ConversationTurnRecord {
  conversation: ConversationRecord;
  conversation_state?: ConversationState | null;
  assistant_message: ConversationMessageRecord;
  proposal?: ConversationProposalRecord | null;
  clarification?: ClarificationRecord | null;
  agent_trace_id?: string | null;
  pending_proposal?: ConversationProposalRecord | null;
}

export interface ConversationSnapshotRecord {
  conversation: ConversationRecord;
  messages: ConversationMessageRecord[];
  pending_proposal?: ConversationProposalRecord | null;
  active_job_id?: string | null;
}

export interface ConfirmConversationJobRecord {
  conversation_id: string;
  proposal_id: string;
  job_id: string;
  status: string;
}

export interface ConfirmConversationJobInput {
  proposalVersion: number;
  idempotencyKey: string;
  action?: 'startNew' | 'useExisting';
  selectedJobId?: string;
  collectionPlanOverrides?: Record<string, unknown>;
}

export type ConversationStreamEventType =
  | 'turn_start'
  | 'assistant_token'
  | 'clarification'
  | 'proposal_ready'
  | 'turn_complete'
  | 'error';

export interface ConversationStreamEvent {
  event: ConversationStreamEventType;
  payload: Record<string, unknown>;
}
