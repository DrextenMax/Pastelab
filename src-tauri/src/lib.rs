use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // DevTools only in debug builds
            #[cfg(debug_assertions)]
            window.open_devtools();

            // Ensure the window is focused on launch
            window.set_focus().ok();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running PasteLab")
}
