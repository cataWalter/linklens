use crate::parser::{Dependency, DependencyType};
use regex::Regex;
use once_cell::sync::Lazy;

// Regex patterns for Java imports
static IMPORT_RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r#"^import\s+(?:static\s+)?([\w.]+);?"#).unwrap()
});

/// Parse Java content and extract import dependencies
pub fn parse_java(file_path: &str, content: &str) -> Vec<Dependency> {
    let mut deps = Vec::new();
    
    for (line_num, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        
        // Skip comments, empty lines, and package declarations
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") || trimmed.is_empty() || trimmed.starts_with("package") {
            continue;
        }
        
        if trimmed.starts_with("import ") {
            if let Some(captures) = IMPORT_RE.captures(trimmed) {
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
    fn test_parse_import() {
        let content = r#"import java.util.List;"#;
        let deps = parse_java("Test.java", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "java.util.List");
    }

    #[test]
    fn test_parse_static_import() {
        let content = r#"import static java.lang.Math.PI;"#;
        let deps = parse_java("Test.java", content);
        assert_eq!(deps.len(), 1);
        assert_eq!(deps[0].target, "java.lang.Math.PI");
    }
}
