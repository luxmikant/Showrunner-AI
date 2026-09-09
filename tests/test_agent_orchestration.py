import pytest
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.agents.orchestrator import showrunner_orchestrator
from app.models.schemas import ShowrunnerProject

def test_full_orchestration_pipeline():
    prompt = "The Lost Soviet Cosmonaut Radio Transmissions"
    format_cat = "Narrative YouTube Short (15 mins)"
    
    project = showrunner_orchestrator.run(
        prompt=prompt,
        format_category=format_cat,
        target_duration_mins=15
    )
    
    assert isinstance(project, ShowrunnerProject)
    assert project.project_id.startswith("proj_")
    assert project.format_category == format_cat
    
    # Verify Research
    assert project.research.topic == prompt
    assert len(project.research.key_facts) >= 3
    
    # Verify Script Beats
    assert len(project.script_beats) >= 4
    for beat in project.script_beats:
        assert beat.beat_id > 0
        assert beat.timestamp
        assert beat.audio_narration
        assert beat.visual_description
        assert beat.shot_type
        assert beat.lighting_tone
        
    # Verify Packaging Suite
    assert len(project.packaging.high_ctr_titles) >= 3
    assert len(project.packaging.thumbnail_concepts) >= 3
    assert project.packaging.first_60s_hook_score > 0
    
    # Verify Pacing Metrics
    assert project.metrics.total_runtime_seconds > 0
    assert project.metrics.total_visual_cuts > 0
    assert project.metrics.retention_health_score >= 60
