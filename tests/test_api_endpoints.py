import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import ScriptBeat

client = TestClient(app)

def test_health_endpoint():
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert 'parallel_configured' in data

def test_sample_projects_endpoint():
    response = client.get('/api/sample-projects')
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)


def test_spatial_comment_endpoint():
    payload = {
        'project_id': 'proj-ghost-sat',
        'beat_id': 1,
        'bounding_box': {
            'x': 65.0,
            'y': 15.0,
            'width': 25.0,
            'height': 20.0
        },
        'instruction': 'Add oscillating oscilloscope radar telemetry line'
    }
    response = client.post('/api/player/spatial-comment', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['beat_id'] == 1
    assert 'oscillating oscilloscope' in data['updated_beat']['visual_description']
    assert 'rationale' in data

def test_update_beat_endpoint():
    sample_beat = {
        'beat_id': 1,
        'timestamp': '00:00 - 00:20',
        'title': 'Cold Open',
        'narrative_function': 'Hook',
        'audio_narration': 'A dormant signal awakes.',
        'audio_sfx_cues': 'Static, beep',
        'visual_description': 'Satellite in deep orbit',
        'shot_type': 'Wide',
        'camera_movement': 'Push',
        'lighting_tone': 'Cyan',
        'asset_requirement': 'Space VFX',
        'estimated_duration_sec': 20.0,
        'retention_flag': False,
        'source_citations': []
    }
    response = client.post('/api/player/update-beat', json={'project_id': 'test', 'beat': sample_beat})
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'

def test_chat_endpoint():
    payload = {
        'message': 'How do we improve the opening hook retention?',
        'history': []
    }
    response = client.post('/api/chat', json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 'reply' in data
    assert len(data['reply']) > 20

def test_upload_document_endpoint():
    files = {'file': ('test_script.txt', b'INT. OBSERVATORY - NIGHT\nA faint signal beeps.', 'text/plain')}
    response = client.post('/api/upload-document', files=files)
    assert response.status_code == 200
    data = response.json()
    assert data['filename'] == 'test_script.txt'
    assert 'OBSERVATORY' in data['extracted_text']
