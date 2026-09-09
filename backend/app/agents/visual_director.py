import logging
from typing import List, Dict, Any
from app.models.schemas import ScriptBeat, ResearchDossier

logger = logging.getLogger(__name__)

class VisualDirectorAgent:
    """
    Agent 3: The Visual Director & Storyboarder.
    Solves the 'wall of text' handoff problem between writer and editor/animator.
    Generates actionable visual shot cards, composition directives, B-roll search queries,
    and generative previs prompts for every beat in the AV script.
    """
    def __init__(self):
        pass

    def enrich_storyboard_directives(self, beats: List[ScriptBeat], dossier: ResearchDossier) -> List[Dict[str, Any]]:
        logger.info(f"[VisualDirectorAgent] Generating visual storyboard directives for {len(beats)} beats.")
        
        cards = []
        for beat in beats:
            # Generate AI Previs Image Prompt for artists/tools
            previs_prompt = (
                f"Cinematic {beat.shot_type.lower()}, {beat.visual_description.lower()}, "
                f"lighting: {beat.lighting_tone.lower()}, camera movement: {beat.camera_movement.lower()}, "
                "anamorphic lens flare, 8k resolution, photorealistic cinematic still, 35mm film grain, masterpiece."
            )
            
            # Formulate targeted B-Roll & stock search queries
            b_roll_queries = [
                f"{beat.asset_requirement} 4k",
                f"{dossier.topic} {beat.shot_type.split()[0]} footage",
                f"{beat.lighting_tone.split()[0]} cinematic B-roll"
            ]
            
            card = {
                "beat_id": beat.beat_id,
                "timestamp": beat.timestamp,
                "title": beat.title,
                "shot_composition": {
                    "shot_type": beat.shot_type,
                    "movement": beat.camera_movement,
                    "aspect_ratio": "16:9 (Cinemascope 2.39:1 letterbox optional)",
                    "depth_of_field": "Shallow f/1.8 for close-ups, Deep f/8 for landscape/space",
                    "focal_length": "85mm prime or 24mm wide angle"
                },
                "color_and_lighting": {
                    "palette_keywords": beat.lighting_tone,
                    "lut_recommendation": "Kodak 2383 Print Film Emulation with high contrast shadows",
                    "dominant_tones": ["#0b0f19", "#1e293b", "#38bdf8", "#f59e0b"]
                },
                "editor_b_roll_tags": b_roll_queries,
                "previs_image_prompt": previs_prompt,
                "sound_sync_cue": beat.audio_sfx_cues
            }
            cards.append(card)
            
        return cards
