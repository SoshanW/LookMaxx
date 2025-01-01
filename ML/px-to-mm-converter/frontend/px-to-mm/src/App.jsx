import CamerComponent from './components/CameraComponent';

function App() {

  return(
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-4x1 mx-auto'>
        <h1 className="text-3xl font-bold mb-8 text-center">Pixel to MM Converter</h1>
        <CamerComponent />
      </div>
    </div>
    )
}

export default App;