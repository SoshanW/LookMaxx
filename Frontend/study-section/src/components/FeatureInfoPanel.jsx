// src/components/FeatureInfoPanel.jsx (renamed from FeatureInfo.jsx)
import React from 'react'
import PropTypes from 'prop-types'
import FeatureHeader from './FeatureHeader'
import FeatureContent from './FeatureContent'
import FeatureFooter from './FeatureFooter'
import '../styles/FeatureInfo.css'

const FeatureInfoPanel = ({ feature, description, onClose }) => (
  <div className="feature-info-container">
    <CloseButton onClose={onClose} />
    <FeatureHeader title={feature} />
    <FeatureContent description={description} />
    <FeatureFooter />
  </div>
)

FeatureInfoPanel.propTypes = {
  feature: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
}

const CloseButton = ({ onClose }) => (
  <button className="close-button" onClick={onClose}>×</button>
)

CloseButton.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default FeatureInfoPanel