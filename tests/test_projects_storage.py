import pytest
import sys
import os
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_project_lifecycle():
    # 1. Create project folder
    create_res = client.post('/api/projects', json={
        'name': 'Test Documentary Production',
        'description': 'Testing filesystem project storage'
    })
    assert create_res.status_code == 200
    proj_data = create_res.json()
    assert proj_data['name'] == 'Test Documentary Production'
    assert 'test-documentary-production' in proj_data['slug']
    assert os.path.exists(proj_data['folder_path'])
    assert os.path.isdir(os.path.join(proj_data['folder_path'], 'conversations'))
    proj_id = proj_data['id']

    # 2. List projects
    list_res = client.get('/api/projects')
    assert list_res.status_code == 200
    projects = list_res.json()
    matching = [p for p in projects if p['id'] == proj_id]
    assert len(matching) == 1

    # 3. Create conversation inside this project folder
    conv_res = client.post('/api/conversations', json={
        'title': 'Beat Structuring Session',
        'project_id': proj_id
    })
    assert conv_res.status_code == 200
    conv_data = conv_res.json()
    assert conv_data['title'] == 'Beat Structuring Session'
    assert conv_data['project_id'] == proj_id
    conv_id = conv_data['id']

    # Verify conversation file physically exists in project/conversations/
    conv_file = os.path.join(proj_data['folder_path'], 'conversations', f'{conv_id}.json')
    assert os.path.exists(conv_file)

    # 4. Chat inside this project conversation with auto-persistence
    chat_res = client.post('/api/chat', json={
        'message': 'How should we pace the cold open?',
        'conversation_id': conv_id,
        'project_id': proj_id,
        'history': []
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert 'reply' in chat_data

    # 5. Fetch updated conversation from disk
    get_conv_res = client.get(f'/api/conversations/{conv_id}')
    assert get_conv_res.status_code == 200
    loaded_conv = get_conv_res.json()
    assert len(loaded_conv['messages']) >= 2
    assert loaded_conv['messages'][0]['role'] == 'user'
    assert 'cold open' in loaded_conv['messages'][0]['content']
    assert loaded_conv['messages'][1]['role'] == 'assistant'

    # 6. Delete conversation
    del_conv_res = client.delete(f'/api/conversations/{conv_id}')
    assert del_conv_res.status_code == 200
    assert not os.path.exists(conv_file)

    # 7. Delete project folder
    del_proj_res = client.delete(f'/api/projects/{proj_id}')
    assert del_proj_res.status_code == 200
    assert not os.path.exists(proj_data['folder_path'])

def test_independent_conversation_lifecycle():
    # 1. Create independent conversation (not attached to any project)
    create_res = client.post('/api/conversations', json={
        'title': 'Independent Brainstorm'
    })
    assert create_res.status_code == 200
    conv_data = create_res.json()
    assert conv_data['title'] == 'Independent Brainstorm'
    assert conv_data['project_id'] is None
    conv_id = conv_data['id']

    # 2. List independent conversations
    list_res = client.get('/api/conversations')
    assert list_res.status_code == 200
    convs = list_res.json()
    matching = [c for c in convs if c['id'] == conv_id]
    assert len(matching) == 1

    # 3. Chat and persist turn
    chat_res = client.post('/api/chat', json={
        'message': 'Give me three cinematic camera angles.',
        'conversation_id': conv_id,
        'history': []
    })
    assert chat_res.status_code == 200

    # 4. Load from disk
    get_res = client.get(f'/api/conversations/{conv_id}')
    assert get_res.status_code == 200
    detail = get_res.json()
    assert len(detail['messages']) >= 2

    # 5. Clean up
    del_res = client.delete(f'/api/conversations/{conv_id}')
    assert del_res.status_code == 200
