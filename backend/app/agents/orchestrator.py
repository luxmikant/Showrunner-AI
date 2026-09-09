import uuid
import logging
from typing import Optional
from app.models.schemas import ShowrunnerProject
from app.agents.trend_scout import TrendScoutAgent
from app.agents.beat_architect import BeatArchitectAgent
from app.agents.visual_director import VisualDirectorAgent
from app.agents.retention_auditor import RetentionAuditorAgent

logger = logging.getLogger(__name__)

class ShowrunnerOrchestrator:
    """
    Master Multi-Agent Orchestrator.
    Executes the 4-stage pipeline:
    1. Trend & Lore Scout (Parallel Web Systems)
    2. Narrative & Beat Architect (Gemini AV Screenplay)
    3. Visual Director & Storyboarder (Cinematography & Previs)
    4. Packaging & Retention Auditor (Pacing & YouTube Packaging)
    """
    def __init__(self):
        pass

    def run(
        self,
        prompt: str,
        format_category: str = "YouTube Narrative Short (12-18 mins)",
        target_duration_mins: int = 12,
        parallel_api_key: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ) -> ShowrunnerProject:
        logger.info(f"[ShowrunnerOrchestrator] Starting Showrunner pipeline for: '{prompt}'")
        
        # Stage 1: Trend & Lore Scout (Parallel)
        scout = TrendScoutAgent(parallel_api_key=parallel_api_key)
        dossier = scout.research(topic=prompt, target_format=format_category)
        
        # Stage 2: Narrative Beat Architect (Gemini)
        architect = BeatArchitectAgent(gemini_api_key=gemini_api_key)
        beats = architect.generate_av_script(
            topic=prompt,
            dossier=dossier,
            target_duration_mins=target_duration_mins
        )
        
        # Stage 3: Visual Director & Storyboard Directives
        director = VisualDirectorAgent()
        storyboard_cards = director.enrich_storyboard_directives(beats=beats, dossier=dossier)
        
        # Stage 4: Retention & Packaging Auditor
        auditor = RetentionAuditorAgent()
        metrics, packaging = auditor.audit_and_package(topic=prompt, beats=beats, dossier=dossier)
        
        # Generate cohesive project title
        project_title = f"{prompt.title()}: The Secret Record" if len(prompt) < 30 else prompt.title()
        logline = (
            f"An immersive {format_category.lower()} unravelling the unexplained events of {prompt}, "
            f"contrasting official declassified records against verified ground telemetry."
        )
        
        project = ShowrunnerProject(
            project_id=f"proj_{uuid.uuid4().hex[:10]}",
            title=project_title,
            logline=logline,
            format_category=format_category,
            target_audience="Digital entertainment viewers, video essayists & curious minds",
            research=dossier,
            script_beats=beats,
            storyboard_cards=storyboard_cards,
            packaging=packaging,
            metrics=metrics
        )
        
        logger.info(f"[ShowrunnerOrchestrator] Project '{project.title}' successfully generated with {len(beats)} beats!")
        return project

# Global orchestrator instance
showrunner_orchestrator = ShowrunnerOrchestrator()
