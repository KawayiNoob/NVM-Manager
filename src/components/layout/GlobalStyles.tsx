export function GlobalStyles() {
  return (
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #666;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: #888;
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #666 transparent;
      }
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        height: 100%;
      }
      .drag-region {
        -webkit-app-region: drag;
      }
      .no-drag {
        -webkit-app-region: no-drag;
      }
    `}</style>
  );
}
