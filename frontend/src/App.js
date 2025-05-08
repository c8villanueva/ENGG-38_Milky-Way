import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Login from './features/auth/Login'

function App() {
  return (
    // <div className="App">
    //   <h1>Milky Way</h1>
    // </div>
    <Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="login" element={<Login />} />
      
        {/* <Route index element={<Landing />} /> ^ this will be the default */}
    

    </Routes>
  );
}

export default App;
