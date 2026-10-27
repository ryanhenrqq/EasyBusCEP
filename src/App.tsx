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

function MainView() {
  return(
    <>
      <div className="main-view">
        <div className="main-view-container">
          <h3>Busca de CEP por Endereço</h3>
          <input type="text" placeholder='País' value={"Brasil"} disabled />
          <input type="text" placeholder='Estado' />
          <input type="text" placeholder='Cidade' />
          <input type="text" placeholder='Rua' />
          <button>Buscar</button>
          <span>CEP: 10999-999</span>
        </div>
      </div>
    </>
  )
}

export default App
