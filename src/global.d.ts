declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.WebViewHTMLAttributes<Electron.WebviewTag>,
      Electron.WebviewTag
    >;
  }
}
