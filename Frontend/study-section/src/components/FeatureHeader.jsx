// src/components/FeatureHeader.jsx
import React from 'react'
import PropTypes from 'prop-types'

const FeatureHeader = ({ title }) => {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  return (
    <div className="feature-header">
      <div className="feature-line"></div>
      <h2 className="feature-title">{capitalizeFirstLetter(title)}</h2>
      <div className="feature-line"></div>
    </div>
  )
}

FeatureHeader.propTypes = {
  title: PropTypes.string.isRequired
}

export default FeatureHeader