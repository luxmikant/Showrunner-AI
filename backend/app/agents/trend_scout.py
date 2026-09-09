import logging
from typing import Optional
from app.models.schemas import ResearchDossier
from app.tools.parallel_tool import ParallelTool

logger = logging.getLogger(__name__)

class TrendScoutAgent:
    """
    Agent 1: The Trend & Lore Scout.
    Responsible for autonomous web research, fact verification, competitor blindspot analysis,
    and visual keyword scouting powered by the Parallel Web Search API.
    """
    def __init__(self, parallel_api_key: Optional[str] = None):
        self.parallel_tool = ParallelTool(api_key=parallel_api_key)

    def research(self, topic: str, target_format: str = "YouTube Narrative Short") -> ResearchDossier:
        logger.info(f"[TrendScoutAgent] Initiating Parallel research for '{topic}' ({target_format})")
        dossier = self.parallel_tool.search_topic(topic=topic, target_format=target_format)
        logger.info(f"[TrendScoutAgent] Gathered {len(dossier.sources)} sources and {len(dossier.key_facts)} key facts.")
        return dossier
