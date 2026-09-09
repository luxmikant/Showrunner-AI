import os
import json
import re
import time
import shutil
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone

from app.models.schemas import (
    ProjectFolder,
    ConversationSummary,
    ConversationDetail,
    ChatMessage,
    ShowrunnerProject,
    SaveConversationRequest
)

# Root directory: e:\agentic blockbuster hackathon
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
WORKSPACE_DIR = ROOT_DIR / "workspace"
PROJECTS_DIR = WORKSPACE_DIR / "projects"
CONVERSATIONS_DIR = WORKSPACE_DIR / "conversations"

# Ensure root workspace folders exist
os.makedirs(PROJECTS_DIR, exist_ok=True)
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

def _slugify(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9_\-\s]', '', name).strip().lower()
    slug = re.sub(r'[\s_]+', '-', slug)
    return slug or f"project-{int(time.time())}"

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# =====================================================================
# PROJECT DIRECTORY MANAGEMENT (PHYSICAL FOLDERS ON DISK)
# =====================================================================

def create_project(name: str, description: str = "") -> ProjectFolder:
    """
    Creates a physical project directory on the local disk under workspace/projects/{slug}/
    with dedicated conversations/ and exports/ subdirectories.
    """
    slug = _slugify(name)
    project_dir = PROJECTS_DIR / slug
    
    # Handle duplicate folder names by appending counter
    counter = 1
    base_slug = slug
    while project_dir.exists():
        slug = f"{base_slug}-{counter}"
        project_dir = PROJECTS_DIR / slug
        counter += 1

    # Create directory structure on disk
    os.makedirs(project_dir / "conversations", exist_ok=True)
    os.makedirs(project_dir / "exports", exist_ok=True)

    project_id = f"proj_{slug}"
    now = _now_iso()
    
    project_metadata = {
        "id": project_id,
        "name": name,
        "slug": slug,
        "folder_path": str(project_dir),
        "description": description,
        "created_at": now,
        "updated_at": now
    }

    meta_file = project_dir / "project.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(project_metadata, f, indent=2)

    return ProjectFolder(
        id=project_id,
        name=name,
        slug=slug,
        folder_path=str(project_dir),
        description=description,
        created_at=now,
        updated_at=now,
        conversations=[]
    )

