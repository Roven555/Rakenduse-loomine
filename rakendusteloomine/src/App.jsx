import { useState, useContext } from "react";
import { MovieProvider } from "./contexts/MovieProvider";
import { MovieDataProvider } from "./contexts/MovieDataProvider";
import { MovieDataContext } from "./contexts/movieDataContext";
import Header from "./components/Header";
import Home from "./components/Home";
import MovieDetail from "./components/MovieDetail";
import Profile from "./components/Profile";
import "./styles/global.css";

function AppContent() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const { getMovieById } = useContext(MovieDataContext);

  const selectedMovie = getMovieById(selectedMovieId);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedMovieId(null);
  };

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
    setCurrentView("detail");
  };

  const handleBackFromDetail = () => {
    setCurrentView("home");
    setSelectedMovieId(null);
  };

  return (
    <>
      <Header currentView={currentView} onViewChange={handleViewChange} />
      <main>
        {currentView === "home" && <Home onMovieSelect={handleMovieSelect} />}
        {currentView === "detail" && (
          <MovieDetail movie={selectedMovie} onBack={handleBackFromDetail} />
        )}
        {currentView === "profile" && (
          <Profile onMovieSelect={handleMovieSelect} />
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <MovieProvider>
      <MovieDataProvider>
        <AppContent />
      </MovieDataProvider>
    </MovieProvider>
  );
}

export default App;
