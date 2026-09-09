export interface ResearchSource {
  title: string;
  url: string;
  publish_date?: string;
  excerpts: string[];
  domain?: string;
}

export interface FactCitation {
  fact: string;
  source_title: string;
  source_url: string;
}

export interface ResearchDossier {
  topic: string;
  objective: string;
  summary: string;
  key_facts: FactCitation[];
  competitor_blindspots: string[];
  visual_reference_keywords: string[];
  sources: ResearchSource[];
}

export interface ScriptBeat {
  beat_id: number;
  timestamp: string;
  title: string;
  narrative_function: string;
  audio_narration: string;
  audio_sfx_cues: string;
  visual_description: string;
  shot_type: string;
  camera_movement: string;
  lighting_tone: string;
  asset_requirement: string;
  estimated_duration_sec: number;
  retention_flag: boolean;
  retention_advice?: string;
  source_citations: string[];
}

export interface TitleOption {
  title: string;
  angle: string;
  estimated_ctr_tier: string;
}

export interface ThumbnailConcept {
  concept_name: string;
  visual_prompt: string;
  focal_subject: string;
  text_overlay: string;
  color_contrast_scheme: string;
}

export interface PackagingSuite {
  high_ctr_titles: TitleOption[];
  thumbnail_concepts: ThumbnailConcept[];
  first_60s_hook_score: number;
  hook_breakdown: string;
}

export interface PacingMetrics {
  total_runtime_seconds: number;
  total_visual_cuts: number;
  average_cut_duration_sec: number;
  retention_health_score: number;
  pacing_warnings: string[];
}

export interface ShowrunnerProject {
  project_id: string;
  title: string;
  logline: string;
  format_category: string;
  target_audience: string;
  research: ResearchDossier;
  script_beats: ScriptBeat[];
  packaging: PackagingSuite;
  metrics: PacingMetrics;
  created_at: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: string[];
  thinking?: string;
  projectResult?: ShowrunnerProject;
  videoReady?: boolean;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpatialCommentResponse {
  beat_id: number;
  updated_beat: ScriptBeat;
  rationale: string;
  applied_directive: string;
}

export interface DocumentUploadResponse {
  filename: string;
  extracted_text_preview: string;
  total_characters: number;
  page_count: number;
  extracted_text?: string;
}

export interface TextOverlaySettings {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  shadow: boolean;
  letterSpacing: string;
  positionY: 'top' | 'center' | 'bottom';
  backgroundColor: string;
}

