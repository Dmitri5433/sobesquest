import { useI18n } from '../lib/i18n'

/** Подписи карты: процент освоения и легенда */
export default function TerritoryFooter({ percent, officesCount }) {
  const { t } = useI18n()
  return (
    <div className="territory-footer">
      <strong>{t('map.mastered', { percent })}</strong>
      <div className="map-legend">
        <span><i className="legend-tile" /> {t('map.land')}</span>
        <span>🏘 <b>junior</b></span>
        <span>🏙 <b>middle</b></span>
        <span>🏰 <b>senior</b></span>
        {officesCount > 0 && <span>{t('map.offices')}</span>}
      </div>
    </div>
  )
}
