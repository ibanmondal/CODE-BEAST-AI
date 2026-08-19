from typing import Dict, Any

class EarlyExitException(Exception):
    def __init__(self, message: str, reason: str):
        super().__init__(message)
        self.reason = reason

class EarlyExitEngine:
    """
    Evaluates repository metadata and heuristics to reject repositories
    before running expensive LLM inference.
    """
    
    @staticmethod
    def evaluate_metadata(metadata: Dict[str, Any]):
        commits = metadata.get("commits_count", 0)
        branches = metadata.get("branches_count", 0)
        stars = metadata.get("stars", 0)
        
        # 1. Single Commit Dump
        if commits < 2:
            raise EarlyExitException(
                "Repository appears to be a single commit dump.",
                "SINGLE_COMMIT"
            )
            
        # 2. Template / Empty (Heuristics can be expanded)
        # For now, if there's very little activity and no stars, we might flag it, 
        # but for the MVP, we just rely on commits.
        
        return True
