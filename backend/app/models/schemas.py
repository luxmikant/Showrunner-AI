from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class ResearchSource(BaseModel):
    title: str
    url: str
    publish_date: Optional[str] = None
    excerpts: List[str] = Field(default_factory=list)
    domain: Optional[str] = None

class FactCitation(BaseModel):
    fact: str
    source_title: str
    source_url: str

class ResearchDossier(BaseModel):
    topic: str
    objective: str
    summary: str
    key_facts: List[FactCitation] = Field(default_factory=list)
    competitor_blindspots: List[str] = Field(default_factory=list)
    visual_reference_keywords: List[str] = Field(default_factory=list)
    sources: List[ResearchSource] = Field(default_factory=list)

class ScriptBeat(BaseModel):
    beat_id: int
    timestamp: str = "00:00 - 00:30"
    title: str
    narrative_function: str = "Hook"  # Hook, Context, Build, Climax, Resolution
    audio_narration: str
    audio_sfx_cues: str
    visual_description: str
    shot_type: str = "Cinematic Wide"
    camera_movement: str = "Slow Push-in"
    lighting_tone: str = "Moody Cyan & Amber"
    asset_requirement: str = "Stock Footage + Motion Graphics"
    estimated_duration_sec: float = 15.0
    retention_flag: bool = False
    retention_advice: Optional[str] = None
    source_citations: List[str] = Field(default_factory=list)

class ThumbnailConcept(BaseModel):
    concept_name: str
    visual_prompt: str
    focal_subject: str
    text_overlay: str
    color_contrast_scheme: str

class TitleOption(BaseModel):
    title: str
    angle: str  # Curiosity, Urgency, Contrast, Story
    estimated_ctr_tier: str = "High"

class PackagingSuite(BaseModel):
    high_ctr_titles: List[TitleOption] = Field(default_factory=list)
    thumbnail_concepts: List[ThumbnailConcept] = Field(default_factory=list)
    first_60s_hook_score: int = 92
    hook_breakdown: str = "Strong pattern interrupt with immediate stakes."

class PacingMetrics(BaseModel):
    total_runtime_seconds: float = 720.0
    total_visual_cuts: int = 85
    average_cut_duration_sec: float = 4.8
    retention_health_score: int = 88
    pacing_warnings: List[str] = Field(default_factory=list)

class ShowrunnerProject(BaseModel):
    project_id: str
    title: str
    logline: str
    format_category: str = "YouTube Narrative Short (12-18 mins)"
    target_audience: str = "Tech & Narrative Video Essay enthusiasts"
    research: ResearchDossier
    script_beats: List[ScriptBeat] = Field(default_factory=list)
    storyboard_cards: Optional[List[dict]] = None
    packaging: PackagingSuite
    metrics: PacingMetrics
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectGenerateRequest(BaseModel):
    prompt: str
    format_category: Optional[str] = "YouTube Narrative Short (12-18 mins)"
    target_duration_mins: Optional[int] = 12
    parallel_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None

class ResearchRequest(BaseModel):
    topic: str
    parallel_api_key: Optional[str] = None

class AuditPacingRequest(BaseModel):
    beats: List[ScriptBeat]

class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%H:%M"))
    citations: List[str] = Field(default_factory=list)
    thinking: Optional[str] = None
    projectResult: Optional[ShowrunnerProject] = None
    videoReady: Optional[bool] = None

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    project: Optional[ShowrunnerProject] = None
    document_context: Optional[str] = None
    parallel_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    deep_search: bool = True
    conversation_id: Optional[str] = None
    project_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    updated_project: Optional[ShowrunnerProject] = None
    citations: List[str] = Field(default_factory=list)
    thinking: Optional[str] = None
    video_ready: bool = False
    conversation_id: Optional[str] = None

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class SpatialCommentRequest(BaseModel):
    project_id: str
    beat_id: int
    bounding_box: BoundingBox
    instruction: str
    gemini_api_key: Optional[str] = None
    original_beat: Optional[ScriptBeat] = None

class UpdateBeatRequest(BaseModel):
    project_id: str
    beat: ScriptBeat
    all_beats: Optional[List[ScriptBeat]] = None

class DocumentUploadResponse(BaseModel):
    filename: str
    extracted_text_preview: str
    total_characters: int
    page_count: int
    extracted_text: Optional[str] = None

class SpatialCommentResponse(BaseModel):
    beat_id: int
    updated_beat: ScriptBeat
    rationale: str
    applied_directive: str

# ===== LOCAL FILESYSTEM PROJECT & CONVERSATION STORAGE MODELS =====

class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int
    project_id: Optional[str] = None

class ConversationDetail(BaseModel):
    id: str
    title: str
    project_id: Optional[str] = None
    created_at: str
    updated_at: str
    messages: List[ChatMessage] = Field(default_factory=list)
    project_state: Optional[ShowrunnerProject] = None

class ProjectFolder(BaseModel):
    id: str
    name: str
    slug: str
    folder_path: str
    created_at: str
    updated_at: str
    description: Optional[str] = ""
    conversations: List[ConversationSummary] = Field(default_factory=list)

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = ""

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"
    project_id: Optional[str] = None

class SaveConversationRequest(BaseModel):
    title: Optional[str] = None
    messages: List[ChatMessage] = Field(default_factory=list)
    project_state: Optional[ShowrunnerProject] = None



