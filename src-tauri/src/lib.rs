mod parser;
mod graph;
mod watcher;
mod commands;

use std::sync::Mutex;
use graph::DependencyGraph;
use watcher::FileWatcher;

pub struct AppState {
    pub graph: Mutex<Option<DependencyGraph>>,
    pub watcher: Mutex<Option<FileWatcher>>,
}

pub fn run() {
    // Initialize logger
    env_logger::init();

    tauri::Builder::default()
        .manage(AppState {
            graph: Mutex::new(None),
            watcher: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            commands::open_folder,
            commands::get_file_deps,
            commands::get_reverse_deps,
            commands::detect_cycles,
            commands::calculate_metrics,
            commands::export_graph,
            commands::start_watcher,
            commands::stop_watcher,
        ])
        .run(tauri::generate_context!())
        .expect("error while running LinkLens");
}
