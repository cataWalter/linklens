use serde::{Deserialize, Serialize};

pub mod javascript;
pub mod python;
pub mod java;
pub mod c;
pub mod go;
pub mod rust;
pub mod treesitter;

/// Represents a single dependency relationship extracted from a file
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Dependency {
    /// The source file that contains the import/require/include
    pub source: String,
    /// The target file/module being imported
    pub target: String,
    /// The type of dependency (import, require, include, etc.)
    pub dep_type: DependencyType,
    /// The line number where the dependency is declared
    pub line: usize,
}

/// Types of dependencies
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum DependencyType {
    Import,
    Require,
    Include,
    Use,
    From,
    Extend,
    Implement,
    Other(String),
}

/// Supported programming languages for parsing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    JavaScript,
    TypeScript,
    Python,
    Java,
    C,
    Cpp,
    Go,
    Rust,
    Php,
    Ruby,
    Unknown,
}

impl Language {
    /// Determine the language from a file extension
    pub fn from_extension(ext: &str) -> Self {
        match ext {
            "js" | "mjs" | "cjs" => Language::JavaScript,
            "ts" | "tsx" => Language::TypeScript,
            "py" | "pyi" => Language::Python,
            "java" => Language::Java,
            "c" | "h" => Language::C,
            "cpp" | "cc" | "cxx" | "hpp" | "hxx" => Language::Cpp,
            "go" => Language::Go,
            "rs" => Language::Rust,
            "php" => Language::Php,
            "rb" => Language::Ruby,
            _ => Language::Unknown,
        }
    }

    /// Get the file extensions supported by this language
    pub fn extensions(&self) -> &'static [&'static str] {
        match self {
            Language::JavaScript => &["js", "mjs", "cjs"],
            Language::TypeScript => &["ts", "tsx"],
            Language::Python => &["py", "pyi"],
            Language::Java => &["java"],
            Language::C => &["c", "h"],
            Language::Cpp => &["cpp", "cc", "cxx", "hpp", "hxx"],
            Language::Go => &["go"],
            Language::Rust => &["rs"],
            Language::Php => &["php"],
            Language::Ruby => &["rb"],
            Language::Unknown => &[],
        }
    }
}

impl std::fmt::Display for Language {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Language::JavaScript => write!(f, "JavaScript"),
            Language::TypeScript => write!(f, "TypeScript"),
            Language::Python => write!(f, "Python"),
            Language::Java => write!(f, "Java"),
            Language::C => write!(f, "C"),
            Language::Cpp => write!(f, "C++"),
            Language::Go => write!(f, "Go"),
            Language::Rust => write!(f, "Rust"),
            Language::Php => write!(f, "PHP"),
            Language::Ruby => write!(f, "Ruby"),
            Language::Unknown => write!(f, "Unknown"),
        }
    }
}

/// Parse a file and extract dependencies
pub fn parse_file(file_path: &str, content: &str) -> Vec<Dependency> {
    let ext = std::path::Path::new(file_path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");
    
    let language = Language::from_extension(ext);
    
    match language {
        Language::JavaScript | Language::TypeScript => {
            javascript::parse_javascript(file_path, content)
        }
        Language::Python => python::parse_python(file_path, content),
        Language::Java => java::parse_java(file_path, content),
        Language::C | Language::Cpp => c::parse_c(file_path, content),
        Language::Go => go::parse_go(file_path, content),
        Language::Rust => rust::parse_rust(file_path, content),
        Language::Php => treesitter::parse_with_treesitter(file_path, content, &treesitter::get_php_language()),
        Language::Ruby => treesitter::parse_with_treesitter(file_path, content, &treesitter::get_ruby_language()),
        Language::Unknown => {
            // Fallback to regex-based parsing
            treesitter::fallback_regex_parse(file_path, content)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_language_from_extension() {
        assert_eq!(Language::from_extension("js"), Language::JavaScript);
        assert_eq!(Language::from_extension("ts"), Language::TypeScript);
        assert_eq!(Language::from_extension("py"), Language::Python);
        assert_eq!(Language::from_extension("rs"), Language::Rust);
        assert_eq!(Language::from_extension("unknown"), Language::Unknown);
    }

    #[test]
    fn test_language_extensions() {
        let js_ext = Language::JavaScript.extensions();
        assert!(js_ext.contains(&"js"));
        assert!(js_ext.contains(&"mjs"));
    }
}
