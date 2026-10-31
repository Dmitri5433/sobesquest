import { useState } from 'react'
import { Eye, MessageSquareQuote } from 'lucide-react'
import { useI18n } from '../lib/i18n'

const RATINGS = [
  { score: 2, label: 'q.know', cls: 'good' },
  { score: 1, label: 'q.partly', cls: 'mid' },
  { score: 0, label: 'q.unknown', cls: 'bad' },
]

/**
 * Карточка вопроса с полем ответа, эталоном и самооценкой.
 * @param {{ index: number, total: number, question: string, answer: string|null, kind: string, onAnswer: (score:number)=>void }} props
 */
export default function QuestionCard({ index, total, question, answer, kind, onAnswer }) {
  const { t } = useI18n()
  const [ownAnswer, setOwnAnswer] = useState('')
  const [revealed, setRevealed] = useState(!answer)

  return (
    <div className="question-card">
      <div className="question-head">
        <span className={`kind-badge ${kind === 'hr' ? 'kind-hr' : 'kind-tech'}`}>
          {kind === 'hr' ? <MessageSquareQuote size={13} /> : null}
          {kind === 'hr' ? t('q.hr') : t('q.theory')}
        </span>
        <span className="question-counter">{t('q.counter', { index: index + 1, total })}</span>
      </div>

      <h3 className="question-text">{question}</h3>

      <textarea
        className="input answer-area"
        placeholder={t('q.placeholder')}
        value={ownAnswer}
        onChange={(e) => setOwnAnswer(e.target.value)}
        rows={4}
      />

      {!revealed ? (
        <button className="btn btn-outline" onClick={() => setRevealed(true)}>
          <Eye size={16} /> {t('q.showModel')}
        </button>
      ) : (
        <>
          {answer ? (
            <div className="model-answer">
              <div className="model-answer-title">{t('q.modelTitle')}</div>
              <p>{answer}</p>
            </div>
          ) : (
            <div className="model-answer open-question">
              <div className="model-answer-title">{t('q.openTitle')}</div>
              <p>{t('q.openText')}</p>
            </div>
          )}
          <div className="self-rating">
            <span>{t('q.selfRate')}</span>
            <div className="rating-buttons">
              {RATINGS.map((r) => (
                <button key={r.score} className={`rating-btn ${r.cls}`} onClick={() => onAnswer(r.score)}>
                  {t(r.label)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
