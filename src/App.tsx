import { useState } from 'react'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <MainView />
    </>
  )
}

function Header() {
  return(
    <>
      <header>
        <div className="left-side-header">
          <h1>EasyBusCEP</h1>
          <b>Busque seu CEP facilmente!</b>
        </div>
        <div className="right-side-header">
          <div>Sobre</div>
        </div>
      </header>
    </>
  )
}

interface GeocodingTypage{
  principalSubdivision: string,
  principalSubdivisionCode: string,
  countryName: string,
  city: string,
}
interface ViaCEPTypage{
    bairro: string,
    cep: string,
}
function MainView() {
  const [state, setState] = useState<string>("")
  const [stateCode, setStateCode] = useState<string>("")
  const [cidad, setCidad] = useState<string>("")
  const [neighbor, setNeighbor] = useState<string>("")
  const [rua, setRua]=useState<string>("")
  const [finalCep, setFinalCep]=useState<string>("")

  const handleGeoCoding = async() => {
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = Number(pos.coords.latitude)
        const lon = Number(pos.coords.longitude)
        handleFetTest(lat, lon)
      }, (error) => {
        console.error("Erro ao conseguir a geolocalização: ", error)
      })
    } else {
      console.error("Erro ao usar o recurso de GEOLOCALIZAÇÃO nativa.")
    }
    
  }
  
  const handleFetTest = async(lat: number, lon:number) => {
    const resp_geo = await fetch(`https://easy-bus-cep.vercel.app/api/geocoding?lat=${lat}&lon=${lon}`)
    const res = await resp_geo.json() // fazer sistema de cache posteriormente
    console.log(res)
    const setter: GeocodingTypage | null = res
    setState(String(setter?.principalSubdivision))
    setStateCode(String(setter?.principalSubdivisionCode).replace("BR-", ""))
    setCidad(String(setter?.city))
  }

  const handleCEPFetch = async() => {
    try {
      const resp_via = await fetch(`https://viacep.com.br/ws/${stateCode}/${cidad}/${rua}/json/`)
      const res: ViaCEPTypage[] | null = await resp_via.json()
      console.log(JSON.stringify(res, null, 2));
      console.log(res?.[0]?.cep ?? "")
      setFinalCep(String(res?.[0]?.cep ?? ""))
    } catch (err: any) {
      console.error("Erro ao buscar na API ViaCEP: ", String(err))
    }
    
  }
  return(
    <>
      <div className="main-view">
        <div className="main-view-container">
          <h3>Busca de CEP por Endereço</h3>
          <button onClick={handleGeoCoding}>Preencher Automaticamente</button>
          <input type="text" placeholder='País' value={"Brasil"} disabled />
          <input type="text" placeholder='Estado' value={state} onChange={(e)=>setState(e.target.value)} />
          <input type="text" placeholder='Cidade' value={cidad} onChange={(e)=>setCidad(e.target.value)} />
          <input type="text" placeholder='Rua' value={rua} onChange={(e)=>setRua(e.target.value)} required />
          <button onClick={handleCEPFetch}>Buscar</button>
          {finalCep!=""?<span>CEP: {finalCep}</span>:null}
          
        </div>
      </div>
    </>
  )
}

export default App
