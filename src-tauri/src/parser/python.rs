use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for Python imports
static IMPORT_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // import module
        Regex::new(r#"^import\s+([\w.]+)"#).unwrap(),
        // from module import ...
        Regex::new(r#"^from\s+([\w.]+)\s+import"#).unwrap(),
    ]
});

/// Parse Python content and extract import dependencies
pub fn parse_python(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        
        // Skip comments and empty lines
        if trimmed.starts_with('#') || trimmed.is_empty() {
            continue;
        }
        
        for pattern in IMPORT_PATTERNS.iter() {
            if let Some(captures) = pattern.captures(trimmed) {
                if let Some(target) = captures.get(1) {
                    let target_str = target.as_str().to_string();
                    let dep_type = if trimmed.starts_with("from") {
                        DependencyType::From
                    } else {
                        DependencyType::Import
                    };
                    
                    deps.push(Dependency {
                        source: file_path.to_string(),
                        target: target_str,
                        dep_type,
                        line: line_num + 1,
                    });
                    break; // Only match the first pattern
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
    fn test_parse_import() {
        let content = r#"import os"#;
        let deps = parse_python("test.py", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "os");
    }

    #[test]
    fn test_parse_from_import() {
        let content = r#"from collections import OrderedDict"#;
        let deps = parse_python("test.py", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "collections");
        assert_eq!(deps[0].dep_type, DependencyType::From);
    }
}
