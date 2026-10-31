import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'

export default function ReviewForm({ companySlug, onSubmitted }) {
  const { profile, hasSupabase } = useAuth()
  const { t } = useI18n()
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  if (done) {
    return <div className="review-done">{t('reviews.done')}</div>
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) return setError(t('reviews.errRating'))
    if (text.trim().length < 10) return setError(t('reviews.errText'))
    setError(null)
    setSending(true)
    const { error: dbError } = await supabase.from('reviews').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      author_name: profile?.username || t('reviews.anon'),
      company_slug: companySlug,
      rating,
      text: text.trim(),
    })
    setSending(false)
    if (dbError) {
      setError(t('reviews.dbError', { error: dbError.message }))
      return
    }
    setDone(true)
    onSubmitted?.()
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <div className="review-form-title">{t('reviews.formTitle')}</div>
      <div className="stars-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= rating ? 'active' : ''}`}
            onClick={() => setRating(star)}
            aria-label={`${star}`}
          >
            <Star size={22} fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder={t('reviews.placeholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <div className="form-error">{error}</div>}
      <button className="btn btn-primary" disabled={sending || !hasSupabase}>
        <Send size={15} /> {sending ? t('reviews.sending') : t('reviews.send')}
      </button>
    </form>
  )
}
