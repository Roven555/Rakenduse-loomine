import { useState } from 'react' 
import './App.css' 

function App() {
  const [activeGenre, setActiveGenre] = useState('All'); 

  const genres = ["All", "Action", "Sci-Fi", "Thriller", "Horror", "Fantasy", "Adventure", "Mystery", "Animation", "Western", "Documentary"];

  return (
    <div className="App"> 
      <nav className="navbar">
        <div className="logo">🎬 MovieRate</div>
        <div className="nav-links">
          <a href="#" className="nav-item active">Home</a>
          <a href="#">Trending</a>
          <a href="#">Profile</a>
        </div>
      </nav>

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