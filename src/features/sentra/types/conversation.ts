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
  status: 'pending' | 'confirmed' | 'superseded';
  inserted_at: string;
  updated_at: string;
}

export interface ConversationTurnRecord {
  conversation: ConversationRecord;
  assistant_message: ConversationMessageRecord;
  pending_proposal?: ConversationProposalRecord | null;
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
}
