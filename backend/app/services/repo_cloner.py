import os
import shutil
from git import Repo
from pathlib import Path

class RepositoryCloner:
    def __init__(self, base_dir: str = "/tmp/codebeast_repos"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _get_repo_dir(self, repo_url: str) -> Path:
        # Generate a unique directory name based on URL
        # For simplicity, we can use owner_repo
        parts = repo_url.rstrip("/").split("/")
        if len(parts) >= 2:
            folder_name = f"{parts[-2]}_{parts[-1]}"
            return self.base_dir / folder_name
        raise ValueError("Invalid GitHub URL format")

    def _robust_rmtree(self, path: Path):
        if not path.exists():
            return
        import stat
        def remove_readonly(func, p, _):
            os.chmod(p, stat.S_IWRITE)
            func(p)
        shutil.rmtree(path, onerror=remove_readonly)

    def clone_repository(self, repo_url: str) -> str:
        import uuid
        repo_dir = self._get_repo_dir(repo_url)
        # Append unique ID to avoid collisions
        repo_dir = repo_dir.with_name(f"{repo_dir.name}_{uuid.uuid4().hex[:8]}")
        
        # If it exists, remove it first to ensure a clean clone
        self._robust_rmtree(repo_dir)
            
        repo_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Cloning {repo_url} into {repo_dir}")
        Repo.clone_from(repo_url, repo_dir)
        
        return str(repo_dir)

    def cleanup(self, repo_path: str):
        self._robust_rmtree(Path(repo_path))
