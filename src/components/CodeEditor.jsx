import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

export default function CodeEditor({ value, onChange, height = '280px', readOnly = false }) {
  return (
    <div className="code-editor">
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={[javascript()]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{ tabSize: 2, foldGutter: false }}
      />
    </div>
  )
}
