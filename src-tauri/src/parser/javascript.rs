use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for JavaScript/TypeScript imports
static IMPORT_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // import ... from 'module' or "module"
        Regex::new(r#"import\s+(?:[\w{}\s,*]+\s+from\s+)?['"]([^'"]+)['"]"#).unwrap(),
        // const x = require('module') or require("module")
        Regex::new(r#"require\s*\(\s*['"]([^'"]+)['"]\s*\)"#).unwrap(),
        // export ... from 'module'
        Regex::new(r#"export\s+(?:[\w{}\s,*]+\s+from\s+)?['"]([^'"]+)['"]"#).unwrap(),
        // Dynamic import: import('module')
        Regex::new(r#"import\s*\(\s*['"]([^'"]+)['"]\s*\)"#).unwrap(),
    ]
});

/// Parse JavaScript/TypeScript content and extract import/require dependencies
pub fn parse_javascript(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        for pattern in IMPORT_PATTERNS.iter() {
            if let Some(captures) = pattern.captures(line) {
                if let Some(target) = captures.get(1) {
                    let target_str = target.as_str().to_string();
                    let dep_type = if line.contains("require") {
                        DependencyType::Require
                    } else if line.contains("export") {
                        DependencyType::Import
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
    fn test_parse_import_from() {
        let content = r#"import { foo } from './utils';"#;
        let deps = parse_javascript("test.ts", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "./utils");
    }

    #[test]
    fn test_parse_require() {
        let content = r#"const path = require('path');"#;
        let deps = parse_javascript("test.js", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "path");
        assert_eq!(deps[0].dep_type, DependencyType::Require);
    }

    #[test]
    fn test_parse_dynamic_import() {
        let content = r#"const module = await import('./lazy-module');"#;
        let deps = parse_javascript("test.ts", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "./lazy-module");
    }
}
