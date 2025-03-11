import { useState } from 'react'
import './App.css'
import AnatomyExplorer from './components/study-section/AnatomyExplorer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    {/* <Navbar/> */}
    < AnatomyExplorer/>
    </>
  )
}

export default App
