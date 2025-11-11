import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Play, ArrowRight, Star } from 'lucide-react';
import './output.css'

const SpellingBeeGame = () => {
  const staticWordList =
    [
      'Away',
      'Baby',
      'Bark',
      'Bite',
      'Blue',
      'Black',
      'Bone',
      'Bowl',
      'Brown',
      'Cake',
      'Camp',
      'Chat',
      'Chair',
      'Clip',
      'Club',
      'Corn',
      'Cute',
      'Duck',
      'Easy',
      'Fair',
      'Fast',
      'Fire',
      'Fish',
      'Food',
      'Game',
      'Gift',
      'Good',
      'Ice',
      'Iron',
      'Jump',
      'List',
      'Lost',
      'Mask',
      'Move',
      'Name',
      'Neck',
      'Park',
      'Play',
      'Rain',
      'Salt',
      'Shop',
      'Shirt',
      'Sing',
      'Slow',
      'Song',
      'Star',
      'Step',
      'Store',
      'Table',
      'Task',
      'Team',
      'Time',
      'Turn',
      'Wave',
      'Warm',
      'Work',
      'Yarn',
      'Zone',
      'After',
      'Apple',
      'Bread',
      'Cloud',
      'Dance',
      'Earth',
      'Glove',
      'Heart',
      'House',
      'Lemon',
      'Mango',
      'Mouth',
      'Night',
      'Piano',
      'Pink',
      'Plant',
      'Paint',
      'Race',
      'Shoe',
      'Skirt',
      'Sugar',
      'Swing',
      'Sweet',
      'Tasty',
      'Voice',
      'White',
      'World',
      'Story',
      'Sleep',
      'Shape',
      'Smile',
      'Crown',
      'Kite',
      'Label',
      'Peach',
      'Vowel',
      'Brave',
      'Candy',
      'Clear',
      'Dream',
      'Knees',
      'Lunar',
      'March',
      'Power',
      'Rocks',
      'Vocal',
      'Word',
      'Yellow',
      'Zebra',
      'Boats',
      'Mine',
      'Nice',
      'Push',
      'Water',
      'blank',
      'frost',
      'print',
      'stamp',
      'trust',
      'Alert',
      'Chill',
      'Crack',
      'Dive',
      'Dust',
      'Flash',
      'Hint',
      'Hope',
      'Lamp',
      'Melt',
      'Nest',
      'Shut',
      'Slice',
      'Spin',
      'Tail',
      'Tear',
      'April',
      'June',
      'July'
    ];

  const [wordList, setWordList] = useState(staticWordList);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentTranslateWord, setCurrentTraslateWord] = useState(null);
  const [score, setScore] = useState(0);
  const [wordImage, setWordImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageRendered, setImageRendered] = useState(false);
  const [pendingSpeak, setPendingSpeak] = useState(false);

  // Función para traducir palabra usando Google Translate API (gratuita) con traducciones más simples para niños
  const translateWord = async (word) => {
    try {
      // Primero intentamos con un diccionario simple para niños
      const simpleTranslations = {
        'Away': 'Lejos',
        'Baby': 'Bebé',
        'Bark': 'Ladrar',
        'Bite': 'Morder',
        'Blue': 'Azul',
        'Black': 'Negro',
        'Bone': 'Hueso',
        'Bowl': 'Tazón',
        'Brown': 'Marrón',
        'Cake': 'Pastel',
        'Camp': 'Campamento',
        'Chat': 'Charlar',
        'Chair': 'Silla',
        'Clip': 'Clip',
        'Club': 'Club',
        'Corn': 'Maíz',
        'Cute': 'Lindo',
        'Duck': 'Pato',
        'Easy': 'Fácil',
        'Fair': 'Justo',
        'Fast': 'Rápido',
        'Fire': 'Fuego',
        'Fish': 'Pez',
        'Food': 'Comida',
        'Game': 'Juego',
        'Gift': 'Regalo',
        'Good': 'Bueno',
        'Ice': 'Hielo',
        'Iron': 'Plancha',
        'Jump': 'Saltar',
        'List': 'Lista',
        'Lost': 'Perdido',
        'Mask': 'Máscara',
        'Move': 'Mover',
        'Name': 'Nombre',
        'Neck': 'Cuello',
        'Park': 'Parque',
        'Play': 'Jugar',
        'Rain': 'Lluvia',
        'Salt': 'Sal',
        'Shop': 'Tienda',
        'Shirt': 'Camisa',
        'Sing': 'Cantar',
        'Slow': 'Lento',
        'Song': 'Canción',
        'Star': 'Estrella',
        'Step': 'Paso',
        'Store': 'Tienda',
        'Table': 'Mesa',
        'Task': 'Tarea',
        'Team': 'Equipo',
        'Time': 'Tiempo',
        'Turn': 'Girar',
        'Wave': 'Ola',
        'Warm': 'Cálido',
        'Work': 'Trabajo',
        'Yarn': 'Hilo',
        'Zone': 'Zona',
        'After': 'Después',
        'Apple': 'Manzana',
        'Bread': 'Pan',
        'Cloud': 'Nube',
        'Dance': 'Bailar',
        'Earth': 'Tierra',
        'Glove': 'Guante',
        'Heart': 'Corazón',
        'House': 'Casa',
        'Lemon': 'Limón',
        'Mango': 'Mango',
        'Mouth': 'Boca',
        'Night': 'Noche',
        'Piano': 'Piano',
        'Pink': 'Rosa',
        'Plant': 'Planta',
        'Paint': 'Pintura',
        'Race': 'Carrera',
        'Shoe': 'Zapato',
        'Skirt': 'Falda',
        'Sugar': 'Azúcar',
        'Swing': 'Columpio',
        'Sweet': 'Dulce',
        'Tasty': 'Sabroso',
        'Voice': 'Voz',
        'White': 'Blanco',
        'World': 'Mundo',
        'Story': 'Historia',
        'Sleep': 'Dormir',
        'Shape': 'Forma',
        'Smile': 'Sonrisa',
        'Crown': 'Corona',
        'Kite': 'Cometa',
        'Label': 'Etiqueta',
        'Peach': 'Durazno',
        'Vowel': 'Vocal',
        'Brave': 'Valiente',
        'Candy': 'Dulce',
        'Clear': 'Claro',
        'Dream': 'Sueño',
        'Knees': 'Rodillas',
        'Lunar': 'Lunar',
        'March': 'Marzo',
        'Power': 'Poder',
        'Rocks': 'Rocas',
        'Vocal': 'Vocal',
        'Word': 'Palabra',
        'Yellow': 'Amarillo',
        'Zebra': 'Cebra',
        'Boats': 'Barcos',
        'Mine': 'Mío',
        'Nice': 'Bonito',
        'Push': 'Empujar',
        'Water': 'Agua',
        'blank': 'En blanco',
        'frost': 'Escarcha',
        'print': 'Imprimir',
        'stamp': 'Sello',
        'trust': 'Confianza',
        'Alert': 'Alerta',
        'Chill': 'Frío',
        'Crack': 'Grieta',
        'Dive': 'Bucear',
        'Dust': 'Polvo',
        'Flash': 'Flash',
        'Hint': 'Pista',
        'Hope': 'Esperanza',
        'Lamp': 'Lámpara',
        'Melt': 'Derretir',
        'Nest': 'Nido',
        'Shut': 'Cerrar',
        'Slice': 'Rebanada',
        'Spin': 'Girar',
        'Tail': 'Cola',
        'Tear': 'Lágrima',
        'April': 'Abril',
        'June': 'Junio',
        'July': 'Julio'
      };

      // Si tenemos una traducción simple para niños, la usamos
      if (simpleTranslations[word]) {
        return simpleTranslations[word];
      }

      // Si no, intentamos con Google Translate API gratuita
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(word)}`
      );
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      } else {
        // Fallback: retornar la palabra original si no se puede traducir
        return word;
      }
    } catch (error) {
      console.error("Error translating word:", error);
      return word; // Fallback
    }
  };

  // Búsqueda de imagen con fuentes más relevantes y libres (Wikipedia + Openverse)
  const fetchWordImage = async (word) => {
    setImageRendered(false);
    setImageLoading(true);
    // 0) Manejo especial para colores y formas simples
    const colorMap = {
      'Blue': '#42A5F5',
      'Black': '#333333',
      'Pink': '#FF80AB',
      'White': '#FFFFFF',
      'Yellow': '#FFEB3B',
      'Brown': '#8D6E63',
    };
    const shapeWords = ['Star', 'Heart', 'Apple', 'Duck', 'Fish', 'Boat', 'Boats'];
    if (colorMap[word]) {
      setWordImage(generateColorPlaceholder(word, colorMap[word]));
      setImageLoading(false);
      return;
    }
    if (shapeWords.includes(word)) {
      setWordImage(generateShapePlaceholder(word));
      setImageLoading(false);
      return;
    }
    // 1) Intento con Wikipedia (muy relevante para sustantivos comunes)
    const fetchFromWikipedia = async (q) => {
      try {
        // Buscar el mejor título
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=1&format=json&origin=*`);
        const searchData = await searchRes.json();
        const title = searchData?.query?.search?.[0]?.title || q;

        // Obtener resumen con miniatura
        const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`);
        const summary = await summaryRes.json();
        if (summary?.thumbnail?.source) return summary.thumbnail.source;
        if (summary?.originalimage?.source) return summary.originalimage.source;
        return null;
      } catch {
        return null;
      }
    };

    // 2) Intento con Openverse (Creative Commons, con filtro de contenido maduro)
    const fetchFromOpenverse = async (q) => {
      try {
        const res = await fetch(`https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(q + ' cartoon illustration')}&page_size=10&mature=false&license_type=all`);
        const data = await res.json();
        const results = data?.results?.filter(r => r?.mature === false) || [];
        if (results.length > 0) {
          // Preferir miniatura si existe
          const choice = results.find(r => r?.thumbnail) || results[0];
          return choice?.thumbnail || choice?.url || null;
        }
        return null;
      } catch {
        return null;
      }
    };

    try {
      let url = await fetchFromWikipedia(word);
      if (!url) url = await fetchFromOpenverse(word);
      if (!url) url = generatePlaceholder(word);
      setWordImage(url);
    } catch (error) {
      console.error('Error fetching image:', error);
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
    if (!currentWord) {
      selectRandomWord(wordList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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