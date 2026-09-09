import pytest
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.tools.parallel_tool import ParallelTool
from app.models.schemas import ResearchDossier

def test_parallel_tool_initialization():
    tool = ParallelTool()
    assert tool is not None

def test_parallel_search_returns_dossier():
    tool = ParallelTool()
    topic = "The 1972 Ghost Satellite (LES-1)"
    dossier = tool.search_topic(topic=topic, target_format="12-Minute Video Essay")
    
    assert isinstance(dossier, ResearchDossier)
    assert dossier.topic == topic
    assert len(dossier.key_facts) > 0
    assert len(dossier.sources) > 0
    assert len(dossier.competitor_blindspots) > 0
    assert len(dossier.visual_reference_keywords) > 0
    
    # Check that sources have valid titles and URLs
    first_source = dossier.sources[0]
    assert first_source.title
    assert first_source.url.startswith("http")