def list_projects() -> List[ProjectFolder]:
    """
    Scans the workspace/projects directory and returns all project folders with their conversations.
    """
    projects: List[ProjectFolder] = []
    if not PROJECTS_DIR.exists():
        return projects

    for entry in sorted(PROJECTS_DIR.iterdir()):
        if entry.is_dir():
            meta_file = entry / "project.json"
            if meta_file.exists():
                try:
                    with open(meta_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    # Scan conversations inside this project directory
                    conversations: List[ConversationSummary] = []
                    conv_dir = entry / "conversations"
                    if conv_dir.exists():
                        for cf in sorted(conv_dir.glob("*.json")):
                            try:
                                with open(cf, "r", encoding="utf-8") as cff:
                                    cdata = json.load(f) if False else json.load(cff)
                                conversations.append(ConversationSummary(
                                    id=cdata.get("id", cf.stem),
                                    title=cdata.get("title", "Untitled Session"),
                                    created_at=cdata.get("created_at", _now_iso()),
                                    updated_at=cdata.get("updated_at", _now_iso()),
                                    message_count=len(cdata.get("messages", [])),
                                    project_id=data.get("id")
                                ))
                            except Exception:
                                pass

                    conversations.sort(key=lambda c: c.updated_at, reverse=True)

                    projects.append(ProjectFolder(
                        id=data.get("id", f"proj_{entry.name}"),
                        name=data.get("name", entry.name),
                        slug=data.get("slug", entry.name),
                        folder_path=str(entry),
                        description=data.get("description", ""),
                        created_at=data.get("created_at", _now_iso()),
                        updated_at=data.get("updated_at", _now_iso()),
                        conversations=conversations
                    ))
                except Exception:
                    pass

    projects.sort(key=lambda p: p.updated_at, reverse=True)
    return projects

def get_project(project_id: str) -> Optional[ProjectFolder]:
    for p in list_projects():
        if p.id == project_id or p.slug == project_id:
            return p
    return None

def delete_project(project_id: str) -> bool:
    target_p = get_project(project_id)
    if target_p and os.path.exists(target_p.folder_path):
        shutil.rmtree(target_p.folder_path)
        return True
    return False

# =====================================================================
# CONVERSATION MANAGEMENT (INDEPENDENT OR UNDER PROJECT)
# =====================================================================

def _find_conversation_file(conv_id: str) -> Optional[Path]:
    """Finds the JSON file for a conversation across root or project directories."""
    # Check independent conversations first
    independent_file = CONVERSATIONS_DIR / f"{conv_id}.json"
    if independent_file.exists():
        return independent_file

    # Check project directories
    if PROJECTS_DIR.exists():
        for proj_dir in PROJECTS_DIR.iterdir():
            if proj_dir.is_dir():
                conv_file = proj_dir / "conversations" / f"{conv_id}.json"
                if conv_file.exists():
                    return conv_file
    return None

def list_independent_conversations() -> List[ConversationSummary]:
    """
    Returns all independent conversations (not attached to any project directory).
    """
    summaries: List[ConversationSummary] = []
    if not CONVERSATIONS_DIR.exists():
        return summaries

    for cf in sorted(CONVERSATIONS_DIR.glob("*.json")):
        try:
            with open(cf, "r", encoding="utf-8") as f:
                data = json.load(f)
            summaries.append(ConversationSummary(
                id=data.get("id", cf.stem),
                title=data.get("title", "Untitled Conversation"),
                created_at=data.get("created_at", _now_iso()),
                updated_at=data.get("updated_at", _now_iso()),
                message_count=len(data.get("messages", [])),
                project_id=None
            ))
        except Exception:
            pass

    summaries.sort(key=lambda s: s.updated_at, reverse=True)
    return summaries

def create_conversation(title: str = "New Conversation", project_id: Optional[str] = None) -> ConversationDetail:
    """
    Creates an independent conversation (saved in workspace/conversations/)
    or a project-scoped conversation (saved in workspace/projects/{project}/conversations/).
    """
    conv_id = f"conv_{int(time.time() * 1000)}"
    now = _now_iso()

    conv_data = {
        "id": conv_id,
        "title": title,
        "project_id": project_id,
        "created_at": now,
        "updated_at": now,
        "messages": [],
        "project_state": None
    }

    if project_id:
        target_p = get_project(project_id)
        if target_p:
            save_path = Path(target_p.folder_path) / "conversations" / f"{conv_id}.json"
            # Update project's updated_at
            meta_path = Path(target_p.folder_path) / "project.json"
            if meta_path.exists():
                try:
                    with open(meta_path, "r", encoding="utf-8") as mf:
                        mdata = json.load(mf)
                    mdata["updated_at"] = now
                    with open(meta_path, "w", encoding="utf-8") as mf:
                        json.dump(mdata, mf, indent=2)
                except Exception:
                    pass
        else:
            save_path = CONVERSATIONS_DIR / f"{conv_id}.json"
    else:
        save_path = CONVERSATIONS_DIR / f"{conv_id}.json"

    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(conv_data, f, indent=2)

    return ConversationDetail(
        id=conv_id,
        title=title,
        project_id=project_id,
        created_at=now,
        updated_at=now,
        messages=[],
        project_state=None
    )

def get_conversation(conv_id: str) -> Optional[ConversationDetail]:
    conv_file = _find_conversation_file(conv_id)
    if not conv_file:
        return None

    try:
        with open(conv_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        messages = [ChatMessage(**m) for m in data.get("messages", [])]
        project_state = ShowrunnerProject(**data["project_state"]) if data.get("project_state") else None

        return ConversationDetail(
            id=data.get("id", conv_id),
            title=data.get("title", "Conversation"),
            project_id=data.get("project_id"),
            created_at=data.get("created_at", _now_iso()),
            updated_at=data.get("updated_at", _now_iso()),
            messages=messages,
            project_state=project_state
        )
    except Exception as e:
        print(f"Error loading conversation {conv_id}: {e}")
        return None

def save_conversation(conv_id: str, request: SaveConversationRequest) -> Optional[ConversationDetail]:
    conv_file = _find_conversation_file(conv_id)
    if not conv_file:
        return None

    try:
        with open(conv_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        now = _now_iso()
        data["updated_at"] = now
        
        # Update title if provided or auto-derive title from first user message if untitled
        if request.title:
            data["title"] = request.title
        elif data.get("title") in ("New Conversation", "Untitled Conversation", "") and request.messages:
            first_user_msg = next((m.content for m in request.messages if m.role == 'user'), None)
            if first_user_msg:
                derived = first_user_msg.strip()
                if len(derived) > 36:
                    derived = derived[:36].rsplit(' ', 1)[0] + '...'
                data["title"] = derived

        data["messages"] = [m.model_dump() for m in request.messages]
        data["project_state"] = request.project_state.model_dump() if request.project_state else None

        with open(conv_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        # Update parent project's updated_at if project-scoped
        if data.get("project_id"):
            target_p = get_project(data["project_id"])
            if target_p:
                meta_path = Path(target_p.folder_path) / "project.json"
                if meta_path.exists():
                    try:
                        with open(meta_path, "r", encoding="utf-8") as mf:
                            mdata = json.load(mf)
                        mdata["updated_at"] = now
                        with open(meta_path, "w", encoding="utf-8") as mf:
                            json.dump(mdata, mf, indent=2)
                    except Exception:
                        pass

        return get_conversation(conv_id)
    except Exception as e:
        print(f"Error saving conversation {conv_id}: {e}")
        return None

def delete_conversation(conv_id: str) -> bool:
    conv_file = _find_conversation_file(conv_id)
    if conv_file and conv_file.exists():
        conv_file.unlink()
        return True
    return False
