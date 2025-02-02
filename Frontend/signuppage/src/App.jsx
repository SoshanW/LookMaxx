import React, { useState } from 'react';
import SignUpPage from './pages/Signup';
import './styles.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <SignUpPage />
    </>
  );
}

export default App;