import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
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
  scrollToBottom?: boolean;
  showZoomControls?: boolean;
  onReady?: () => void;
  onContentChanged?: () => void;
  onCurrentContent?: (content: string) => void;
}

export interface RichTextEditorHandle {
  clear: () => void;
  insertTemplate: (args: {
    date?: string;
    time?: string;
    patientName?: string;
    fileType?: string;
    content?: string;
  }) => void;
  getContent: () => void;
  loadContent: (content: string, scrollToBottom?: boolean) => void;
}

function RichTextEditor(
  {
    value,
    onChange,
    placeholder = "Start typing...",
    minHeight = 300,
    readOnly = false,
    scrollToBottom = false,
    showZoomControls = true,
    onReady,
    onContentChanged,
    onCurrentContent,
  }: RichTextEditorProps,
  ref: React.Ref<RichTextEditorHandle>,
) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const lastSentValueRef = useRef<string>("");
  const isInternalUpdateRef = useRef(false);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "update") {
          // Mark this as an internal update to avoid sending it back to WebView
          isInternalUpdateRef.current = true;
          lastSentValueRef.current = data.content;
          onChange(data.content);
        } else if (data.type === "content-changed") {
          onContentChanged?.();
        } else if (data.type === "ready") {
          setIsReady(true);
          onReady?.();
        } else if (data.type === "current-content") {
          onCurrentContent?.(data.content || "");
        }
      } catch {
        // ignore parse errors
      }
    },
    [onChange, onContentChanged, onReady, onCurrentContent],
  );

  // Send content to WebView whenever value changes externally
  useEffect(() => {
    if (!isReady) return;

    // Skip if this change came from the editor itself (user typing)
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Skip if value hasn't actually changed from what we last sent
    if (value === lastSentValueRef.current) return;

    lastSentValueRef.current = value;
    webViewRef.current?.postMessage(
      JSON.stringify({ type: "load", content: value, scrollToBottom }),
    );
  }, [isReady, value, scrollToBottom]);

  useImperativeHandle(
    ref,
    () => ({
      clear() {
        webViewRef.current?.postMessage(JSON.stringify({ type: "clear" }));
      },
      insertTemplate({ date = "", time = "", patientName = "", fileType = "", content = "" }) {
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "template",
            date,
            time,
            patientName,
            fileType,
            content,
          }),
        );
      },
      getContent() {
        webViewRef.current?.postMessage(JSON.stringify({ type: "get-content" }));
      },
      loadContent(content: string, scrollToBottom?: boolean) {
        webViewRef.current?.postMessage(
          JSON.stringify({ type: "load", content, scrollToBottom: !!scrollToBottom }),
        );
      },
    }),
    [],
  );

  const html = getEditorHTML(placeholder, readOnly, showZoomControls);

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
        nestedScrollEnabled
        showsVerticalScrollIndicator
        showsHorizontalScrollIndicator={false}
        keyboardDisplayRequiresUserAction
        hideKeyboardAccessoryView={false}
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

