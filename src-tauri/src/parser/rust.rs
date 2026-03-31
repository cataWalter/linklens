use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for Rust imports
static USE_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // use crate::module
        Regex::new(r#"^use\s+(crate::[\w:]+)"#).unwrap(),
        // use super::module
        Regex::new(r#"^use\s+(super::[\w:]+)"#).unwrap(),
        // use module
        Regex::new(r#"^use\s+([\w:]+)"#).unwrap(),
    ]
});

/// Parse Rust content and extract use dependencies
pub fn parse_rust(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        
        // Skip comments and empty lines
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") || trimmed.is_empty() {
            continue;
        }
        
        for pattern in USE_PATTERNS.iter() {
            if let Some(captures) = pattern.captures(trimmed) {
                if let Some(target) = captures.get(1) {
                    deps.push(Dependency {
                        source: file_path.to_string(),
                        target: target.as_str().to_string(),
                        dep_type: DependencyType::Use,
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
    fn test_parse_crate_use() {
        let content = r#"use crate::utils::helper;"#;
        let deps = parse_rust("test.rs", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "crate::utils::helper");
        assert_eq!(deps[0].dep_type, DependencyType::Use);
    }

    #[test]
    fn test_parse_super_use() {
        let content = r#"use super::parent::Item;"#;
        let deps = parse_rust("test.rs", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "super::parent::Item");
    }
}
