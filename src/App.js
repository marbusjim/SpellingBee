import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Play, ArrowRight, Star } from 'lucide-react';
import './output.css'

const SpellingBeeGame = () => {
  const staticWordList =
    [
      'Bee',
      'Egg',
      'Eye',
      'Ice',
      'Jet',
      'Joy',
      'Key',
      'Kit',
      'Owl',
      'Web',
      'Zoo',
      'Oak',
      'Pet',
      'Rib',
      'Rub',
      'Run',
      'Sit',
      'Toy',
      'Use',
      'War',
      'Zip',
      'Ball',
      'Bake',
      'Best',
      'Bite',
      'Bold',
      'Book',
      'Boot',
      'Candy',
      'Clap',
      'Clay',
      'Clip',
      'Clue',
      'Coat',
      'Cold',
      'Come',
      'Cool',
      'Corn',
      'Cost',
      'Crab',
      'Cube',
      'Cute',
      'Dark',
      'Deer',
      'Dish',
      'Doll',
      'Draw',
      'Duck',
      'Exit',
      'Face',
      'Fall',
      'Farm',
      'Fast',
      'Find',
      'Fire',
      'Fish',
      'Flag',
      'Flip',
      'Flow',
      'Food',
      'Foot',
      'Fork',
      'Frog',
      'Gift',
      'Give',
      'Glad',
      'Glue',
      'Gold',
      'Good',
      'Hand',
      'Hear',
      'Help',
      'Hill',
      'Jump',
      'Kind',
      'King',
      'Knee',
      'Know',
      'Lamb',
      'Land',
      'Last',
      'Left',
      'Line',
      'Lips',
      'List',
      'Live',
      'Leaf',
      'Look',
      'Make',
      'Moon',
      'Nest',
      'Next',
      'Nice',
      'Play',
      'Rain',
      'Read',
      'Ring',
      'Rope',
      'Rule',
      'Salt',
      'Sand',
      'Sing',
      'Skin',
      'Skip',
      'Slow',
      'Snow',
      'Soft',
      'Song',
      'Star',
      'Stop',
      'Swim',
      'Talk',
      'Tall',
      'Team',
      'Than',
      'That',
      'Then',
      'This',
      'Time',
      'Tree',
      'Ruler',
      'Wait',
      'Walk',
      'Wall',
      'Want',
      'Warm',
      'Wash',
      'Wave',
      'What',
      'When',
      'Will',
      'Wind',
      'Work',
      'Zero',
      'Apple',
      'Climb',
      'Color',
      'Fruit',
      'Green',
      'Heart',
      'Piano',
      'River',
      'Spell',
      'Start',
      'Sugar',
      'Table',
      'Tower',
      'Train',
      'Alien',
      'Crazy'
    ];

  const staticTranslateWordList =
    [
      'Abeja',
      'Huevo',
      'Ojo',
      'Hielo',
      'Chorro',
      'Alegría',
      'Llave',
      'Kit',
      'Búho',
      'Telaraña',
      'Zoológico',
      'Roble',
      'Mascota',
      'Costilla',
      'Frotar',
      'Correr',
      'Sentarse',
      'Juguete',
      'Usar',
      'Guerra',
      'Cremallera',
      'Pelota',
      'Hornear',
      'Mejor',
      'Mordedura',
      'Atrevido',
      'Libro',
      'Bota',
      'Caramelo',
      'Aplausos',
      'Arcilla',
      'Clip',
      'Pista',
      'Abrigo',
      'Frío',
      'Venir',
      'Fresco',
      'Maíz',
      'Costo',
      'Cangrejo',
      'Cubo',
      'Lindo',
      'Oscuro',
      'Ciervo',
      'Plato',
      'Muñeca',
      'Dibujar',
      'Pato',
      'Salir',
      'Cara',
      'Caída',
      'Granja',
      'Rápido',
      'Encontrar',
      'Fuego',
      'Pez',
      'Bandera',
      'Voltear',
      'Fluir',
      'Comida',
      'Pie',
      'Tenedor',
      'Rana',
      'Regalo',
      'Dar',
      'Alegre',
      'Pegamento',
      'Oro',
      'Bueno',
      'Mano',
      'Escuchar',
      'Ayuda',
      'Colina',
      'Saltar',
      'Amable',
      'Rey',
      'Rodilla',
      'Saber',
      'Lam b',
      'Tierra',
      'Último',
      'Izquierda',
      'Línea',
      'Labios',
      'Lista',
      'Vivo',
      'Hoja',
      'Mirar',
      'Hacer',
      'Luna',
      'Nido',
      'Siguiente',
      'Bonito',
      'Jugar',
      'Lluvia',
      'Leer',
      'Anillo',
      'Cuerda',
      'Regla',
      'Sal',
      'Arena',
      'Cantar',
      'Piel',
      'Saltar',
      'Lento',
      'Nieve',
      'Suave',
      'Canción',
      'Estrella',
      'Detenerse',
      'Nadar',
      'Hablar',
      'Alto',
      'Equipo',
      'Que',
      'Eso',
      'Entonces',
      'Esta',
      'Vez',
      'Árbol',
      'Regla',
      'Esperar',
      'Caminar',
      'Muro',
      'Querer',
      'Calentar',
      'Lavar',
      'Ola',
      'Qué',
      'Cuándo',
      'Volverá',
      'Viento',
      'Trabajo',
      'Cero',
      'Manzana',
      'Escalar',
      'Color',
      'Fruta',
      'Verde',
      'Corazón',
      'Piano',
      'Río',
      'Hechizo',
      'Comienzo',
      'Azúcar',
      'Mesa',
      'Torre',
      'Tren',
      'Extraterrestre',
      'Loco'
    ];


  const [wordList, setWordList] = useState(staticWordList);
  const [wordTranslateList, setWordTranslateList] = useState(staticTranslateWordList);
  const [currentWord, setCurrentWord] = useState(null);
  const [currentTranslateWord, setCurrentTraslateWord] = useState(null);
  const [score, setScore] = useState(0);
  const [wordImage, setWordImage] = useState('');

  // Búsqueda de imagen con Pixabay API
  const fetchWordImage = async (word) => {
    try {
      const response = await fetch(
        `https://pixabay.com/api/?key=47198312-f39a48194de63b888ddab28cb&q=${encodeURIComponent(word)}&image_type=vector&per_page=3`
      );
      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        const randomImage = data.hits[Math.floor(Math.random() * data.hits.length)];
        setWordImage(randomImage.webformatURL);
      } else {
        setWordImage(`https://via.placeholder.com/300?text=${word}`);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setWordImage(`https://via.placeholder.com/300?text=${word}`);
    }
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
  const selectRandomWord = (words, translateWords) => {
    if (words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      const selectedWord = words[randomIndex];
      const selectedTranslateWord = translateWords[randomIndex];
      setCurrentWord(selectedWord);
      setCurrentTraslateWord(selectedTranslateWord);
      fetchWordImage(selectedWord);
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
  const goToNextWord = () => {
    const remainingWords = wordList.filter(word => word !== currentWord);
    const remainingTranslateWords = wordTranslateList.filter(word => word !== currentTranslateWord);
    if (remainingWords.length > 0 && remainingTranslateWords.length > 0) {
      selectRandomWord(remainingWords, remainingTranslateWords);
      setScore(prevScore => prevScore + 1);
    } else {
      alert("¡Has completado todas las palabras!");
    }
  };

  const startGame = () => {
    selectRandomWord(wordList, wordTranslateList);
  }


  return (
    <Card
      className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #FFD54F, #FF7043)',
        border: '4px solid #FFFFFF',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}
    >
      <CardHeader className="text-center">
        <CardTitle
          className="text-3xl font-bold text-white"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}
        >
          🐝 Spelling Bee Kids 🐝
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        <div className="flex justify-center items-center mb-5 space-x-2">
                <Button
                  onClick={startGame}
                  variant="outline"
                  className="bg-white/30 text-white hover:bg-white/50"
                > Iniciar Juego
                  </Button>
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
              {wordImage && (
                <div className="relative">
                  <img
                    src={wordImage}
                    alt={currentWord}
                    className="mx-auto mb-4 max-h-64 object-cover rounded-xl border-4 border-white"
                    style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.2)' }}
                  />
                  <div
                    className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full flex items-center"
                  >
                    <Star className="mr-1 fill-current text-orange-600" />
                    {score}
                  </div>
                </div>
              )}

              {/* Botones de audio y siguiente */}
              <div className="flex justify-center items-center mb-5 space-x-2">
                <Button
                  onClick={playWordPronunciation}
                  variant="outline"
                  className="bg-white/30 text-white hover:bg-white/50"
                >
                  <Play className="mr-2 h-4 w-4 fill-white" />
                  Escuchar Palabra
                </Button>
                <Button
                  onClick={goToNextWord}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Palabra letra por letra */}
              <div className="flex justify-center mb-4">
                {currentWord.split('').map((letter, index) => (
                  <span
                    key={index}
                    onClick={() => speakLetter(letter)}
                    className="mx-1 px-3 py-2 text-xl bg-white/30 text-white rounded-lg cursor-pointer hover:bg-white/50 transition-all"
                    style={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
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