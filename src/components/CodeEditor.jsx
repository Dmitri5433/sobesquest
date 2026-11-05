import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { sql as sqlLang } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { useI18n } from '../lib/i18n'

export default function CodeEditor({ value, onChange, height = '280px', readOnly = false, language = 'js' }) {
  const { theme } = useI18n()
  return (
    <div className="code-editor" data-theme={theme}>
      <CodeMirror
        value={value}
        height={height}
        theme={theme === 'light' ? 'light' : oneDark}
        extensions={[language === 'sql' ? sqlLang() : javascript()]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{ tabSize: 2, foldGutter: false }}
      />
    </div>
  )
}
