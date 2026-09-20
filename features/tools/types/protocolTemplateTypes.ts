export type ProtocolTemplateMetricDetails = {
  count: number | null;
  unit_name: string | null;
};

export type ProtocolTemplateFrequencyDetails = {
  interval: number | null;
  frequency_type: string | null;
};

export type ProtocolTemplateDurationDetails = {
  all_day: boolean;
  start_time: string | null;
  end_time?: string | null;
};

export type ProtocolTemplateBlueprint = {
  name: string;
  description: string;
  habit_type: number | string | null;
  color: string | null;
  icon: string | null;
  metric_details: ProtocolTemplateMetricDetails;
  frequency_details: ProtocolTemplateFrequencyDetails;
  duration_details: ProtocolTemplateDurationDetails;
};

export type ProtocolTemplateSection = {
  title: string;
  content: string;
};

export type ProtocolTemplateApiItem = {
  id: number;
  title: string;
  name: string;
  description: string;
  context: string | null;
  benefits: string[];
  category: string | null;
  template_type: string | null;
  level: string | null;
  xp_reward: number;
  tags: string[];
  protocols: unknown[];
  blueprints: ProtocolTemplateBlueprint[];
  image: string | null;
  sections: ProtocolTemplateSection[];
  rating: number | null;
  review_count: number;
  reviews: unknown[];
};

export type ProtocolTemplatePagination = {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results_count: number;
};

export type ProtocolTemplateListResponse = {
  success: boolean;
  message: string;
  data: ProtocolTemplateApiItem[];
  pagination: ProtocolTemplatePagination;
};

export type ProtocolTemplateDetailResponse = {
  success: boolean;
  message: string;
  data: ProtocolTemplateApiItem;
};
