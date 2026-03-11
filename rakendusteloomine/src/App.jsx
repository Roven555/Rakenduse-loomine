import { useState } from 'react' 
import './App.css'

const Home = () => <h2>Home page</h2>;
const Trending = () => <h2>Trending page</h2>;
const Profile = () => <h2>Profile page</h2>;

function App() {
  const [activeGenre, setActiveGenre] = useState('All'); 

  const genres = ["All", "Action", "Sci-Fi", "Thriller", "Horror", "Fantasy", "Adventure", "Mystery", "Animation", "Western", "Documentary"];

  return (
    <div className="App"> 
    <BrowerRouter>
      <nav className="navbar">
        <div className="logo">🎬 MovieRate</div>
        <div className="nav-links">
          <Link to="/" className="nav-item active">Home</Link>
          <Link to="/trending" className="nav-item">Trending</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowerRouter>

      <main className="container">
        <h1>Avasta filme</h1>
        <p>Otsi oma järgmine lemmik film</p>

        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search movies..." />
        </div>

        {}
        <div className="filters">
          {genres.map((genre) => (
            <button 
              key={genre} 
              className={`filter-btn ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre)} // Sündmuste töötlus
            >
              {genre}
            </button>
          ))}
        </div>

        <section className="movie-grid">
           {}
        </section>
      </main>
    </div>
  )
}

export default App