import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Play, ArrowRight, Star } from 'lucide-react';
import './output.css'

// Precarga ligera de referencias: mapeamos nombres (en minúsculas) a la ruta compilada usando require.context.
// Esto evita tener que mover los archivos a public y funciona con los nombres en minúsculas existentes.
const importAll = (r) => {
  const images = {};
  r.keys().forEach((key) => {
    const cleanKey = key.replace('./', '').replace(/\.(png|jpg|jpeg)$/i, '');
    images[cleanKey.toLowerCase()] = r(key);
  });
  return images;
};
// Carga todas las .png dentro de src/images (sin subdirectorios)
const localImages = importAll(require.context('./images', false, /\.(png|jpg|jpeg)$/i));

const SpellingBeeGame = () => {
  const [wordList, setWordList] = useState([]);
  const [translationsMap, setTranslationsMap] = useState({});
  const [currentWord, setCurrentWord] = useState(null);
  const [currentTranslateWord, setCurrentTraslateWord] = useState(null);
  const [score, setScore] = useState(0);
  const [wordImage, setWordImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageRendered, setImageRendered] = useState(false);
  const [pendingSpeak, setPendingSpeak] = useState(false);
  const [availableLists, setAvailableLists] = useState([]);
  const [selectedListFile, setSelectedListFile] = useState('words.csv');
  const [loadingList, setLoadingList] = useState(false);

  // Función para traducir palabra usando Google Translate API (gratuita) con traducciones más simples para niños
  const translateWord = async (word) => {
    // Ahora usamos el mapa cargado desde CSV. Fallback a la misma palabra si falta.
    return translationsMap[word] || word;
  };

  // Parse CSV / SVC generically
  const parseDelimited = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return { words: [], map: {} };
    const header = lines[0].toLowerCase().split(',');
    const wordIdx = header.indexOf('word');
    const transIdx = header.indexOf('translation');
    if (wordIdx === -1 || transIdx === -1) {
      console.error('Encabezados inválidos, se esperaba word,translation');
      return { words: [], map: {} };
    }
    const map = {};
    const words = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const parts = line.split(',');
      const w = (parts[wordIdx] || '').trim();
      const t = (parts[transIdx] || '').trim();
      if (!w) continue;
      words.push(w);
      map[w] = t || w;
    }
    return { words, map };
  };

  // Cargar Excel (.xlsx) con columnas: word/palabra, translation/traduccion
  const loadWordsFromExcel = async (file) => {
    try {
      const res = await fetch((process.env.PUBLIC_URL || '') + '/files/' + file);
      if (!res.ok) return false;
      const ab = await res.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows || rows.length === 0) return false;
      const headerRow = rows[0].map((h) => String(h || '').toLowerCase());
      // Soportar tanto inglés como español en encabezados
      const wordIdx = headerRow.findIndex((h) => h === 'word' || h === 'palabra');
      const transIdx = headerRow.findIndex((h) => h === 'translation' || h === 'traduccion' || h === 'traducción');
      if (wordIdx === -1 || transIdx === -1) {
        console.error('Encabezados no encontrados en Excel. Esperado: word/palabra, translation/traduccion');
        return false;
      }
      const map = {};
      const words = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const w = String(row[wordIdx] || '').trim();
        if (!w) continue;
        const t = String(row[transIdx] || '').trim();
        words.push(w);
        map[w] = t || w;
      }
      if (words.length > 0) {
        setTranslationsMap(map);
        setWordList(words);
        await selectRandomWord(words);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error cargando Excel:', err);
      return false;
    }
  };

  // Cargar lista según archivo seleccionado (csv/svc/xlsx)
  const loadListByFile = async (file) => {
    setLoadingList(true);
    setCurrentWord(null);
    setCurrentTraslateWord(null);
    setScore(0);
    try {
      if (file.toLowerCase().endsWith('.xlsx')) {
        const ok = await loadWordsFromExcel(file);
        if (!ok) console.error('No se pudo cargar Excel:', file);
      } else { // csv o svc
        const res = await fetch((process.env.PUBLIC_URL || '') + '/files/' + file);
        if (!res.ok) {
          console.error('Archivo no encontrado:', file);
          return;
        }
        const text = await res.text();
        const { words, map } = parseDelimited(text);
        setTranslationsMap(map);
        setWordList(words);
        if (words.length) await selectRandomWord(words);
      }
    } catch (e) {
      console.error('Error cargando lista', file, e);
    } finally {
      setLoadingList(false);
    }
  };

  // Cargar manifest.json para obtener nombres de listas
  const loadManifest = async () => {
    try {
      const res = await fetch((process.env.PUBLIC_URL || '') + '/files/manifest.json');
      if (!res.ok) {
        console.warn('manifest.json no encontrado, usando lista por defecto');
        setAvailableLists([{ file: 'words.csv', label: 'Default Words' }]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.lists)) {
        setAvailableLists(data.lists);
        // Si la lista seleccionada no está, elegir la primera
        const exists = data.lists.some(l => l.file === selectedListFile);
        if (!exists && data.lists.length) {
          setSelectedListFile(data.lists[0].file);
        }
      } else {
        setAvailableLists([{ file: 'words.csv', label: 'Default Words' }]);
      }
    } catch (e) {
      console.error('Error cargando manifest:', e);
      setAvailableLists([{ file: 'words.csv', label: 'Default Words' }]);
    }
  };

  // Búsqueda de imagen con fuentes más relevantes y libres (Wikipedia + Openverse)
  const fetchWordImage = async (word) => {
    setImageRendered(false);
    setImageLoading(true);
    try {
      const key = word.toLowerCase();
      const candidate = localImages[key];
      if (candidate) {
        setWordImage(candidate);
        return;
      }

      // Fallback 1: Wikimedia Commons (archivos "File:" con miniatura)
      const fetchFromCommons = async (q) => {
        try {
          const search = `${q} cartoon clipart illustration kid`;
          const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrlimit=1&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=512&format=json&origin=*`;
          const res = await fetch(url);
          const data = await res.json();
          const pages = data?.query?.pages;
          if (pages) {
            const first = Object.values(pages)[0];
            const info = first?.imageinfo?.[0];
            if (info?.thumburl) return info.thumburl;
            if (info?.url) return info.url;
          }
          return null;
        } catch {
          return null;
        }
      };

      // Fallback 2: Wikipedia (buscar miniatura u original)
      const fetchFromWikipedia = async (q) => {
        try {
          const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=1&format=json&origin=*`);
          const searchData = await searchRes.json();
          const title = searchData?.query?.search?.[0]?.title || q;
          const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`);
          const summary = await summaryRes.json();
          if (summary?.thumbnail?.source) return summary.thumbnail.source;
          if (summary?.originalimage?.source) return summary.originalimage.source;
          return null;
        } catch {
          return null;
        }
      };

      // Fallback 3: Openverse (Creative Commons, sin contenido maduro)
      const fetchFromOpenverse = async (q) => {
        try {
          const res = await fetch(`https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(q + ' cartoon illustration')}&page_size=10&mature=false&license_type=all`);
          const data = await res.json();
          const results = data?.results?.filter(r => r?.mature === false) || [];
          if (results.length > 0) {
            const choice = results.find(r => r?.thumbnail) || results[0];
            return choice?.thumbnail || choice?.url || null;
          }
          return null;
        } catch {
          return null;
        }
      };

      let url = await fetchFromCommons(word);
      if (!url) url = await fetchFromWikipedia(word);
      if (!url) url = await fetchFromOpenverse(word);
      if (!url) url = generatePlaceholder(word);
      setWordImage(url);
    } catch (e) {
      console.warn('Error resolviendo imagen local, usando placeholder:', word, e);
      setWordImage(generatePlaceholder(word));
    } finally {
      setImageLoading(false);
    }
  };

  // Generar placeholder ilustrativo con canvas
  const generatePlaceholder = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    // Fondo degradado
    const grad = ctx.createLinearGradient(0,0,400,300);
    grad.addColorStop(0,'#FFD54F');
    grad.addColorStop(1,'#FF8A65');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,400,300);
    // Decoración círculos
    for (let i=0;i<12;i++) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${255 - i*10}, ${200 - i*8}, ${100 + i*12}, 0.22)`;
      ctx.arc(Math.random()*400, Math.random()*300, 18 + Math.random()*22, 0, Math.PI*2);
      ctx.fill();
    }
    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const display = text.length > 10 ? text.slice(0,10)+'…' : text;
    ctx.fillText(display, 200, 150);
    return canvas.toDataURL('image/png');
  };

  // Placeholder específico para colores
  const generateColorPlaceholder = (label, hex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,400,300);
    // círculo de color
    ctx.beginPath();
    ctx.fillStyle = hex;
    ctx.arc(200, 140, 80, 0, Math.PI*2);
    ctx.fill();
    // borde bonito
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.stroke();
    // texto
    ctx.fillStyle = '#333';
    ctx.font = 'bold 44px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 200, 260);
    return canvas.toDataURL('image/png');
  };

  // Placeholder simple para formas/objetos comunes
  const generateShapePlaceholder = (label) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    // fondo
    const grad = ctx.createLinearGradient(0,0,400,300);
    grad.addColorStop(0,'#E1F5FE');
    grad.addColorStop(1,'#FFECB3');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,400,300);
    // dibujar figura
    ctx.fillStyle = '#FF7043';
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 6;
    if (label === 'Star') {
      const cx=200, cy=140, outer=80, inner=35;
      ctx.beginPath();
      for (let i=0;i<10;i++){
        const angle = Math.PI/5 * i - Math.PI/2;
        const r = i%2===0 ? outer : inner;
        const x = cx + r*Math.cos(angle);
        const y = cy + r*Math.sin(angle);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (label === 'Heart') {
      ctx.beginPath();
      ctx.moveTo(200, 210);
      ctx.bezierCurveTo(120,140,120,80,180,90);
      ctx.bezierCurveTo(200,95,215,110,200,130);
      ctx.bezierCurveTo(185,110,200,95,220,90);
      ctx.bezierCurveTo(280,80,280,140,200,210);
      ctx.fill();
      ctx.stroke();
    } else if (label === 'Apple') {
      ctx.beginPath();
      ctx.arc(175,150,50,0,Math.PI*2);
      ctx.arc(225,150,50,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      // hoja
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(210,95,18,10,Math.PI/6,0,Math.PI*2);
      ctx.fill();
    } else if (label === 'Duck' || label === 'Fish' || label === 'Boat' || label === 'Boats') {
      ctx.fillStyle = '#29B6F6';
      ctx.beginPath();
      ctx.moveTo(120,190);
      ctx.quadraticCurveTo(200,120,280,190);
      ctx.lineTo(120,190);
      ctx.fill();
      ctx.stroke();
    }
    // texto
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 42px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 200, 265);
    return canvas.toDataURL('image/png');
  };

  // // Cargar lista de palabras
  // const handleWordListUpload = (event) => {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const text = e.target.result;
  //     const words = text.split(/\r?\n/).filter(word => word.trim() !== '');
  //     setWordList(words);
  //     selectRandomWord(words);
  //   };
  //   reader.readAsText(file);
  // };

  // Seleccionar palabra aleatoria
  const selectRandomWord = async (words) => {
    if (words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const selectedWord = words[randomIndex];
      setCurrentWord(selectedWord);
      
      // Obtener traducción dinámica
      const translatedWord = await translateWord(selectedWord);
      setCurrentTraslateWord(translatedWord);
      
      await fetchWordImage(selectedWord);
    }
  };

  // Reproducir palabra completa
  const playWordPronunciation = () => {
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'en-US'; // Set the language to English (US)
      speechSynthesis.speak(utterance);
    }
  };

  // Reproducir letra al hacer click
  const speakLetter = (letter) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'en-US'; // Set the language to English (US)
      speechSynthesis.speak(utterance);
    }
  };

  // Pasar a siguiente palabra
  const goToNextWord = async () => {
    const remainingWords = wordList.filter(word => word !== currentWord);
    if (remainingWords.length > 0) {
      setWordList(remainingWords);
      setPendingSpeak(true);
      await selectRandomWord(remainingWords);
      setScore(prevScore => prevScore + 1);
    } else {
      alert("¡Has completado todas las palabras!");
    }
  };

  // Iniciar automáticamente al montar
  useEffect(() => {
    // Al montar obtener manifest y luego cargar lista seleccionada
    (async () => {
      await loadManifest();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedListFile) {
      loadListByFile(selectedListFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedListFile]);

  // Cuando se hizo click en Siguiente y la imagen ya se renderizó, reproducir la palabra
  useEffect(() => {
    if (pendingSpeak && imageRendered && currentWord) {
      playWordPronunciation();
      setPendingSpeak(false);
    }
  }, [pendingSpeak, imageRendered, currentWord]);


  return (
    <Card
      className="w-full max-w-md mx-auto rounded-2xl shadow-lg kid-card"
    >
      <CardHeader className="text-center">
        <CardTitle className="kid-title font-bold">
          🐝 Spelling Bee Kids 🐝
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de acciones simplificada */}
          <div className="action-bar">
            {/* Selector de lista de palabras */}
            <label className="kid-select-label" htmlFor="listSelect">Lista</label>
            <div className="flex justify-center mb-2">
              <select
                id="listSelect"
                className="kid-select"
                value={selectedListFile}
                onChange={(e) => setSelectedListFile(e.target.value)}
                disabled={loadingList}
              >
                {availableLists.map(l => (
                  <option key={l.file} value={l.file}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="action-row">
              <Button
                onClick={playWordPronunciation}
                variant="outline"
                className="kid-button-secondary"
                aria-label="Escuchar palabra"
                title="Escuchar palabra"
                disabled={!currentWord}
              >
                <Play className="h-4 w-4" />
                Escuchar
              </Button>
              <Button
                onClick={goToNextWord}
                className="kid-button-primary"
                aria-label="Siguiente palabra"
                title="Siguiente palabra"
                disabled={!currentWord}
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Selector de palabra específica */}
            <label className="kid-select-label" htmlFor="wordSelect">Elegir palabra</label>
            <div className="flex justify-center">
              <select
                id="wordSelect"
                className="kid-select"
                value={currentWord || ''}
                onChange={async (e) => {
                  const selected = e.target.value;
                  if (!selected) { return; }
                  setCurrentWord(selected);
                  const translated = await translateWord(selected);
                  setCurrentTraslateWord(translated);
                  fetchWordImage(selected);
                }}
              >
                <option value="" disabled>Selecciona...</option>
                {wordList.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Cargar lista de palabras */}
          {/* <input 
            type="file" 
            accept=".txt"
            onChange={handleWordListUpload}
            className="w-full bg-white/30 text-white rounded-lg p-2"
          /> */}

          {currentWord && (
            <div className="text-center">
              {/* Imagen de la palabra */}
              <div className="image-container mb-4">
                {imageLoading && (
                  <div className="animate-pulse text-white font-bold">Cargando imagen…</div>
                )}
                {!imageLoading && wordImage && (
                  <img
                    src={wordImage}
                    alt={currentWord}
                    className="mx-auto max-h-64 object-cover image-frame"
                    onLoad={() => setImageRendered(true)}
                  />
                )}
                <div className="absolute top-2 right-2 score-badge">
                  <Star className="mr-1 fill-current text-orange-600" />
                  {score}
                </div>
              </div>

              {/* Botones ya se muestran arriba en la action-bar */}

              {/* Palabra letra por letra */}
              <div className="letter-tiles mb-4">
                {currentWord.split('').map((letter, index) => (
                  <span
                    key={index}
                    onClick={() => speakLetter(letter)}
                    className={`letter-tile c${(index % 6) + 1}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>

              <div className="flex justify-center mb-6">
                <p>
                  <strong>Traducción:</strong> {currentTranslateWord}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpellingBeeGame;