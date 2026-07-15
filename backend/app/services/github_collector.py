import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class GithubMetadataCollector:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeBeast-Agent"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    def _parse_url(self, url: str) -> tuple[str, str]:
        # Handle urls like https://github.com/owner/repo
        parts = url.rstrip("/").split("/")
        if len(parts) >= 2:
            return parts[-2], parts[-1]
        raise ValueError("Invalid GitHub URL format")

    async def collect_metadata(self, repo_url: str) -> Dict[str, Any]:
        owner, repo = self._parse_url(repo_url)
        api_url = f"https://api.github.com/repos/{owner}/{repo}"

        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(api_url, headers=self.headers)
            if response.status_code == 404:
                raise ValueError("Repository not found or is private")
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "owner": data.get("owner", {}).get("login"),
                "name": data.get("name"),
                "description": data.get("description"),
                "stars": data.get("stargazers_count", 0),
                "forks": data.get("forks_count", 0),
                "language": data.get("language"),
                "topics": data.get("topics", []),
                "branches_count": await self._get_branches_count(client, owner, repo),
                "commits_count": await self._get_commits_count(client, owner, repo)
            }

    async def _get_branches_count(self, client: httpx.AsyncClient, owner: str, repo: str) -> int:
        # Note: Pagination is needed for large repos, but for MVP we just get the first page length
        # or we could just check if it's > 1
        url = f"https://api.github.com/repos/{owner}/{repo}/branches"
        response = await client.get(url, headers=self.headers)
        if response.status_code == 200:
            return len(response.json())
        return 1
        
    async def _get_commits_count(self, client: httpx.AsyncClient, owner: str, repo: str) -> int:
        url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=10"
        response = await client.get(url, headers=self.headers)
        if response.status_code == 200:
            # We just need to know if there is more than 1 commit for the MVP Early Exit
            return len(response.json())
        return 1
