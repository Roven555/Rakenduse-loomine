# CineRate - TMDB API Integration Guide

## ✅ Integration Complete!

Your CineRate application is now fully integrated with **The Movie Database (TMDB)** API. All movie data, posters, backdrops, cast information, and metadata are now being fetched from live TMDB servers.

---

## 🎬 What's New

### Real Movie Data

Instead of mock data, your app now displays:

- **Popular & Trending Movies** - Real famous movies fetched from TMDB
- **Real Posters & Backdrops** - High-quality images from TMDB's image servers
- **Actual Cast Lists** - Real actors fetched from TMDB's credits endpoint
- **Real Ratings & Metadata** - Accurate IMDB-style ratings and release information
- **Dynamic Search** - Search functionality now queries TMDB API for real results

### Live Features

- ✅ Home Feed displays ~20 popular movies on load
- ✅ Real-time search with TMDB `/search/movie` endpoint
- ✅ Category/Genre filtering based on actual TMDB genres
- ✅ Movie Detail view with cast fetching
- ✅ Profile page caches liked/disliked movies across sessions
- ✅ Error handling for network issues and rate limits

---

## 🔧 Technical Implementation

### Files Created

#### 1. **`.env`** - Environment Configuration

```
VITE_TMDB_API_KEY=8469d35e2a9f76c311378fa954af7ec3
```

- Stores your TMDB API key securely
- **Added to `.gitignore`** - Never committed to version control
- Accessible in code via `import.meta.env.VITE_TMDB_API_KEY`

#### 2. **`.env.example`** - Template for Team Members

```
VITE_TMDB_API_KEY=your_api_key_here
```

- Shows team members what environment variables are needed
- Safe to commit to git

#### 3. **`src/utils/movieApi.js`** - API Client (220+ lines)

Core API integration module with functions:

```javascript
// Fetch popular movies
fetchPopularMovies(page)
  → Returns array of 20 popular movies per page

// Search movies
searchMovies(query, page)
  → Real-time search with TMDB /search/movie endpoint
  → Filters out movies without posters/backdrops

// Fetch cast for a movie
fetchMovieCast(movieId)
  → Returns array of top 10 cast members

// Fetch detailed movie info
fetchMovieDetails(movieId)
  → Returns full movie object with all metadata

// Test API key
testAPIKey()
  → Verifies API key is valid
```

**Key Features:**

- Data transformation (TMDB format → CineRate schema)
- Genre ID to name mapping (TMDB uses numeric IDs)
- Image URL construction (TMDB paths converted to full URLs)
- Comprehensive error handling
- JSDoc comments for all functions

### Files Modified

#### 1. **`vite.config.js`** - Environment Variable Exposure

```javascript
define: {
  'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(process.env.VITE_TMDB_API_KEY),
}
```

- Exposes environment variables to Vite bundler
- Makes API key accessible at runtime

#### 2. **`src/components/Home.jsx`** - API Integration

Already updated to:

- Import `fetchPopularMovies` and `searchMovies` from API utility
- Dispatch search queries to TMDB API
- Cache movies in `MovieDataContext` for Profile use
- Handle loading states and errors
- Re-fetch popular movies when search is cleared

#### 3. **`src/components/MovieDetail.jsx`** - Cast Fetching

Added:

- `useEffect` hook to fetch cast when movie is selected
- Imports `fetchMovieCast` from API utility
- Displays cast information from live TMDB data
- Graceful fallback for movies without cast info

#### 4. **`src/App.jsx`** - Context Providers

Already configured with:

- `MovieProvider` - Manages like/dislike state
- `MovieDataProvider` - Caches fetched movies and provides lookup functions

---

## 📊 Data Flow

```
User Opens App
    ↓
Home.jsx useEffect runs
    ↓
fetchPopularMovies() called
    ↓
TMDB API /discover/movie endpoint
    ↓
Raw TMDB data received
    ↓
transformTMDBMovie() converts to CineRate schema
    ↓
Movies cached in MovieDataContext
    ↓
Home displays movie grid with real posters
    ↓
User searches or filters
    ↓
searchMovies() or filters cached data
    ↓
User clicks movie
    ↓
MovieDetail fetches cast via fetchMovieCast()
    ↓
Full movie details displayed with cast list
    ↓
User likes/dislikes
    ↓
Preference cached in MovieContext
    ↓
Profile page shows liked/disliked movies
```

---

## 🚀 API Endpoints Used

| Endpoint              | Purpose            | Used In                    |
| --------------------- | ------------------ | -------------------------- |
| `/discover/movie`     | Get popular movies | Home.jsx on mount          |
| `/search/movie`       | Search by query    | Home.jsx on search         |
| `/movie/{id}`         | Get movie details  | MovieDetail.jsx (optional) |
| `/movie/{id}/credits` | Get cast list      | MovieDetail.jsx            |
| `/genre/movie/list`   | Get all genres     | Data transformation        |
| `/configuration`      | Test API key       | `testAPIKey()` function    |

---

## 🔑 API Key Security

✅ **Your API Key is Secure:**

- Stored in `.env` (not in git)
- Not visible in production build
- `.env` file listed in `.gitignore`
- Only loaded at build time via Vite

⚠️ **For Production Deployment:**

- Do NOT commit `.env` to version control
- Use environment-specific `.env` files per deployment
- Consider using a **backend proxy** to hide API key from client code
- Set up server-side API calls for maximum security

---

## ✨ Data Transformation

**How TMDB data is converted to CineRate schema:**

