import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import Login from './features/auth/Login'
import Reg from './features/auth/Reg'
import Workspace from './features/workspace/Workspace'
import Prefetch from './features/auth/Prefetch'
import PersistLogin from './features/auth/PersistLogin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="auth" element={<Login />} />
      <Route path="users" element={<Reg />} />

        {/* protected routes */}
        <Route element={<PersistLogin />}>
          <Route element={<Prefetch />}>
            <Route path="workspace" element={<Workspace />} />
          </Route>
        </Route>


    </Routes>
  );
}

export default App;
