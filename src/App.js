import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Details from './components/Details';
import Player from './components/Player';
import AnimeSearch from './components/AnimeSearch';
import MangaReader from './components/MangaReader';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/details" element={<Details />} />
      <Route path='/play' element={<Player/>}/>
      <Route path="/anime/:searchQuery" element={<AnimeSearch />} />
      <Route path="/anime" element={<AnimeSearch />} />
      <Route path="/manga/:anilistId/:volume" element={<MangaReader />} />
      <Route path="/manga/:anilistId/:volume" element={<MangaReader />} />
      <Route path="/manga/:anilistId/:volume/:searchQuery" element={<MangaReader />} />
    </Routes>
  </Router>
);

export default App;