function getEditorHTML(
  placeholder: string,
  readOnly: boolean,
  showZoomControls: boolean,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=3.0,user-scalable=yes" />
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      width: 100%;
      max-width: 100vw;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fafafa;
      overflow-x: hidden;
      overflow-y: hidden;
      -webkit-text-size-adjust: 100%;
    }

    #toolbar {
      ${readOnly ? "display: none !important;" : ""}
    }

    .ql-toolbar.ql-snow {
      position: sticky; top: ${showZoomControls ? "30px" : "0"};
      z-index: 100;
      background: #fff;
      border: none !important;
      border-bottom: 1px solid ${COLORS.border} !important;
      padding: 6px 8px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;
      row-gap: 4px;
      max-width: 100vw;
      overflow-x: hidden;
    }
    .ql-toolbar.ql-snow .ql-formats {
      display: inline-flex !important;
      align-items: center;
      gap: 1px;
      margin-right: 4px !important;
      padding-right: 4px;
      border-right: 1px solid ${COLORS.borderLight};
    }
    .ql-toolbar.ql-snow .ql-formats:last-child {
      border-right: none;
      margin-right: 0 !important;
      padding-right: 0;
    }
    .ql-toolbar.ql-snow button {
      width: 26px !important;
      height: 26px !important;
      border-radius: 4px;
      display: flex !important;
      align-items: center;
      justify-content: center;
      padding: 2px !important;
    }
    .ql-toolbar.ql-snow button:hover,
    .ql-toolbar.ql-snow button.ql-active {
      background: ${COLORS.surfaceSecondary};
      color: ${COLORS.primary};
    }
    .ql-toolbar.ql-snow button svg {
      width: 16px !important;
      height: 16px !important;
    }
    .ql-toolbar.ql-snow .ql-picker {
      height: 24px;
    }
    .ql-toolbar.ql-snow .ql-picker-label {
      border: 1px solid ${COLORS.border} !important;
      border-radius: 4px;
      padding: 1px 2px !important;
      font-size: 10px;
      line-height: 20px;
    }
    .ql-toolbar.ql-snow .ql-picker-label svg {
      width: 14px !important;
      height: 14px !important;
    }
    .ql-toolbar.ql-snow .ql-font .ql-picker-label {
      min-width: 50px;
    }
    .ql-toolbar.ql-snow .ql-size .ql-picker-label {
      min-width: 52px;
    }
    .ql-toolbar.ql-snow .ql-picker-options {
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid ${COLORS.border};
      font-size: 12px;
    }

    .ql-container.ql-snow {
      border: none !important;
      font-size: 15px;
      height: calc(100vh - ${showZoomControls ? "80px" : "48px"});
      overflow-y: auto;
      overflow-x: hidden;
      background: #fff;
      max-width: 100vw;
    }
    .ql-editor {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 15px;
      line-height: 1.8;
      padding: 16px 16px 120px 16px;
      color: ${COLORS.textPrimary};
      min-height: 100%;
      max-width: 100%;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .ql-editor p { margin-bottom: 0.5em; }
    .ql-editor h1 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; }
    .ql-editor h2 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; }
    .ql-editor.ql-blank::before {
      color: ${COLORS.textMuted};
      font-style: normal;
    }

    .ql-editor hr { border: none; border-top: 1px solid ${COLORS.border}; margin: 1.5em 0; }

    .zoom-controls {
      position: sticky; top: 0; background: #fff; z-index: 101;
      padding: 4px 8px;
      border-bottom: 1px solid ${COLORS.border};
      display: ${showZoomControls ? "flex" : "none"};
      justify-content: space-between; align-items: center;
      font-size: 10px; font-weight: 500; color: ${COLORS.textSecondary};
    }
    .zoom-buttons { display: flex; align-items: center; gap: 4px; }
    .zoom-btn {
      background: ${COLORS.surfaceSecondary};
      color: ${COLORS.textSecondary};
      border: 1px solid ${COLORS.border};
      padding: 3px 8px; border-radius: 4px; cursor: pointer;
      font-size: 10px; font-weight: 500; min-width: 24px;
    }
    .zoom-level { font-size: 10px; color: ${COLORS.textMuted}; min-width: 36px; text-align: center; }
    #save-status { color: ${COLORS.textMuted}; font-size: 10px; display: flex; align-items: center; gap: 6px; font-weight: 400; }
    #save-status span { width: 5px; height: 5px; border-radius: 50%; background: #fbbf24; }
  </style>
