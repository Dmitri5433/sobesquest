import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, X, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import { useI18n } from '../lib/i18n'
/** Обсуждение задачи: комментарии с ответами, пишут только зарегистрированные */
export default function Discussion({ taskId }) {
  const { t, locale } = useI18n()
  const { user, profile } = useAuth()
  const [comments, setComments] = useState(null) // null = загрузка
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, author }
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at')
      .then(({ data }) => setComments(data || []))
  }

  useEffect(load, [taskId])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    setError(null)
    const { data: authData } = await supabase.auth.getUser()
    const { error: dbError } = await supabase.from('comments').insert({
      user_id: authData.user?.id,
      author_name: profile?.username || t('reviews.anon'),
      task_id: taskId,
      parent_id: replyTo?.id ?? null,
      body: text.trim(),
    })
    setSending(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    setText('')
    setReplyTo(null)
    load()
  }

  if (comments === null) {
    return <div className="page-loading"><span className="spinner" /></div>
  }

  const childrenOf = (parentId) => comments.filter((c) => c.parent_id === parentId)

  const renderComment = (comment) => (
    <div key={comment.id} className="comment">
      <div className="comment-head">
        <span className="avatar sm">{(comment.author_name || '?')[0].toUpperCase()}</span>
        <Link to={`/players/${comment.author_name}`} className="comment-author">
          {comment.author_name}
        </Link>
        <span className="comment-date">
          {new Date(comment.created_at).toLocaleString(locale, {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>
      <p className="comment-body">{comment.body}</p>
      {user && (
        <button
          className="comment-reply"
          onClick={() => setReplyTo({ id: comment.id, author: comment.author_name })}
        >
          <MessageCircle size={12} /> {t('forum.reply')}
        </button>
      )}
      {childrenOf(comment.id).length > 0 && (
        <div className="comment-children">{childrenOf(comment.id).map(renderComment)}</div>
      )}
    </div>
  )

  return (
    <div className="discussion">
      {comments.length === 0 ? (
        <div className="empty-hint">{t('forum.emptyTask')}</div>
      ) : (
        <div className="comments-list">{comments.filter((c) => !c.parent_id).map(renderComment)}</div>
      )}

      {user ? (
        <form className="comment-form" onSubmit={submit}>
          {replyTo && (
            <div className="replying-to">
              <span>{t('forum.replyTo', { author: replyTo.author })}</span>
              <button type="button" onClick={() => setReplyTo(null)} aria-label={t('forum.cancelReply')}>
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
            className="input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('forum.commentPh')}
          />
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-sm" disabled={sending || !text.trim()}>
            <Send size={14} /> {sending ? t('forum.sending') : t('forum.send')}
          </button>
        </form>
      ) : (
        <div className="guest-note">
          {t('forum.loginToWrite1')}
          <Link to="/login">{t('forum.loginLink')}</Link>
          {t('forum.loginToWrite2')}
          <Link to="/register">{t('forum.registerLink')}</Link>
          {t('forum.loginToWrite3')}
        </div>
      )}
    </div>
  )
}
