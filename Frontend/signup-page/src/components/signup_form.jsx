import React, { useState } from 'react'
import './signup_form.css'

function signup_form() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    validateField(name, value)
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        setErrors(prev => ({
          ...prev,
          username: !(value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value))
        }))
        break
      case 'email':
        setErrors(prev => ({
          ...prev,
          email: !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        }))
        break
      case 'password':
        setErrors(prev => ({
          ...prev,
          password: !(value.length >= 8 && 
            /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value))
        }))
        break
      case 'confirmPassword':
        setErrors(prev => ({
          ...prev,
          confirmPassword: !(value === formData.password && value !== '')
        }))
        break
      default:
        break
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const usernameValid = !errors.username && formData.username.length >= 3
    const emailValid = !errors.email
    const passwordValid = !errors.password
    const confirmPasswordValid = !errors.confirmPassword

    if (usernameValid && emailValid && passwordValid && confirmPasswordValid) {
      // Typically send to backend
      console.log('Signup Data:', formData)
      alert('Signup Successful')
    }
  }

  return (
    <div className="signup_container">
      <h2>Signup to Create an Account</h2>
      <form id="signupForm" onSubmit={handleSubmit}>
        <div className="form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
            <div className="error">
              Username must be longer than three characters
            </div>
          )}
        </div>

        <div className="form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <div className="error">
              Email entered is not valid
            </div>
          )}
        </div>

        <div className="form">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <div className="error">
              Password must contain at least eight characters
            </div>
          )}
        </div>

        <div className="form">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <div className="error">
              Passwords do not match
            </div>
          )}
        </div>

        <button type="submit" className="signup_btn">
          Signup
        </button>
      </form>
    </div>
  )
}

export default signup_form