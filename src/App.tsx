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
  const [state, setState] = useState<string>("")
  const [stateCode, setStateCode] = useState<string>("")
  const [cidad, setCidad] = useState<string>("")
  const [rua, setRua]=useState<string>("")
  const [finalCep, setFinalCep]=useState<string>("")
  const [loadingCEP, setLoadingCEP]=useState<boolean>(false)
  const [loadingGeo, setLoadingGeo]=useState<boolean>(false)
  const [invalidCountry, setInvalidCountry]=useState<boolean>(false)
  const [errorMsg, setErrorMsg]=useState<string>("")

  const [copyClip, setCopyClip]=useState<string>("Copiar")

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
      setErrorMsg(`GeoCod: ${String(err)}`)
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
      if (state==""&&cidad==""&&rua==""){
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
    handleGeoCoding()
  }, [])
  return(
    <>
      <div className="main-view">
        <div className="main-view-container">
          <h3>Busca de CEP por Endereço</h3>
          {!loadingGeo?<button onClick={handleGeoCoding}>Preencher Automaticamente</button>:<b>Aguarde...</b>}
          <input type="text" placeholder='País' value={country} disabled />
          <input type="text" placeholder='UF (Ex.: SP)' maxlength={2} value={stateCode} onChange={(e)=>setStateCode(e.target.value.toUpperCase())} />
          <input type="text" placeholder='Cidade' value={cidad} onChange={(e)=>setCidad(e.target.value)} />
          <input type="text" placeholder='Rua' value={rua} onChange={(e)=>setRua(e.target.value)} required />
          {loadingCEP?<b>Aguarde...</b>:<button onClick={handleCEPFetch}>Buscar</button>}
          {finalCep!=""?
          finalCep!="error"?
          <div className='cep-show'>
            <span>CEP: {finalCep}</span>
            <button onClick={()=>handleClipboardCopy(finalCep)}>{copyClip}</button>
          </div>
          :<b>Este endereço está incorreto! (Erro 400)</b>
          :null}
          {invalidCountry?<p>Esse serviço funciona apenas no Brasil</p>:null}
          {errorMsg!=""?<small style={{color:"red"}}>{errorMsg}</small>:null}
        </div>
      </div>
      {/* Ideia : adicionar busca reversa de endereço por cep */}
    </>
  )
}

export default App
