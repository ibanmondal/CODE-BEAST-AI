from typing import Dict, Any, List

class ScoringEngine:
    """
    Calculates the base deterministic score. 
    Applies strict penalties and hard caps based on heuristics and similarity.
    """
    
    def __init__(self):
        self.base_score = 100
        
    def calculate_score(self, metadata: Dict[str, Any], context: Dict[str, Any], similarity: Dict[str, Any]) -> Dict[str, Any]:
        print("Running Deterministic Scoring Engine...")
        score = self.base_score
        evidence = []
        
        # --- HARD CAPS & PENALTIES ---
        
        # Plagiarism / Similarity Penalty
        sim_score = similarity.get("similarity_score", 0)
        if sim_score > 80:
            score = 0
            evidence.append(f"HARD CAP APPLIED: Similarity score is {sim_score}%. Final score set to 0.")
            return {"final_score": score, "evidence": evidence}
        elif sim_score > 50:
            penalty = 30
            score -= penalty
            evidence.append(f"Penalty: Similarity score is {sim_score}%. Deducted {penalty} points.")
            
        # Lack of Tests Hard Cap
        directory_tree = context.get("directory_tree", "").lower()
        if "test" not in directory_tree and "spec" not in directory_tree:
            if score > 60:
                score = 60
                evidence.append("HARD CAP APPLIED: No tests found in directory structure. Max score capped at 60.")
            else:
                evidence.append("No tests found in directory structure.")
                
        # Basic Setup Penalties
        if "No README found" in context.get("readme_content", ""):
            score -= 10
            evidence.append("Penalty: No README found. Deducted 10 points.")
            
        # Single / Low Commits Hard Cap
        commits = metadata.get("commits_count", 0)
        if commits < 3: # If early exit was bypassed or relaxed
            if score > 50:
                score = 50
                evidence.append("HARD CAP APPLIED: Less than 3 commits detected. Max score capped at 50.")
                
        # Ensure score stays within 0-100
        score = max(0, min(score, 100))
        
        if score == self.base_score:
            evidence.append("All baseline deterministic checks passed without penalty.")
            
        return {
            "final_score": score,
            "evidence": evidence
        }
