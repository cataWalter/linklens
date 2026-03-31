use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for Go imports
static IMPORT_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // import "package"
        Regex::new(r#"import\s+"([^"]+)""#).unwrap(),
        // import ( "package1" "package2" )
        Regex::new(r#""([^"]+)""#).unwrap(),
    ]
});

/// Parse Go content and extract import dependencies
pub fn parse_go(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    let mut in_import_block = false;
    
    for (line_num, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        
        // Skip comments and empty lines
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") || trimmed.is_empty() {
            continue;
        }
        
        // Check for import block start
        if trimmed.starts_with("import (") {
            in_import_block = true;
            continue;
        }
        
        // Check for import block end
        if in_import_block && trimmed == ")" {
            in_import_block = false;
            continue;
        }
        
        if in_import_block {
            // Parse imports inside the block
            if let Some(captures) = IMPORT_PATTERNS[1].captures(trimmed) {
                if let Some(target) = captures.get(1) {
                    deps.push(Dependency {
                        source: file_path.to_string(),
                        target: target.as_str().to_string(),
                        dep_type: DependencyType::Import,
                        line: line_num + 1,
                    });
                }
            }
        } else if trimmed.starts_with("import ") {
            // Single line import
            if let Some(captures) = IMPORT_PATTERNS[0].captures(trimmed) {
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
    fn test_parse_single_import() {
        let content = r#"import "fmt""#;
        let deps = parse_go("test.go", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "fmt");
    }

    #[test]
    fn test_parse_import_block() {
        let content = r#"
import (
    "fmt"
    "os"
)
"#;
        let deps = parse_go("test.go", content);
        assert_eq!(deps.len(), 2);
        assert_eq!(deps[0].target, "fmt");
        assert_eq!(deps[1].target, "os");
    }
}
