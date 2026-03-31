use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;
use tree_sitter::Parser;

// Generic import patterns for fallback parsing
static GENERIC_IMPORT_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // import 'module' or "module"
        Regex::new(r#"import\s+['"]([^'"]+)['"]"#).unwrap(),
        // from 'module' import
        Regex::new(r#"from\s+['"]([^'"]+)['"]"#).unwrap(),
        // require('module')
        Regex::new(r#"require\s*\(\s*['"]([^'"]+)['"]\s*\)"#).unwrap(),
        // include 'module' or "module"
        Regex::new(r#"include\s+['"]([^'"]+)['"]"#).unwrap(),
        // using 'module'
        Regex::new(r#"using\s+['"]([^'"]+)['"]"#).unwrap(),
    ]
});

/// Get the PHP tree-sitter language
pub fn get_php_language() -> tree_sitter::Language {
    unsafe { tree_sitter_php() }
}

/// Get the Ruby tree-sitter language
pub fn get_ruby_language() -> tree_sitter::Language {
    unsafe { tree_sitter_ruby() }
}

// External tree-sitter language functions
extern "C" {
    fn tree_sitter_php() -> tree_sitter::Language;
    fn tree_sitter_ruby() -> tree_sitter::Language;
}

/// Parse a file using tree-sitter for a specific language
pub fn parse_with_treesitter(file_path: &str, content: &str, language: &tree_sitter::Language) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    let mut parser = Parser::new();
    parser.set_language(*language).unwrap_or_else(|e| {
        log::error!("Failed to set tree-sitter language: {}", e);
        return;
    });
    
    if let Some(tree) = parser.parse(content, None) {
        let root_node = tree.root_node();
        extract_imports_from_node(file_path, content, &root_node, &mut deps);
    }
    
    deps
}

/// Recursively extract imports from tree-sitter nodes
fn extract_imports_from_node(file_path: &str, content: &str, node: &tree_sitter::Node, deps: &mut Vec<Dependency>) {
    // Check if this node is an import statement
    match node.kind() {
        "import_statement" | "import_declaration" | "import_spec" | "import_spec_list" => {
            let import_text = node.utf8_text(content.as_bytes()).unwrap_or("");
            // Extract module name from the import text
            if let Some(module_name) = extract_module_name(import_text) {
                deps.push(Dependency {
                    source: file_path.to_string(),
                    target: module_name,
                    dep_type: DependencyType::Import,
                    line: node.start_position().row + 1,
                });
            }
        }
        _ => {}
    }
    
    // Recurse into children
    let mut cursor = node.walk();
    for child in node.children(&mut cursor) {
        extract_imports_from_node(file_path, content, &child, deps);
    }
}

/// Extract module name from import text
fn extract_module_name(import_text: &str) -> Option<String> {
    // Try to extract quoted string
    if let Some(start) = import_text.find('"').or_else(|| import_text.find('\'')) {
        if let Some(end) = import_text[start + 1..].find(|c: char| c == '"' || c == '\'') {
            return Some(import_text[start + 1..start + 1 + end].to_string());
        }
    }
    None
}

/// Fallback regex-based parsing for languages without tree-sitter support
pub fn fallback_regex_parse(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        for pattern in GENERIC_IMPORT_PATTERNS.iter() {
            if let Some(captures) = pattern.captures(line) {
                if let Some(target) = captures.get(1) {
                    deps.push(Dependency {
                        source: file_path.to_string(),
                        target: target.as_str().to_string(),
                        dep_type: DependencyType::Import,
                        line: line_num + 1,
                    });
                }
            }
        }
    }
    
    deps
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fallback_regex() {
        let content = r#"import 'some-module';"#;
        let deps = fallback_regex_parse("test.unknown", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "some-module");
    }

    #[test]
    fn test_extract_module_name() {
        assert_eq!(extract_module_name("import 'foo'"), Some("foo".to_string()));
        assert_eq!(extract_module_name(r#"import "bar""#), Some("bar".to_string()));
        assert_eq!(extract_module_name("no import here"), None);
    }
}
