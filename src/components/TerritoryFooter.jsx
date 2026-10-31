import { useI18n } from '../lib/i18n'

/** Подписи карты: процент освоения и легенда (без эмодзи — цветные маркеры) */
export default function TerritoryFooter({ percent, officesCount }) {
  const { t } = useI18n()
  return (
    <div className="territory-footer">
      <strong>{t('map.mastered', { percent })}</strong>
      <div className="map-legend">
        <span><i className="legend-tile" /> {t('map.land')}</span>
        <span><i className="legend-dot dot-junior" /> junior</span>
        <span><i className="legend-dot dot-middle" /> middle</span>
        <span><i className="legend-dot dot-senior" /> senior</span>
        {officesCount > 0 && <span><i className="legend-dot dot-office" /> {t('map.offices')}</span>}
      </div>
    </div>
  )
}
