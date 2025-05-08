import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Login from './features/auth/Login'
import Reg from './features/auth/Reg'
import Workspace from './features/workspace/Workspace'

function App() {
  return (
    // <div className="App">
    //   <h1>Milky Way</h1>
    // </div>
    <Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="login" element={<Login />} />
      <Route path="reg" element={<Reg />} />
      
        {/* <Route index element={<Landing />} /> ^ this will be the default */}

        {/* protected routes */}
        <Route path="workspace" element={<Workspace />} />

    </Routes>
  );
}

export default App;
