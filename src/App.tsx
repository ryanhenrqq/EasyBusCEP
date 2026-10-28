import { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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
          <div>Versão de Teste</div>
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
  const [stateCode, setStateCode] = useState<string>("")
  const [cidad, setCidad] = useState<string>("")
  const [rua, setRua]=useState<string>("")
  const [finalCep, setFinalCep]=useState<string>("")
  const [loadingCEP, setLoadingCEP]=useState<boolean>(false)
  const [loadingGeo, setLoadingGeo]=useState<boolean>(false)
  const [invalidCountry, setInvalidCountry]=useState<boolean>(false)
  const [errorMsg, setErrorMsg]=useState<string>("")

  const [copyClip, setCopyClip]=useState<string>("Copiar")
  const [triggerCoords, setTriggerCoords]=useState<boolean>(false)
  const [lat, setLat]=useState<number>(0)
  const [lon, setLon]=useState<number>(0)

  const handleGeoCoding = async() => {
    setLoadingGeo(true)
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = Number(pos.coords.latitude)
        const lon = Number(pos.coords.longitude)
        setLat(lat)
        setLon(lon)
        setTriggerCoords(true)
        handleFetTest(lat, lon)
      }, (error) => {
        setLoadingGeo(false)
        setErrorMsg(`Não foi possivel conseguir a sua localização! (Erro: ${error})`)
        console.error("Erro ao conseguir a geolocalização: ", error)
      })
    } else {
      setLoadingGeo(false)
      setErrorMsg(`Não foi possivel conseguir a sua localização por falta de permissões!`)
      console.error("Erro ao usar o recurso de GEOLOCALIZAÇÃO nativa.")
    }
  }
  
  const handleFetTest = async(lat: number, lon:number) => {
    try {
      const resp_geo = await fetch(`https://easy-bus-cep.vercel.app/api/geocoding?lat=${lat}&lon=${lon}`)
      if (!resp_geo.ok) {
        if (resp_geo.status === 429) {
          throw new Error('Muitas requisições!')
        } else if (resp_geo.status === 400) {
          throw new Error('Erro de Digitação!')
        } else {
          const errData = await resp_geo.json()
          throw new Error(errData.error || 'Erro incomum, verifique o console.');
        }
      }
      const res = await resp_geo.json() // fazer sistema de cache posteriormente
      console.log(res)
      const setter: GeocodingTypage | null = res
      setCountry(String(setter?.countryName))
      setStateCode(String(setter?.principalSubdivisionCode).replace("BR-", ""))
      setCidad(String(setter?.city))
    } catch (err:any){
      setErrorMsg(`Erro no GeoCod: ${String(err)}`)
      console.error("Erro na requisição da API GEOCODING: ", String(err))
    } finally {
      setLoadingGeo(false)
    }
  }

  const handleCEPFetch = async() => {
    setFinalCep("")
    setErrorMsg("")

    if (country!="Brasil") {
      setInvalidCountry(true)
      return
    } else {
      if (stateCode==""&&cidad==""&&rua==""){
        setErrorMsg("Insira todas as informações acima.")
        return
      }
      if (stateCode==""){
        setErrorMsg("Insira um UF (Ex.: SP).")
        return
      }
      if (cidad=="") {
        setErrorMsg("Insira uma cidade")
        return
      }
      if (rua==""){
        setErrorMsg("Insira uma Rua.")
        return
      }
      setInvalidCountry(false)
    }

    const stcod:string = stateCode.replace(/[~`!@#$%^&()_={}[\]:;,.<>+\/?-]/, "")
    const cidade:string = cidad.replace(/[~`!@#$%^&()_={}[\]:;,.<>+\/?-]/, "").toLowerCase()
    const ruat:string = rua.replace(/[~`!@#$%^&()_={}[\]:;,.<>+\/?-]/, "").toLowerCase()

    try {
      setLoadingCEP(true)
      const resp_via = await fetch(`https://viacep.com.br/ws/${encodeURIComponent(stcod)}/${encodeURIComponent(cidade)}/${encodeURIComponent(ruat)}/json/`)
      const res: ViaCEPTypage[] | null = await resp_via.json()
      console.log(JSON.stringify(res, null, 2));
      console.log(res?.[0]?.cep ?? "error")
      setFinalCep(String(res?.[0]?.cep ?? "error").replace("-", ""))
    } catch (err: any) {
      setErrorMsg(`ViaAPI: ${String(err)}`)
      console.error("Erro ao buscar na API ViaCEP: ", String(err))
    } finally {
      setLoadingCEP(false)
    }
  }

  const handleClipboardCopy = async (txt: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(txt)
      console.log("Foi copiado com sucesso ao copy paste do usuario o texto ", txt)
      setCopyClip("Copiado!")
    } catch (err:any){
      console.error("Erro ao copiar o CEP pro ctrl c: ", String(err))
    }
  }

  useEffect(()=>{
    if (!navigator.geolocation){
      handleGeoCoding()
    }
  }, [])

  const handleClearInputs = () => {
    setFinalCep("")
    setCidad("")
    setStateCode("")
    setRua("")
    setTriggerCoords(false)
    setLat(0)
    setLon(0)
  }
  return(
    <>
      <div className="main-view">
        <div className='main-view-flexbox'>
          <div className="main-view-container">
            <h3>Busca de CEP por Endereço</h3>
            
            {finalCep!=""?
            finalCep!="error"?
            <>
              <div className='cep-show'>
                <span style={{fontSize:'20px',fontWeight:'700'}}>CEP: {finalCep}</span>
                <button onClick={()=>handleClipboardCopy(finalCep)}>{copyClip}</button>
              </div>
              <button onClick={handleClearInputs}>Nova Busca</button>
            </>
            :
            <> {/* HANDLER DE REQUISIÇAO 400 API VIACEP */}
              <b>Este endereço está incorreto! (Erro 400)</b>
              <button onClick={handleClearInputs}>Voltar</button>
            </>
            :
            <> {/* CODIGO MOSTRADO POR PADRAO - PREENCHIMENTO */}
              {!loadingGeo?<button onClick={handleGeoCoding}>Preencher Automaticamente</button>:<b>Aguarde...</b>}
              <input type="text" placeholder='País' value={country} disabled />
              <div className='inputs-city'>
                <input type="text" placeholder='Cidade' value={cidad} onChange={(e)=>setCidad(e.target.value)} disabled={triggerCoords} />
                <input type="text" placeholder='UF (Ex.: SP)' maxLength={2} value={stateCode} onChange={(e)=>setStateCode(e.target.value.toUpperCase())} disabled={triggerCoords} />
              </div>
              <input type="text" placeholder='Rua' value={rua} onChange={(e)=>setRua(e.target.value)} required />
              {loadingCEP?<b>Aguarde...</b>:invalidCountry?<p>Esse serviço funciona apenas no Brasil</p>:<button onClick={handleCEPFetch}>Buscar</button>}
              {errorMsg!=""?<small style={{color:"red", width:'80%', fontSize:'12px'}}>{errorMsg}</small>:null}
            </>
            }
          </div>

          {triggerCoords?
            <div className="map-view-container">
              <h3>Localização Aproximada:</h3>
              <MapContainer center={[lat, lon]} zoom={15} style={{ height: '15rem', width: '15rem', pointerEvents:'none', borderRadius:'16px', boxShadow:'0 1px 8px #000' }} >
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </MapContainer>
            </div>
            :null
          }
        </div>
                
        <div className='about-view'>
          <p>Criado por <a href='https://www.github.com/ryanhenrqq/' target='_blank'>Ryan Henrique</a></p>
          <small>Dados publicos fornecidos pela ViaCEP.</small>
        </div>
      </div>
      {/* Ideia : adicionar busca reversa de endereço por cep */}
    </>
  )
}

export default App
