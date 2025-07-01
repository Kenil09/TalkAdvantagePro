export interface HotLinkWidget {
  id: string;
  triggerWords: string[];
  name: string;
  prompt: string;
  model: string;
}

export interface Model {
  slug: string;
  hf_slug: string;
  updated_at: string;
  created_at: string;
  hf_updated_at: string | null;
  name: string;
  short_name: string;
  author: string;
  description: string;
  model_version_group_id: string | null;
  context_length: number;
}
