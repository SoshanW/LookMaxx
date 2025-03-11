import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModelDisplay from './ModelDisplay';

const FaceModelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get gender from URL query parameter
    const params = new URLSearchParams(location.search);
    const genderParam = params.get('gender');
    
    if (genderParam) {
      setGender(genderParam);
    } else {
      console.error('No gender parameter provided');
    }
    
    setLoading(false);
  }, [location, navigate]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const handleContinue = () => {
    // Navigate to the next step in your app flow
    navigate('/customization');
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(176, 69, 195, 0.3)',
          borderRadius: '50%',
          borderTop: '5px solid rgba(176, 69, 195, 0.8)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="face-model-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f031b 0%, #2e1855 50%, #07010b 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header className="face-model-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderRadius: '10px',
        background: 'rgba(0, 0, 0, 0.4)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <button 
          className="back-button"
          onClick={handleBackClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#555',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'rgba(176, 69, 195, 0.8)'}
          onMouseOut={(e) => e.currentTarget.style.color = '#555'}
        >
          <span style={{ marginRight: '8px' }}>←</span> Back
        </button>
        <h1 className="page-title" style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '600',
          color: '#333',
          background: 'linear-gradient(to right, #b045c3, #7d3ac1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Your Virtual Model
        </h1>
        <div style={{ width: '80px' }}></div> {/* Spacer to balance header */}
      </header>

      <div className="model-content">
        <div className="model-container" style={{
          margin: '20px auto',
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          height: '600px',
          maxWidth: '900px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          background: 'rgba(0, 0, 0, 0.02)'
        }}>
          <h3 style={{
            padding: '15px',
            margin: 0,
            backgroundImage: 'linear-gradient(135deg, rgba(176, 69, 195, 0.8) 0%, rgba(125, 58, 193, 0.8) 100%)',
            color: 'white',
            borderBottom: 'none',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            Your {gender === 'male' ? 'Male' : 'Female'} Avatar
          </h3>
          
          {/* Display the 3D model with the gender passed from signup */}
          <div style={{ height: 'calc(100% - 100px)' }}>
            <ModelDisplay gender={gender} />
          </div>
          
          <div style={{
            padding: '15px',
            backgroundImage: 'linear-gradient(135deg, rgba(176, 69, 195, 0.8) 0%, rgba(125, 58, 193, 0.8) 100%)',
            color: 'white',
            borderTop: 'none',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            <span style={{ display: 'block', opacity: '0.9' }}>
              This is your default avatar based on your gender selection.
            </span>
          </div>
        </div>

        <div className="action-buttons" style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px',
          gap: '15px'
        }}>
          <button 
            className="secondary-button"
            onClick={handleBackClick}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#555',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            Go Back
          </button>
          <button 
            className="primary-button"
            onClick={handleContinue}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, rgba(176, 69, 195, 0.9) 0%, rgba(125, 58, 193, 0.9) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(176, 69, 195, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(176, 69, 195, 1) 0%, rgba(125, 58, 193, 1) 100%)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(176, 69, 195, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(176, 69, 195, 0.9) 0%, rgba(125, 58, 193, 0.9) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(176, 69, 195, 0.3)';
            }}
          >
            Continue to Homepage
          </button>
        </div>
      </div> 
    </div>
  );
};

export default FaceModelPage;