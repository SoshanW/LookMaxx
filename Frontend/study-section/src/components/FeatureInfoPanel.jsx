import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'
import FeatureHeader from './FeatureHeader'
import FeatureContent from './FeatureContent'
import FeatureFooter from './FeatureFooter'
import '../styles/FeatureInfo.css'

const FeatureInfoPanel = ({ feature, description, onClose, style = {}, isExiting = false, onExitComplete }) => {
  const panelRef = useRef(null)
  
  useEffect(() => {
    if (!panelRef.current) return

    const isLeftSide = style.left !== undefined && style.right === undefined
    const tl = gsap.timeline()

    if (!isExiting) {
      gsap.set(panelRef.current, {
        opacity: 0,
        x: isLeftSide ? -100 : 100,
        y: 20,
        scale: 0.9,
        rotationY: isLeftSide ? -15 : 15,
        transformOrigin: isLeftSide ? 'left center' : 'right center'
      })

      tl.to(panelRef.current, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
      tl.to(panelRef.current, {
        boxShadow: '0 0 30px rgba(77, 155, 255, 0.8), inset 0 0 15px rgba(77, 155, 255, 0.4)',
        duration: 0.3
      }, '+=0.1')
      tl.to(panelRef.current, {
        boxShadow: '0 0 20px rgba(77, 155, 255, 0.3), inset 0 0 10px rgba(77, 155, 255, 0.1)',
        duration: 0.5
      }, '+=0.1')
    } else {
      tl.to(panelRef.current, {
        opacity: 0,
        x: isLeftSide ? -100 : 100,
        y: 20,
        scale: 0.9,
        rotationY: isLeftSide ? -15 : 15,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: onExitComplete
      })
    }
  }, [style, isExiting, onExitComplete])

  return (
    <div className="feature-info-container" style={style} ref={panelRef}>
      <CloseButton onClose={onClose} />
      <FeatureHeader title={feature} />
      <FeatureContent description={description} isExiting={isExiting} />
      <FeatureFooter />
    </div>
  )
}

FeatureInfoPanel.propTypes = {
  feature: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  style: PropTypes.object,
  isExiting: PropTypes.bool,
  onExitComplete: PropTypes.func
}

const CloseButton = ({ onClose }) => (
  <button className="close-button" onClick={onClose}>×</button>
)

CloseButton.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default FeatureInfoPanel