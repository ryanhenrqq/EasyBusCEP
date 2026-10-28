import './header.css'

import locImg from '../../assets/loc.png'

export function Header() {
  return(
    <>
      <header>
        <div className="left-side-header">
          <img src={locImg} alt="Icone de Localização" className='search-img' />
          <div className="title-flexbox">
            <h1>EasyBusCEP</h1>
            <b>Busque seu CEP facilmente!</b>
          </div>
          
        </div>
        <div className="right-side-header">
          <div>Versão de Teste</div>
        </div>
      </header>
    </>
  )
}