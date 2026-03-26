import { useState, useContext } from "react";
import { MovieProvider } from "./contexts/MovieProvider";
import { MovieDataProvider } from "./contexts/MovieDataProvider";
import { MovieDataContext } from "./contexts/movieDataContext";
import Header from "./components/Header";
import Home from "./components/Home";
import MovieDetail from "./components/MovieDetail";
import Profile from "./components/Profile";
import ActorProfile from "./components/ActorProfile";
import ActorsList from "./components/ActorsList";
import "./styles/global.css";

function AppContent() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const { getMovieById } = useContext(MovieDataContext);

  const selectedMovie = getMovieById(selectedMovieId);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedMovieId(null);
    setSelectedActor(null);
  };

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
    setCurrentView("detail");
    setSelectedActor(null);
  };

  const handleBackFromDetail = () => {
    setCurrentView("home");
    setSelectedMovieId(null);
  };

  const handleActorSelect = (actorId, actorName) => {
    setSelectedActor({ id: actorId, name: actorName });
    setCurrentView("actor");
  };

  const handleBackFromActor = () => {
    if (selectedMovieId) {
      setCurrentView("detail");
    } else {
      setCurrentView("actors");
    }
    setSelectedActor(null);
  };

  return (
    <>
      <Header currentView={currentView} onViewChange={handleViewChange} />
      <main>
        {currentView === "home" && <Home onMovieSelect={handleMovieSelect} />}
        {currentView === "detail" && (
          <MovieDetail
            movie={selectedMovie}
            onBack={handleBackFromDetail}
            onActorSelect={handleActorSelect}
          />
        )}
        {currentView === "profile" && (
          <Profile onMovieSelect={handleMovieSelect} />
        )}
        {currentView === "actors" && (
          <ActorsList onActorSelect={handleActorSelect} />
        )}
        {currentView === "actor" && selectedActor && (
          <ActorProfile
            actorId={selectedActor.id}
            actorName={selectedActor.name}
            onBack={handleBackFromActor}
            onMovieSelect={handleMovieSelect}
          />
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