</head>
<body>
  <div class="zoom-controls">
    <div class="zoom-buttons">
      <button class="zoom-btn" onclick="zoomOut()">−</button>
      <span class="zoom-level" id="zoom-level">100%</span>
      <button class="zoom-btn" onclick="zoomIn()">+</button>
      <button class="zoom-btn" onclick="resetZoom()">Reset</button>
    </div>
    <div id="save-status"><span></span>Unsaved changes</div>
  </div>
  <div id="toolbar" ${readOnly ? 'style="display:none"' : ""}>
    <span class="ql-formats">
      <select class="ql-font">
        <option value="serif" selected>Serif</option>
        <option value="monospace">Mono</option>
        <option value="sans-serif">Sans</option>
      </select>
      <select class="ql-size">
        <option value="small">Small</option>
        <option selected>Normal</option>
        <option value="large">Large</option>
        <option value="huge">Huge</option>
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
    var currentZoom = 1.0;

    function initializeQuill() {
      if (typeof Quill === 'undefined') {
        setTimeout(initializeQuill, 100);
        return;
      }

      var Font = Quill.import('formats/font');
      Font.whitelist = ['serif', 'monospace', 'sans-serif'];
      Quill.register(Font, true);

      quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        modules: { toolbar: ${readOnly ? "false" : "'#toolbar'"} },
        placeholder: '${placeholder.replace(/'/g, "\\'")}',
        readOnly: ${readOnly}
      });

      quillEditor.blur();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
      applyZoom(1.0);

      quillEditor.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') {
          setDirty(true);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'update',
            content: quillEditor.root.innerHTML
          }));
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'content-changed' }));
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
        if (data.type === 'load' && quillEditor) {
          loadContent(data.content || '', !!data.scrollToBottom);
          setDirty(false);
        } else if (data.type === 'template') {
          insertTemplate(data.date || '', data.time || '', data.patientName || '', data.fileType || '', data.content || '');
          setDirty(true);
        } else if (data.type === 'clear') {
          if (quillEditor) {
            quillEditor.setContents([]);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'update', content: '<p><br></p>' }));
            setDirty(true);
          }
        } else if (data.type === 'get-content') {
          if (quillEditor) {
            var currentContent = quillEditor.root.innerHTML;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'current-content', content: currentContent }));
          }
        }
      } catch(e) {}
    }

    function setDirty(isDirty) {
      var statusEl = document.getElementById('save-status');
      if (!statusEl) return;
      statusEl.innerHTML = isDirty
        ? '<span></span>Unsaved changes'
        : '<span style="background:#22c55e;"></span>Saved';
    }

    function zoomIn() { currentZoom = Math.min(3.0, currentZoom + 0.1); applyZoom(currentZoom); }
    function zoomOut() { currentZoom = Math.max(0.3, currentZoom - 0.1); applyZoom(currentZoom); }
    function resetZoom() { applyZoom(1.0); }
    function applyZoom(zoom) {
      currentZoom = zoom;
      var editor = document.querySelector('.ql-editor');
      if (editor) {
        editor.style.transform = 'scale(' + zoom + ')';
        editor.style.transformOrigin = 'top left';
        editor.style.width = (100 / zoom) + '%';
      }
      var zoomEl = document.getElementById('zoom-level');
      if (zoomEl) zoomEl.textContent = Math.round(zoom * 100) + '%';
    }

    function insertTemplate(date, time, patient, narration, notes) {
      if (!quillEditor) return;
      var html = '<h1 style="text-align: center;"><strong>Patient Note</strong></h1>' +
        '<p><strong>Date:</strong> ' + date + '</p>' +
        '<p><strong>Time:</strong> ' + time + '</p>' +
        '<p><strong>Patient:</strong> ' + patient + '</p>' +
        '<p><strong>Clinical Notes:</strong></p>' +
        '<p>' + (notes || '<br>') + '</p><hr/>';
      var currentLength = quillEditor.getLength();
      quillEditor.clipboard.dangerouslyPasteHTML(currentLength - 1, html);
      var updatedContent = quillEditor.root.innerHTML;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'update', content: updatedContent }));
    }

    function loadContent(content, scrollToBottom) {
      if (!quillEditor) return;
      quillEditor.setContents([]);
      quillEditor.clipboard.dangerouslyPasteHTML(0, content);
      var updatedContent = quillEditor.root.innerHTML;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'update', content: updatedContent }));
      // Prevent auto-focus after content load
      quillEditor.blur();
      if (document.activeElement) document.activeElement.blur();
      if (scrollToBottom) {
        requestAnimationFrame(function() {
          var container = document.querySelector('.ql-container');
          if (container) container.scrollTop = container.scrollHeight;
        });
      }
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

const ForwardedRichTextEditor = forwardRef(RichTextEditor);
ForwardedRichTextEditor.displayName = "RichTextEditor";
export default ForwardedRichTextEditor;

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
