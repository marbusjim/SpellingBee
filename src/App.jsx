import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Play, ArrowRight, Star } from 'lucide-react';
import './output.css'

// Precarga ligera de referencias: mapeamos nombres (en minúsculas) a la ruta compilada usando import.meta.glob.
// Esto evita tener que mover los archivos a public y funciona con los nombres en minúsculas existentes.
const imageModules = import.meta.glob('./images/*.{png,jpg,jpeg}');
const localImages = {};
for (const path in imageModules) {
  const cleanKey = path.replace('./images/', '').replace(/\.(png|jpg|jpeg)$/i, '');
  // Vite's import.meta.glob returns a function that returns the module (async)
  imageModules[path]().then((mod) => {
    localImages[cleanKey.toLowerCase()] = mod.default;
  });
}

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



  // Cargar lista desde archivo CSV usando papaparse
  const loadListByFile = async (file) => {
    setLoadingList(true);
    setCurrentWord(null);
    setCurrentTraslateWord(null);
    setScore(0);
    try {
  const res = await fetch('/files/' + file);
      if (!res.ok) {
        console.error('Archivo no encontrado:', file);
        return;
      }
      const text = await res.text();
      const parsed = Papa.parse(text, { header: true });
      const map = {};
      const words = [];
      parsed.data.forEach(row => {
        const w = (row.word || row.palabra || '').trim();
        const t = (row.translation || row.traduccion || row.traducción || '').trim();
        if (w) {
          words.push(w);
          map[w] = t || w;
        }
      });
      setTranslationsMap(map);
      setWordList(words);
      if (words.length) await selectRandomWord(words);
    } catch (e) {
      console.error('Error cargando lista', file, e);
    } finally {
      setLoadingList(false);
    }
  };

  // Cargar manifest.json para obtener nombres de listas
  const loadManifest = async () => {
    try {
      const res = await fetch('/files/manifest.json');
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
  // Búsqueda de imagen con fuentes más relevantes y libres (Wikipedia y Wikimedia Commons)
  const fetchWordImage = async (word) => {
    setImageRendered(false);
    setImageLoading(true);
    try {
      const key = word.toLowerCase();
      const candidate = localImages[key];
      if (candidate) {
        setWordImage(candidate);
      } else {
        setWordImage(generatePlaceholder(word));
      }
    } catch (e) {
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
  const playWordPronunciation = React.useCallback(() => {
    if ('speechSynthesis' in window && currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'en-US'; // Set the language to English (US)
      speechSynthesis.speak(utterance);
    }
  }, [currentWord]);

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
  }, [pendingSpeak, imageRendered, currentWord, playWordPronunciation]);


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