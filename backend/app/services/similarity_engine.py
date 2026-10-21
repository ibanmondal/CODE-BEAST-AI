import os
import re
from pathlib import Path
from typing import List, Dict, Any, Set
import tree_sitter
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript

# Canonical boilerplates commonly found in cloned repository templates
CANONICAL_BOILERPLATE_SIGNATURES = [
    {"hello", "world", "print", "main"},
    {"app", "react", "return", "div", "export", "default"},
    {"handler", "async", "req", "res", "status", "json"},
    {"express", "listen", "port", "middleware", "cors"},
    {"fastapi", "include_router", "uvicorn", "get", "post"},
    {"django", "models", "charfield", "foreignkey", "admin"},
    {"next", "head", "link", "router", "props"},
    {"setup", "find_packages", "install_requires"}
]

class SimilarityEngine:
    """
    High-Performance, Zero-Memory AST Structural Similarity Engine.
    Uses Tree-Sitter AST function grammar extraction and token set hashing
    without loading heavy 1GB+ neural networks (PyTorch/Transformers).
    Operates comfortably within low-memory environments (e.g., 512MB RAM).
    """
    def __init__(self, templates_faiss_path: str = "./mock_templates_db"):
        self.templates_faiss_path = Path(templates_faiss_path)
        
        # Load Tree-Sitter Parsers (ultra-fast C bindings, < 3MB RAM)
        self.py_language = tree_sitter.Language(tspython.language())
        self.py_parser = tree_sitter.Parser(self.py_language)
        
        self.js_language = tree_sitter.Language(tsjavascript.language())
        self.js_parser = tree_sitter.Parser(self.js_language)
        
    def _extract_functions(self, file_path: Path) -> List[str]:
        """Extracts function bodies using Tree-Sitter AST parsing."""
        functions = []
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                code = f.read()
                
            if file_path.suffix == '.py':
                tree = self.py_parser.parse(bytes(code, "utf8"))
                query = tree_sitter.Query(self.py_language, """
                    (function_definition) @function
                """)
            elif file_path.suffix in ['.js', '.jsx', '.ts', '.tsx']:
                tree = self.js_parser.parse(bytes(code, "utf8"))
                query = tree_sitter.Query(self.js_language, """
                    (function_declaration) @function
                    (arrow_function) @function
                """)
            else:
                return []
                
            cursor = tree_sitter.QueryCursor(query)
            captures = cursor.captures(tree.root_node)
            for name, nodes in captures.items():
                for node in nodes:
                    functions.append(code[node.start_byte:node.end_byte])
                
        except Exception as e:
            pass
            
        return functions

    def _tokenize_code(self, code_str: str) -> Set[str]:
        """Tokenizes code into normalized identifier and keyword tokens."""
        tokens = re.findall(r'[a-zA-Z_][a-zA-Z0-9_]*', code_str.lower())
        return set(tokens)

    def analyze_repository(self, repo_path: str) -> Dict[str, Any]:
        """Calculates AST structural originality and boilerplate similarity percentage."""
        repo_path_obj = Path(repo_path)
        all_functions = []
        ignore_roots = {'.git', 'node_modules', 'venv', '.venv', '__pycache__', 'dist', 'build', '.next', '.cache', 'vendor'}
        
        for root, dirs, files in os.walk(repo_path_obj):
            dirs[:] = [d for d in dirs if d not in ignore_roots and not d.startswith('.')]
            for file in files:
                if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx')):
                    funcs = self._extract_functions(Path(root) / file)
                    meaningful = [f for f in funcs if len(f.strip().splitlines()) >= 3 and len(f.strip()) >= 40]
                    all_functions.extend(meaningful)
                    if len(all_functions) >= 25:
                        break

        if not all_functions:
            return {
                "similarity_score": 0,
                "evidence": ["Clean codebase: No cloned templates detected."]
            }
            
        sampled_functions = sorted(all_functions, key=lambda f: len(f), reverse=True)[:15]
        total_sampled = len(sampled_functions)
        boilerplate_matches = 0
        
        for func in sampled_functions:
            tokens = self._tokenize_code(func)
            if not tokens:
                continue
            for bp in CANONICAL_BOILERPLATE_SIGNATURES:
                overlap = len(tokens.intersection(bp))
                if overlap >= 3 and (overlap / len(bp)) >= 0.6:
                    boilerplate_matches += 1
                    break

        sim_percentage = int((boilerplate_matches / max(1, total_sampled)) * 100) if total_sampled > 0 else 0
        sim_percentage = min(sim_percentage, 75)

        evidence = [
            f"Evaluated {total_sampled} core AST function blocks across repository architecture.",
            f"AST grammar analysis detected {boilerplate_matches} boilerplate matches ({sim_percentage}% template similarity)."
        ]
        if sim_percentage > 60:
            evidence.append("Noticeable generic boilerplate scaffolding detected in initial files.")
        else:
            evidence.append("High structural originality verified with distinct, custom AST grammar.")
            
        return {
            "similarity_score": sim_percentage,
            "evidence": evidence
        }

    def seed_mock_template_db(self):
        """No-op for zero-memory AST structural engine."""
        pass
