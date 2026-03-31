use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for C/C++ includes
static INCLUDE_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // #include <header>
        Regex::new(r#"#include\s*<([^>]+)>"#).unwrap(),
        // #include "header"
        Regex::new(r#"#include\s*"([^"]+)""#).unwrap(),
    ]
});

/// Parse C/C++ content and extract include dependencies
pub fn parse_c(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        
        // Skip comments and empty lines
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") || trimmed.is_empty() {
            continue;
        }
        
        for pattern in INCLUDE_PATTERNS.iter() {
            if let Some(captures) = pattern.captures(trimmed) {
                if let Some(target) = captures.get(1) {
                    let target_str = target.as_str().to_string();
                    
                    deps.push(Dependency {
                        source: file_path.to_string(),
                        target: target_str,
                        dep_type: DependencyType::Include,
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
    fn test_parse_system_include() {
        let content = r#"#include <stdio.h>"#;
        let deps = parse_c("test.c", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "stdio.h");
        assert_eq!(deps[0].dep_type, DependencyType::Include);
    }

    #[test]
    fn test_parse_local_include() {
        let content = r#"#include "my_header.h""#;
        let deps = parse_c("test.c", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "my_header.h");
    }
}
