import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import '../../styles/study-section/Navbar.css'

const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState('study')
  const navLinksRef = useRef([])

  useEffect(() => {
    gsap.set(navLinksRef.current, { opacity: 0, y: -20 })
    gsap.to(navLinksRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.1,
      delay: 0.1,
      ease: 'power3.out'
    })

    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const addToRefs = (el) => {
    if (el && !navLinksRef.current.includes(el)) {
      navLinksRef.current.push(el)
    }
  }

  const navLinks = ['Home', 'Retail', 'Community', 'Study', 'About', 'FFR']

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-links">
        {navLinks.map(link => (
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

NavLink.displayName = 'NavLink'

export default NavigationBar