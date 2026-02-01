import React, { useRef, useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { COLORS } from "../../types/colors";
import { borderRadius } from "../../theme";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  readOnly?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 300,
  readOnly = false,
}: RichTextEditorProps) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const initialLoadRef = useRef(true);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "update") {
          onChange(data.content);
        } else if (data.type === "ready") {
          setIsReady(true);
        }
      } catch {
        // ignore parse errors
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (isReady && initialLoadRef.current && value) {
      initialLoadRef.current = false;
      webViewRef.current?.postMessage(
        JSON.stringify({ type: "load", content: value }),
      );
    }
  }, [isReady, value]);

  const html = getEditorHTML(placeholder, readOnly);

  return (
    <View style={[styles.container, { minHeight }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled
        showsVerticalScrollIndicator
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={false}
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

function getEditorHTML(placeholder: string, readOnly: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      font-family: -apple-system, system-ui, sans-serif;
      background: #fff;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    #toolbar {
      ${readOnly ? "display: none !important;" : ""}
    }

    .ql-toolbar.ql-snow {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #fff;
      border: none !important;
      border-bottom: 1px solid ${COLORS.border} !important;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
    }
    .ql-toolbar.ql-snow .ql-formats { margin-right: 8px; }
    .ql-toolbar.ql-snow button {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ql-toolbar.ql-snow button:hover,
    .ql-toolbar.ql-snow button.ql-active {
      background: ${COLORS.surfaceSecondary};
      color: ${COLORS.primary};
    }
    .ql-toolbar.ql-snow .ql-picker {
      height: 28px;
    }
    .ql-toolbar.ql-snow .ql-picker-label {
      border: 1px solid ${COLORS.border} !important;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 11px;
    }
    .ql-toolbar.ql-snow .ql-picker-options {
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid ${COLORS.border};
    }

    .ql-container.ql-snow {
      border: none !important;
      font-size: 14px;
      flex: 1;
      overflow-y: auto;
    }
    .ql-editor {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 14px;
      line-height: 1.8;
      padding: 12px 16px 60px 16px;
      color: ${COLORS.textPrimary};
      min-height: 100%;
    }
    .ql-editor p { margin-bottom: 0.5em; }
    .ql-editor h1 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; }
    .ql-editor h2 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; }
    .ql-editor.ql-blank::before {
      color: ${COLORS.textMuted};
      font-style: normal;
    }

    .ql-editor .ql-size-10px { font-size: 10px; }
    .ql-editor .ql-size-12px { font-size: 12px; }
    .ql-editor .ql-size-14px { font-size: 14px; }
    .ql-editor .ql-size-16px { font-size: 16px; }
    .ql-editor .ql-size-18px { font-size: 18px; }
    .ql-editor .ql-size-20px { font-size: 20px; }
    .ql-editor .ql-size-24px { font-size: 24px; }

    ${readOnly ? ".ql-editor { padding-top: 8px; }" : ""}
  </style>
</head>
<body>
  <div id="toolbar" ${readOnly ? 'style="display:none"' : ""}>
    <span class="ql-formats">
      <select class="ql-font">
        <option value="serif" selected>Serif</option>
        <option value="monospace">Mono</option>
        <option value="sans-serif">Sans</option>
      </select>
      <select class="ql-size">
        <option value="10px">10</option>
        <option value="12px">12</option>
        <option value="14px" selected>14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="24px">24</option>
      </select>
    </span>
    <span class="ql-formats">
      <button class="ql-bold"></button>
      <button class="ql-italic"></button>
      <button class="ql-underline"></button>
      <button class="ql-strike"></button>
    </span>
    <span class="ql-formats">
      <button class="ql-list" value="ordered"></button>
      <button class="ql-list" value="bullet"></button>
    </span>
    <span class="ql-formats">
      <button class="ql-align" value=""></button>
      <button class="ql-align" value="center"></button>
      <button class="ql-align" value="right"></button>
      <button class="ql-align" value="justify"></button>
    </span>
    <span class="ql-formats">
      <button class="ql-clean"></button>
    </span>
  </div>
  <div id="editor-container"></div>

  <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
  <script>
    var quillEditor = null;

    function initializeQuill() {
      if (typeof Quill === 'undefined') {
        setTimeout(initializeQuill, 100);
        return;
      }

      var Font = Quill.import('formats/font');
      Font.whitelist = ['serif', 'monospace', 'sans-serif'];
      Quill.register(Font, true);

      var Size = Quill.import('formats/size');
      Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px'];
      Quill.register(Size, true);

      quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        modules: { toolbar: ${readOnly ? "false" : "'#toolbar'"} },
        placeholder: '${placeholder.replace(/'/g, "\\'")}',
        readOnly: ${readOnly}
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));

      quillEditor.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'update',
            content: quillEditor.root.innerHTML
          }));
          scrollCursorIntoView();
        }
      });

      quillEditor.on('selection-change', function(range) {
        if (range) { scrollCursorIntoView(); }
      });

      function scrollCursorIntoView() {
        setTimeout(function() {
          var selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            var rect = range.getBoundingClientRect();
            if (rect && rect.bottom > window.innerHeight - 40) {
              window.scrollBy({ top: rect.bottom - window.innerHeight + 80, behavior: 'smooth' });
            }
          }
        }, 50);
      }
    }

    document.addEventListener('message', function(event) {
      handleMsg(event.data);
    });
    window.addEventListener('message', function(event) {
      handleMsg(event.data);
    });

    function handleMsg(raw) {
      try {
        var data = JSON.parse(raw);
        if (data.type === 'load' && data.content && quillEditor) {
          quillEditor.root.innerHTML = data.content;
        }
      } catch(e) {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeQuill);
    } else {
      initializeQuill();
    }
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