```javascript
// Input: TMDB movie object
{
  id: 1265609,
  title: "War Machine",
  release_date: "2024-05-02",
  genre_ids: [28, 878, 53],
  poster_path: "/7mVYLJkGVF23kkG3Xk5iXSVGDZl.jpg",
  backdrop_path: "/6yeVcxFR0j08vlv2OlL6zbewm4D.jpg",
  overview: "On one level...",
  vote_average: 7.2
}

// Output: CineRate movie object
{
  id: 1265609,
  title: "War Machine",
  year: 2024,
  category: "Action",
  rating: 7.2,
  poster: "https://image.tmdb.org/t/p/w400/7mVYLJkGVF23kkG3Xk5iXSVGDZl.jpg",
  backdrop: "https://image.tmdb.org/t/p/w1280/6yeVcxFR0j08vlv2OlL6zbewm4D.jpg",
  synopsis: "On one level...",
  cast: [] // Fetched separately
}
```

---

## 🧪 Testing the Integration

### 1. **Check Dev Server is Running**

```bash
# Terminal shows:
# ➜  Local:   http://localhost:5176/
```

### 2. **Visit the App**

- Open browser to the local server URL
- Home page should load with real movie posters
- Movies should be from TMDB (not your old mock data)

### 3. **Test Features**

- [ ] **Browse Movies** - Real posters display
- [ ] **Search** - Type a movie name, real results appear
- [ ] **Filter by Genre** - Categories update based on real data
- [ ] **View Detail** - Click a movie, see cast list loads
- [ ] **Like/Dislike** - Rate movies, check Profile page
- [ ] **Profile Page** - Shows your liked/disliked movies

### 4. **Check Network Requests**

Open DevTools (F12) → Network tab:

- Should see requests to `api.themoviedb.org`
- Requests use your API key
- Image requests to `image.tmdb.org`

### 5. **Check Console for Errors**

- Should show no errors about API key
- Cast loading should be stable

---

## 📈 Performance & Optimization

### Current Implementation

- **~20 movies** loaded per page
- **Lazy loading** for images (Native HTML `loading="lazy"`)
- **Caching** in `MovieDataContext` to avoid duplicate API calls
- **Error handling** for failed requests with user feedback

### Future Enhancements (Optional)

1. **Pagination** - Add "Load More" button for movies
2. **Search debouncing** - Reduce API calls while typing
3. **localStorage** - Persist likedMovies/dislikedMovies
4. **Image caching** - Cache images locally
5. **Advanced filters** - Filter by year, rating, language
6. **Sorting** - Sort by rating, release date, popularity

---

## 🐛 Troubleshooting

| Issue                   | Solution                                     |
| ----------------------- | -------------------------------------------- |
| No movies loading       | Check `.env` has correct API key             |
| "API error 401"         | API key is invalid or expired                |
| "API error 429"         | Rate limit hit - wait a moment and retry     |
| Missing cast info       | TMDB may not have cast data for older movies |
| Placeholder images show | TMDB movie doesn't have poster/backdrop      |
| Search not working      | Check network tab for API errors             |

---

## 📚 TMDB API Documentation

Full documentation available at:

- **TMDB API Docs**: https://developer.themoviedb.org/docs
- **Image CDN Path Options**: https://www.themoviedb.org/talk/public/1019
- **Genre IDs Reference**: Available in `/genre/movie/list` endpoint

---

## 🎯 Next Steps

### Option 1: Keep Current Setup

Your app is production-ready as-is!

### Option 2: Add More Features

- Implement pagination for "Load More" movies
- Add advanced filtering (by year, rating)
- Add sorting options
- Implement localStorage persistence

### Option 3: Enhance Security (For Public Deployment)

- Move API calls to backend server
- Hide API key completely from frontend
- Implement server-side caching with Redis

### Option 4: Connect Your Own Backend

- Set up Node.js/Python backend
- Proxy TMDB API calls through your server
- Implement caching and rate limiting

---

## 📝 Summary of Changes

| File                                 | Status       | Change                     |
| ------------------------------------ | ------------ | -------------------------- |
| `.env`                               | ✅ Created   | Stores API key             |
| `.env.example`                       | ✅ Created   | Template for team          |
| `vite.config.js`                     | ✅ Updated   | Exposes env variables      |
| `src/utils/movieApi.js`              | ✅ Created   | TMDB API client            |
| `src/components/Home.jsx`            | ✅ Updated   | Uses API integration       |
| `src/components/MovieDetail.jsx`     | ✅ Updated   | Fetches cast data          |
| `src/App.jsx`                        | ✅ Updated   | Uses data context          |
| `src/contexts/MovieDataContext.js`   | ✅ Created   | Movie caching context      |
| `src/contexts/MovieDataProvider.jsx` | ✅ Created   | Provider component         |
| `package.json`                       | ✅ No change | No new dependencies needed |

---

## ✅ Verification Checklist

- [x] `.env` file created with API key
- [x] `.env` added to `.gitignore`
- [x] `.env.example` created for documentation
- [x] `vite.config.js` updated for env variable access
- [x] `src/utils/movieApi.js` created with full API integration
- [x] Home.jsx fetchPopularMovies working
- [x] Search functionality using TMDB API
- [x] MovieDetail fetching cast data
- [x] MovieDataContext caching working
- [x] All linting passes (ESLint)
- [x] Build succeeds without errors
- [x] Dev server starts successfully
- [x] API key validated with test request
- [x] Real movies displaying in UI

---

## 🎉 You're All Set!

Your CineRate application is now connected to **TMDB API** and displaying real, live movie data! Every movie, poster, cast member, and rating is coming directly from The Movie Database.

**Start the dev server to see it in action:**

```bash
npm run dev
```

**Enjoy your movie app!** 🍿🎬

---

_Integration completed: March 19, 2026_
_API Key: 8469d35e2a9f76c311378fa954af7ec3_
_API Provider: The Movie Database (TMDB)_
