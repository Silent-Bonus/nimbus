// Journal and reflection API types.

export interface JournalListItem {
  id: number;
  title: string;
  image: string;
  category: string;
  description: string;
  icon: string;
  prompts: {
    id: number;
    text: string;
  };
}

export interface JournalListResponse {
  data: JournalListItem[];
  message: string;
}

export interface JournalSubmitRequest {
  template_id: number;
  answers: { id: number; answer: string }[];
}

export interface JournalSubmitResponse {
  status: string;
  message: string;
}

export type JournalAnswer = {
  prompt_text: string;
  answer: string;
};

export interface JournalEntryListResponse {
  id: number;
  template_title: string;
  created_at: string;
  answers: JournalAnswer[];
}

export type MentalTestItem = {
  id: string;
  title: string;
  image: string;
};

export interface MentalTestListResponse {
  data: MentalTestItem[];
  success: boolean;
}
