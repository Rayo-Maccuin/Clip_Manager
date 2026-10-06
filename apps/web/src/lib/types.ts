export type ClipStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "SELECTED"
  | "EDITED"
  | "PUBLISHED"
  | "DISCARDED";

export type Stream = {
  id: string;
  title: string;
  vodUrl: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
};

export type Clip = {
  id: string;
  streamId: string;
  title: string;
  description: string | null;
  timestamp: number;
  duration: number;
  status: ClipStatus;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
};

export type Tag = {
  id: string;
  name: string;
  createdAt: string;
  usageCount?: number;
};

export type Suggestion = {
  platform: string;
  format: string;
  reason: string;
  action: string;
};
