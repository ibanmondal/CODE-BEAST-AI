import os
from pathlib import Path
from typing import Dict, Any, List
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

class ContextBuilder:
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.ignore_dirs = {'.git', 'node_modules', 'venv', '.venv', '__pycache__', 'dist', 'build'}
        # Load local embeddings model. This will download on first run.
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
    def _build_tree(self) -> str:
        """Generates a text representation of the directory tree."""
        tree_str = []
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            level = root.replace(str(self.repo_path), '').count(os.sep)
            indent = ' ' * 4 * level
            tree_str.append(f"{indent}{os.path.basename(root)}/")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                tree_str.append(f"{subindent}{f}")
        return "\n".join(tree_str)

    def _extract_readme(self) -> str:
        """Finds and reads the README file."""
        for file in os.listdir(self.repo_path):
            if file.lower().startswith('readme'):
                with open(self.repo_path / file, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
        return "No README found."

    def _find_dependencies(self) -> List[str]:
        """Detects basic dependency files."""
        deps = []
        if (self.repo_path / 'package.json').exists():
            deps.append("Node.js (package.json)")
        if (self.repo_path / 'requirements.txt').exists():
            deps.append("Python (requirements.txt)")
        if (self.repo_path / 'go.mod').exists():
            deps.append("Go (go.mod)")
        if (self.repo_path / 'pom.xml').exists():
            deps.append("Java (pom.xml)")
        return deps

    def _build_faiss_index(self) -> str:
        """Chunks all valid source files and builds a FAISS index, returning the path."""
        docs = []
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            for file in files:
                # Basic check to avoid binary files or huge files
                file_path = Path(root) / file
                if file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.jsx', '.go', '.java', '.md', '.txt']:
                    try:
                        loader = TextLoader(str(file_path), encoding='utf-8')
                        docs.extend(loader.load())
                    except Exception:
                        pass # Ignore unreadable files

        if not docs:
            return ""

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        
        vectorstore = FAISS.from_documents(documents=splits, embedding=self.embeddings)
        
        # Save FAISS index in the repo path
        faiss_path = str(self.repo_path / "faiss_index")
        vectorstore.save_local(faiss_path)
        return faiss_path

    def build_context(self) -> Dict[str, Any]:
        """Orchestrates the context building process."""
        print(f"Building context for {self.repo_path}...")
        
        tree = self._build_tree()
        readme = self._extract_readme()
        deps = self._find_dependencies()
        faiss_path = self._build_faiss_index()
        
        return {
            "directory_tree": tree,
            "readme_content": readme,
            "dependencies": deps,
            "faiss_index_path": faiss_path
        }
