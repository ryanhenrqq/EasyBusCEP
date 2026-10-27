import { useEffect, useState } from 'react'
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
  const [country, setCountry]=useState<string>("Brasil")
  const [state, setState] = useState<string>("")
  const [stateCode, setStateCode] = useState<string>("")
  const [cidad, setCidad] = useState<string>("")
  const [rua, setRua]=useState<string>("")
  const [finalCep, setFinalCep]=useState<string>("")
  const [loadingCEP, setLoadingCEP]=useState<boolean>(false)
  const [loadingGeo, setLoadingGeo]=useState<boolean>(false)
  const [invalidCountry, setInvalidCountry]=useState<boolean>(false)
  const [errorMsg, setErrorMsg]=useState<string>("")

  const handleGeoCoding = async() => {
    setLoadingGeo(true)
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = Number(pos.coords.latitude)
        const lon = Number(pos.coords.longitude)
        handleFetTest(lat, lon)
      }, (error) => {
        setLoadingGeo(false)
        console.error("Erro ao conseguir a geolocalização: ", error)
      })
    } else {
      setLoadingGeo(false)
      console.error("Erro ao usar o recurso de GEOLOCALIZAÇÃO nativa.")
    }
  }
  
  const handleFetTest = async(lat: number, lon:number) => {
    try {
      const resp_geo = await fetch(`https://easy-bus-cep.vercel.app/api/geocoding?lat=${lat}&lon=${lon}`)
      if (!resp_geo.ok) {
        if (resp_geo.status === 429) {
          throw new Error('Muitas requisições!')
        } else {
          const errData = await resp_geo.json()
          throw new Error(errData.error || 'Erro incomum, verifique o console.');
        }
      }
      const res = await resp_geo.json() // fazer sistema de cache posteriormente
      console.log(res)
      const setter: GeocodingTypage | null = res
      setCountry(String(setter?.countryName))
      setState(String(setter?.principalSubdivision))
      setStateCode(String(setter?.principalSubdivisionCode).replace("BR-", ""))
      setCidad(String(setter?.city))
    } catch (err:any){
      setErrorMsg(`GeoCod: ${String(err)}`)
      console.error("Erro na requisição da API GEOCODING: ", String(err))
    } finally {
      setLoadingGeo(false)
    }
  }

  const handleCEPFetch = async() => {
    if (country!="Brasil") {
      setInvalidCountry(true)
      return
    } else {
      setInvalidCountry(false)
      setFinalCep("")
      setErrorMsg("")
    }
    try {
      setLoadingCEP(true)
      const resp_via = await fetch(`https://viacep.com.br/ws/${stateCode}/${cidad}/${rua}/json/`)
      const res: ViaCEPTypage[] | null = await resp_via.json()
      console.log(JSON.stringify(res, null, 2));
      console.log(res?.[0]?.cep ?? "error")
      setFinalCep(String(res?.[0]?.cep ?? "error"))
    } catch (err: any) {
      setErrorMsg(`ViaAPI: ${String(err)}`)
      console.error("Erro ao buscar na API ViaCEP: ", String(err))
    } finally {
      setLoadingCEP(false)
    }
  }

  useEffect(()=>{
    handleGeoCoding()
  }, [])
  return(
    <>
      <div className="main-view">
        <div className="main-view-container">
          <h3>Busca de CEP por Endereço</h3>
          {!loadingGeo?<button onClick={handleGeoCoding}>Preencher Automaticamente</button>:<b>Aguarde...</b>}
          <input type="text" placeholder='País' value={country} disabled />
          <input type="text" placeholder='Estado' value={state} onChange={(e)=>setState(e.target.value)} />
          <input type="text" placeholder='Cidade' value={cidad} onChange={(e)=>setCidad(e.target.value)} />
          <input type="text" placeholder='Rua' value={rua} onChange={(e)=>setRua(e.target.value)} required />
          {loadingCEP?<b>Aguarde...</b>:<button onClick={handleCEPFetch}>Buscar</button>}
          {finalCep!=""?
          finalCep!="error"?
          <span>CEP: {finalCep}</span>
          :
          <b>Este endereço está incorreto! (Erro 400)</b>
          :null}
          {invalidCountry?<p>Esse serviço funciona apenas no Brasil</p>:null}
          {errorMsg!=""?<small>{errorMsg}</small>:null}
        </div>
      </div>
    </>
  )
}

export default App
