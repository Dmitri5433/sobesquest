import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useI18n } from '../lib/i18n'

export default function CodeEditor({ value, onChange, height = '280px', readOnly = false }) {
  const { theme } = useI18n()
  return (
    <div className="code-editor" data-theme={theme}>
      <CodeMirror
        value={value}
        height={height}
        theme={theme === 'light' ? 'light' : oneDark}
        extensions={[javascript()]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{ tabSize: 2, foldGutter: false }}
      />
    </div>
  )
}
