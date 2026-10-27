import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { lat, lon } = req.query;
  const apiKey = process.env.REVERSE_GEO_API_KEY;

if (!lat && !lon) {
    console.log(`GEOCODING.TS: Não há nenhum valor nas variáveis de cidade, latitude e longitude, abortando consulta.`)
    return res.status(400).json({ error: 'Entada inválida ou não informada' });
}
  try {
    let apiUrl = ''
    if (lat && lon) {
        apiUrl = `https://api-bdc.net/data/reverse-geocode?latitude=${lat}&longitude=${lon}&localityLanguage=pt&key=${apiKey}`
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(`GEOCODING.TS: Busca bem-sucedida.`)
    return res.status(200).json(data);
  } catch (error) {
    console.log(`GEOCODING.TS: Houve um erro na consulta da API! Verifique Logs.`)
    return res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
}