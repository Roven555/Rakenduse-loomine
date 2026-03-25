# CineRate - React Movie Catalog Application

A modern, high-fidelity React application for browsing, rating, and managing movies. Built with React 19, Vite, and CSS Modules.

## 🎬 Features Implemented

### ✅ All Technical Requirements

- **useState & Event Handling**: Used for managing search queries, active categories, and handling all button clicks
- **List Rendering & Conditional Rendering**: Dynamic movie list rendering with `.map()` and conditional empty states
- **useRef & useEffect**: Auto-focus search input on Home mount, fetch movie data on component load
- **HTTP Requests**: Mock async fetch function that simulates a real API call
- **useContext**: Global `MovieContext` for sharing liked/disliked movies across views without prop drilling
- **useReducer**: Complex state management in Home component for managing movies, search, filters, and loading states

### 🎨 UI/UX Features

- Dark Netflix/Letterboxd-style theme with vibrant accent colors (Electric Blue & Sunset Orange)
- Responsive grid layout that adapts from desktop to mobile
- Smooth transitions and hover effects on all interactive elements
- Floating Like/Dislike buttons on movie cards (shown on hover)
- Loading spinner and error states

### 📱 Views

1. **Home Feed**: Browse all movies with search and category filters
2. **Movie Detail**: Full movie information with synopsis, cast, rating, and action buttons
3. **User Profile**: Two tabs for Favorites (Liked) and Not Interested (Disliked) movies

---

## 📁 Project Structure

```
src/
├── components/                    # React components
│   ├── Header.jsx                # Navigation header with logo and menu
│   ├── Header.module.css          # Header styling
│   ├── Home.jsx                   # Home view with useReducer state management
│   ├── Home.module.css            # Home view styling
│   ├── SearchBar.jsx              # Search input with useRef for auto-focus
│   ├── SearchBar.module.css       # Search bar styling
│   ├── FilterPills.jsx            # Category filter buttons
│   ├── FilterPills.module.css     # Filter pills styling
│   ├── MovieCard.jsx              # Individual movie card component
│   ├── MovieCard.module.css       # Movie card styling
│   ├── MovieList.jsx              # Grid layout for movie cards
│   ├── MovieList.module.css       # Movie list styling
│   ├── MovieDetail.jsx            # Movie detail view
│   ├── MovieDetail.module.css     # Movie detail styling
│   ├── Profile.jsx                # User profile with tabs
│   └── Profile.module.css         # Profile styling
├── contexts/                      # React Context
│   ├── movieContext.js            # MovieContext definition
│   └── MovieProvider.jsx          # MovieProvider component (useContext)
├── data/                          # Mock data
│   └── mockMovies.json            # 12 sample movies with full details
├── styles/                        # Global styles
│   └── global.css                 # CSS variables, theme, and utilities
├── App.jsx                        # Main app component (view routing)
└── main.jsx                       # Vite entry point
index.html                         # HTML template
```

---

## 🚀 Getting Started

### Installation

```bash
cd rakendusteloomine
npm install
```

### Development

```bash
npm run dev
# App will be available at http://localhost:5173/
```

### Build for Production

```bash
npm run build
npm run preview
```

### Code Quality

```bash
npm run lint
```

---

## 🛠 Key Implementation Details

### 1. MovieContext (Global State Management)

**File**: `src/contexts/movieContext.js` & `src/contexts/MovieProvider.jsx`

Manages global state for liked and disliked movies:

```javascript
const {
  likedMovies, // Array of liked movie IDs
  dislikedMovies, // Array of disliked movie IDs
  toggleLike, // Function to toggle like status
  toggleDislike, // Function to toggle dislike status
  isLiked, // Query function
  isDisliked, // Query function
} = useContext(MovieContext);
```

**Features**:

- Movies can't be both liked and disliked (mutually exclusive)
- Used in MovieCard, MovieDetail, and Profile components
- Persists throughout the session (localStorage can be added)

---

### 2. Home Component with useReducer

**File**: `src/components/Home.jsx`

Manages complex state for:

- **Movies List**: All loaded movies
- **Filter State**: Active category
- **Search Query**: User search input
- **Loading/Error States**: For async operations

**Reducer Actions**:

- `SET_MOVIES`: Load movies from JSON
- `SET_SEARCH_QUERY`: Update search and filter results
- `SET_CATEGORY`: Change active category
- `SET_ERROR`: Handle errors

**useEffect Hook**:

- Fetches movies on component mount (simulated 500ms delay)
- Can be replaced with real API call: `fetch('/api/movies')`

---

### 3. SearchBar with useRef

**File**: `src/components/SearchBar.jsx`

- **useRef**: Auto-focus the search input when Home mounts
- Real-time search filtering
- Clear button with ref reset

---

### 4. Theme System

**File**: `src/styles/global.css`

CSS Custom Properties for consistent theming:

```css
--bg-primary: #0f0f0f; /* Main background */
--bg-secondary: #1a1a1a; /* Secondary background */
--bg-tertiary: #2a2a2a; /* Tertiary background */
--accent-blue: #00d4ff; /* Primary accent */
--accent-orange: #ff6b35; /* Secondary accent */
--text-primary: #ffffff; /* Main text */
--text-secondary: #b0b0b0; /* Muted text */
--border-radius: 12px; /* Standard radius */
```

---

## 📊 Component Communication Flow

