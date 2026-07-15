import tree_sitter
import tree_sitter_python as tspython

language = tree_sitter.Language(tspython.language())
parser = tree_sitter.Parser(language)

code = b"def foo():\n    pass\n"
tree = parser.parse(code)

query = tree_sitter.Query(language, "(function_definition) @function")
cursor = tree_sitter.QueryCursor(query)

captures = cursor.captures(tree.root_node)

print("Captures:", captures)
