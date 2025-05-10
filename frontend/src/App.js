import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Login from './features/auth/Login'
import Reg from './features/auth/Reg'
import Workspace from './features/workspace/Workspace'
import Prefetch from './features/auth/Prefetch'

function App() {
  return (
    // <div className="App">
    //   <h1>Milky Way</h1>
    // </div>
    <Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="login" element={<Login />} />
      <Route path="users" element={<Reg />} />
      
        {/* <Route index element={<Landing />} /> ^ this will be the default */}

        {/* protected routes */}
        <Route element={<Prefetch />}>
          <Route path="workspace" element={<Workspace />} />
        </Route>


    </Routes>
  );
}

export default App;
