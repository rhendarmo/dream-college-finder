export type ProfileCreate = {
  gpa: number;
  sat?: number | null;
  act?: number | null;
  intended_major: string;
  location_preference?: string | null;
  notes?: string | null;
};

export type Profile = ProfileCreate & {
  id: number;
};

export type RecommendationRunRequest = {
  profile_id: number;
  top_k?: number;
};

export type RecommendationResultItem = {
  school_id: number;
  school_name: string;
  category: "reach" | "target" | "safety";
  probability: number;
  score: number;
  reason: string;
};

export type RecommendationRunResponse = {
  run_id: number;
  results: RecommendationResultItem[];
};