import 'leaflet/dist/leaflet.css';
import './App.css'

import { Header } from './components/header/header';
import { MainView } from './components/main/mainview';

function App() {
  return (
    <>
      <Header />
      <MainView />
    </>
  )
}

export default App
