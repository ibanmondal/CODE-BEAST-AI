import os
from pathlib import Path
from typing import List, Dict, Any
import tree_sitter
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
from transformers import AutoTokenizer, AutoModel
import torch
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

class CodeBERTEmbedder(Embeddings):
    """Wrapper for CodeBERT to use with LangChain/FAISS"""
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
        self.model = AutoModel.from_pretrained("microsoft/codebert-base").to(self.device)
        print(f"CodeBERTEmbedder initialized on device: {self.device}")
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            # CodeBERT max length is usually 512 tokens
            inputs = self.tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding="max_length").to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Use the [CLS] token embedding (index 0) as the representation of the whole chunk
                embedding = outputs.last_hidden_state[0, 0, :].cpu().numpy().tolist()
                embeddings.append(embedding)
        return embeddings
        
    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]


class SimilarityEngine:
    def __init__(self, templates_faiss_path: str = "./mock_templates_db"):
        self.templates_faiss_path = Path(templates_faiss_path)
        
        # Load Tree-Sitter Parsers
        self.py_language = tree_sitter.Language(tspython.language())
        self.py_parser = tree_sitter.Parser(self.py_language)
        
        self.js_language = tree_sitter.Language(tsjavascript.language())
        self.js_parser = tree_sitter.Parser(self.js_language)
        
        self.embedder = CodeBERTEmbedder()
        
        # In a real scenario, this DB is pre-built with known templates
        if self.templates_faiss_path.exists():
            self.templates_db = FAISS.load_local(str(self.templates_faiss_path), self.embedder, allow_dangerous_deserialization=True)
        else:
            self.templates_db = None
            
    def _extract_functions(self, file_path: Path) -> List[str]:
        """Extracts function bodies using AST."""
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
            print(f"Failed to parse {file_path}: {e}")
            
        return functions

    def analyze_repository(self, repo_path: str) -> Dict[str, Any]:
        """Calculates plagiarism/similarity score for the repository."""
        print("Running Similarity Engine (AST + CodeBERT)...")
        repo_path_obj = Path(repo_path)
        all_functions = []
        
        for root, dirs, files in os.walk(repo_path_obj):
            if any(ignore in root for ignore in ['.git', 'node_modules', 'venv', '.venv']):
                continue
            for file in files:
                if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx')):
                    funcs = self._extract_functions(Path(root) / file)
                    all_functions.extend(funcs)
                    
        if not all_functions:
            return {"similarity_score": 0, "evidence": ["No parseable functions found."]}
            
        if not self.templates_db:
            print("Warning: No templates database found. Returning 0 similarity.")
            return {"similarity_score": 0, "evidence": ["No template database available for comparison."]}
            
        # Compare extracted functions against templates DB
        high_similarity_count = 0
        total_functions = len(all_functions)
        
        for func in all_functions:
            # CodeBERT + FAISS: lower L2 distance = higher similarity
            results = self.templates_db.similarity_search_with_score(func, k=1)
            if results:
                doc, score = results[0]
                # Assuming threshold score for "highly similar" (depends on embedding space)
                # CodeBERT L2 distance threshold needs tuning, say < 0.5 is similar
                if score < 0.5: 
                    high_similarity_count += 1
                    
        sim_percentage = int((high_similarity_count / total_functions) * 100)
        
        evidence = [f"Found {high_similarity_count} functions highly similar to known templates out of {total_functions} total functions."]
        if sim_percentage > 80:
            evidence.append("RED ALERT: Extremely high structural similarity to known templates detected.")
            
        return {
            "similarity_score": sim_percentage,
            "evidence": evidence
        }

    def seed_mock_template_db(self):
        """Helper to create a local DB for testing if none exists."""
        if not self.templates_faiss_path.exists():
            print("Seeding templates DB...")
            # Some standard template code
            template_code = [
                "def hello_world():\n    print('Hello World')\n",
                "function App() {\n  return <div>Hello</div>;\n}",
                "const handler = async (req, res) => {\n  res.status(200).json({ name: 'John Doe' })\n}"
            ]
            db = FAISS.from_texts(template_code, self.embedder)
            db.save_local(str(self.templates_faiss_path))
            self.templates_db = db
            print("Templates DB seeded.")
