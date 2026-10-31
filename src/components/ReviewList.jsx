import { Star } from 'lucide-react'
import { useI18n } from '../lib/i18n'

const Stars = ({ value, size = 14 }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= value ? 'star-on' : 'star-off'} fill={i <= value ? 'currentColor' : 'none'} />
    ))}
  </span>
)

export default function ReviewList({ reviews }) {
  const { t, locale } = useI18n()

  if (!reviews || reviews.length === 0) {
    return <div className="reviews-empty">{t('reviews.empty')}</div>
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="reviews">
      <div className="reviews-summary">
        <Stars value={Math.round(avg)} size={16} />
        <strong>{avg.toFixed(1)}</strong>
        <span>· {t('reviews.count', { n: reviews.length })}</span>
      </div>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-head">
              <span className="review-author">{review.author_name}</span>
              <Stars value={review.rating} />
            </div>
            <p className="review-text">{review.text}</p>
            <span className="review-date">
              {new Date(review.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
