import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'
import { LEVELS } from '../lib/progression'
import CompanyLogo from './CompanyLogo'

export default function CompanyCard({ company, unlocked }) {
  const { t } = useI18n()
  const requiredLevel = LEVELS[company.required_level]

  return (
    <motion.div
      className={`company-card ${unlocked ? '' : 'locked'}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link to={`/companies/${company.slug}`} className="company-link">
        <CompanyLogo name={company.name} color={company.color} />
        <div className="company-info">
          <div className="company-name">{company.name}</div>
          <div className="company-tagline">{company.tagline}</div>
        </div>
        <span
          className={`company-level ${unlocked ? '' : 'locked-status'}`}
          style={{ color: unlocked ? requiredLevel.color : undefined }}
        >
          {unlocked ? (
            requiredLevel.name
          ) : (
            <><Lock size={12} /> {requiredLevel.name}</>
          )}
        </span>
        <span className="visually-hidden">{t('company.required', { level: requiredLevel.name })}</span>
      </Link>
    </motion.div>
  )
}