```
App
├── Header
│   └── Manages view switching (Home/Detail/Profile)
├── [Home View]
│   ├── SearchBar (useRef for focus)
│   ├── FilterPills
│   └── MovieList
│       └── MovieCard (useContext for like/dislike)
├── [Detail View]
│   └── MovieDetail (useContext for like/dislike)
└── [Profile View]
    └── MovieList
        └── MovieCard (useContext for like/dislike)

MovieContext (useContext)
└── All components can read/write liked/disliked movies
```

---

## 📦 Data Structure

### Movie Object

```javascript
{
  id: 1,
  title: "Movie Title",
  year: 2023,
  category: "Sci-Fi",        // Action, Drama, Comedy, Thriller, Sci-Fi
  rating: 8.5,
  poster: "https://...",     // Movie poster image (400x600)
  backdrop: "https://...",   // Backdrop image (1200x400)
  synopsis: "Description...",
  cast: ["Actor 1", "Actor 2", ...]
}
```

---

## 🎨 Styling Approach

- **CSS Modules** for component-scoped styles (prevents conflicts)
- **Global CSS** for theme variables and utilities
- **No CSS Framework** (pure CSS for maximum control)
- **Responsive Design**: Mobile-first approach with media queries
- **12px Border Radius** on all cards and buttons
- **Smooth Transitions** using CSS transitions

### Color Palette

- **Primary Accent**: Electric Blue (#00d4ff)
- **Secondary Accent**: Sunset Orange (#ff6b35)
- **Like Color**: Red (#ff1744)
- **Dislike Color**: Dark Gray (#424242)

---

## 🔧 Advanced React Features Used

| Feature                   | Usage                                     | File                            |
| ------------------------- | ----------------------------------------- | ------------------------------- |
| **useState**              | Managing UI state (search, filters, tabs) | Multiple                        |
| **useEffect**             | Data fetching, side effects               | Home.jsx, SearchBar.jsx         |
| **useContext**            | Global movie preferences                  | All movie-related components    |
| **useReducer**            | Complex state logic                       | Home.jsx                        |
| **useRef**                | Input focus management                    | SearchBar.jsx                   |
| **Conditional Rendering** | Empty states, loading, errors             | All views                       |
| **.map()**                | Dynamic list rendering                    | MovieList, FilterPills, Profile |

---

## 🔌 How to Add a Real API

Replace the mock fetch in `Home.jsx`:

```javascript
// Current mock
const fetchMovies = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  dispatch({ type: "SET_MOVIES", payload: moviesData });
};

// With real API
const fetchMovies = async () => {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/discover/movie",
      {
        headers: { Authorization: "Bearer YOUR_API_KEY" },
      },
    );
    const data = await response.json();
    dispatch({ type: "SET_MOVIES", payload: data.results });
  } catch (error) {
    dispatch({ type: "SET_ERROR", payload: error.message });
  }
};
```

---

## 💾 How to Add Persistence (localStorage)

Add to `src/contexts/MovieProvider.jsx`:

```javascript
// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem("cineRate");
  if (saved) {
    const { liked, disliked } = JSON.parse(saved);
    setLikedMovies(liked);
    setDislikedMovies(disliked);
  }
}, []);

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem(
    "cineRate",
    JSON.stringify({
      liked: likedMovies,
      disliked: dislikedMovies,
    }),
  );
}, [likedMovies, dislikedMovies]);
```

---

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+ (3+ column grid)
- **Tablet**: 768px - 1200px (2-3 column grid)
- **Mobile**: < 768px (1-2 column grid, simplified header)

---

## ✨ Best Practices Implemented

✅ Component separation of concerns
✅ CSS Modules for style scoping
✅ Lazy loading images (`loading="lazy"`)
✅ Semantic HTML (roles, tabIndex for buttons)
✅ Keyboard accessibility (Enter key on cards)
✅ Error handling and loading states
✅ Responsive design without frameworks
✅ Global state management without Redux
✅ No prop drilling with Context API
✅ Proper event delegation (stopPropagation)

---

## 🎯 Next Steps / Enhancements

- [ ] Add localStorage persistence
- [ ] Connect to real movie API (TMDB, OMDB)
- [ ] Add React Router for true routing
- [ ] Add movie reviews/ratings
- [ ] Add watchlist feature
- [ ] Dark/Light mode toggle
- [ ] Advanced filtering and sorting
- [ ] User authentication
- [ ] Backend API integration

---

## 📝 Notes

- **No External UI Framework**: Built with vanilla CSS for full control
- **12 Sample Movies**: Included with real poster images from Unsplash
- **Fully Responsive**: Works on all screen sizes
- **ESLint Compliant**: All code passes linting
- **Production Ready**: Builds without errors

---

## 🤝 File Checklist

All files have been created:

- ✅ `src/App.jsx`
- ✅ `src/main.jsx`
- ✅ `index.html`
- ✅ `src/styles/global.css`
- ✅ `src/contexts/movieContext.js`
- ✅ `src/contexts/MovieProvider.jsx`
- ✅ `src/components/Header.jsx` + `.module.css`
- ✅ `src/components/SearchBar.jsx` + `.module.css`
- ✅ `src/components/FilterPills.jsx` + `.module.css`
- ✅ `src/components/MovieCard.jsx` + `.module.css`
- ✅ `src/components/MovieList.jsx` + `.module.css`
- ✅ `src/components/Home.jsx` + `.module.css`
- ✅ `src/components/MovieDetail.jsx` + `.module.css`
- ✅ `src/components/Profile.jsx` + `.module.css`
- ✅ `src/data/mockMovies.json`

**Total**: 28 files created/updated

---

## 🚀 Ready to Use!

Your CineRate application is fully functional and ready to deploy. Start the dev server with:

```bash
npm run dev
```

Happy coding! 🎬
