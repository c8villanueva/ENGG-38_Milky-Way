import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing';

function App() {
  return (
    // <div className="App">
    //   <h1>Milky Way</h1>
    // </div>
    <Routes>
      <Route path="/" element={<Landing />}>
      
        {/* <Route index element={<Landing />} /> ^ this will be the default */}
      
      </Route>

    </Routes>
  );
}

export default App;
