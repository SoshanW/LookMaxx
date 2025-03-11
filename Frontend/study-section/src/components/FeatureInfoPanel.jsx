import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { gsap } from 'gsap';
import FeatureHeader from './FeatureHeader';
import FeatureContent from './FeatureContent';
import FeatureFooter from './FeatureFooter';
import '../styles/FeatureInfo.css';

const FeatureInfoPanel = ({ feature, description, onClose, style = {}, isExiting = false, onExitComplete }) => {
  const panelRef = useRef(null);
  const [isMouseInside, setIsMouseInside] = useState(false);

  // 🛠 Prevents Auto-Closing on Hover
  const handleMouseEnter = () => setIsMouseInside(true);
  const handleMouseLeave = () => {
    setTimeout(() => {
      if (!isMouseInside && !isExiting) onClose();
    }, 300);
  };

  // 🛠 Click-Outside Handler to Close Panel
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // 🛠 GSAP Animations (Fixed for Stability)
  useEffect(() => {
    if (!panelRef.current) return;

    const isLeftSide = style.left !== undefined && style.right === undefined;
    gsap.killTweensOf(panelRef.current);

    const tl = gsap.timeline();

    if (!isExiting) {
      gsap.set(panelRef.current, {
        opacity: 0,
        x: isLeftSide ? -150 : 150,
        y: 50,
        scale: 0.8,
        rotationY: isLeftSide ? -25 : 25,
        transformOrigin: isLeftSide ? 'left center' : 'right center'
      });

      tl.to(panelRef.current, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 1,
        ease: "expo.out"
      });

      tl.to(panelRef.current, {
        boxShadow: "0 0 30px rgba(77, 155, 255, 0.8), inset 0 0 15px rgba(77, 155, 255, 0.4)",
        duration: 0.3,
      }, "+=0.1");

      tl.to(panelRef.current, {
        boxShadow: "0 0 20px rgba(77, 155, 255, 0.3), inset 0 0 10px rgba(77, 155, 255, 0.1)",
        duration: 0.5,
      }, "+=0.1");
    } else {
      tl.to(panelRef.current, {
        opacity: 0,
        x: isLeftSide ? -150 : 150,
        y: 50,
        scale: 0.8,
        rotationY: isLeftSide ? -25 : 25,
        duration: 0.8,
        ease: "power1.inOut",
        onComplete: onExitComplete,
      });
    }
  }, [style, isExiting, onExitComplete]);

  return (
    <div 
      className="feature-info-container" 
      style={style} 
      ref={panelRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CloseButton onClose={onClose} />
      <FeatureHeader title={feature} />
      <FeatureContent key={feature} description={description} isExiting={isExiting} />
      <FeatureFooter />
    </div>
  );
};

// 🛠 Custom Close Button with Hover Glow
const CloseButton = ({ onClose }) => (
  <button className="close-button" onClick={onClose}>×</button>
);

CloseButton.propTypes = {
  onClose: PropTypes.func.isRequired
};

// 🛠 Prop Validations
FeatureInfoPanel.propTypes = {
  feature: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  style: PropTypes.object,
  isExiting: PropTypes.bool,
  onExitComplete: PropTypes.func
};

export default FeatureInfoPanel;