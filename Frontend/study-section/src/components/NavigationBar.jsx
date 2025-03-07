// src/components/NavigationBar.jsx (renamed from Navbar.jsx)
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { gsap } from 'gsap'
import '../styles/Navbar.css'

const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('study')
  const navLinksRef = useRef([])

  useEffect(() => {
    // Set initial state
    gsap.set(navLinksRef.current, {
      opacity: 0,
      y: -20
    })

    // Create entrance animation
    gsap.to(navLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      delay: 0.1,
      ease: "power3.out"
    })

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Add links to ref array
  const addToRefs = (el) => {
    if (el && !navLinksRef.current.includes(el)) {
      navLinksRef.current.push(el)
    }
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-links">
        {['Home', 'Retail', 'Community', 'Study', 'About', 'FFR'].map((link) => (
          <NavLink 
            key={link.toLowerCase()}
            ref={addToRefs}
            link={link}
            isActive={activeLink === link.toLowerCase()}
            onClick={() => setActiveLink(link.toLowerCase())}
          />
        ))}
      </div>
    </nav>
  )
}

const NavLink = React.forwardRef(({ link, isActive, onClick }, ref) => (
  <a
    ref={ref}
    href={`#${link.toLowerCase()}`}
    className={`nav-link ${isActive ? 'active' : ''}`}
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
  >
    {link}
  </a>
))

NavLink.propTypes = {
  link: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
}

NavLink.displayName = 'NavLink'

export default NavigationBar