import { describe, expect, it } from "vitest";
import { filterMovies, getCategories, sortMovies } from "./Home";

const movies = [
  {
    id: 1,
    title: "Arrival",
    year: 2016,
    rating: "7.9",
    categories: ["Ulme", "Draama"],
    runtime: 116,
  },
  {
    id: 2,
    title: "Toy Story",
    year: 1995,
    rating: "8.3",
    categories: ["Animatsioon", "Pere"],
    runtime: 81,
  },
  {
    id: 3,
    title: "The Godfather",
    year: 1972,
    rating: "9.2",
    category: "Krimi",
    runtime: 175,
  },
];

describe("Home movie helpers", () => {
  it("filters movies by search query", () => {
    const result = filterMovies(movies, "arrival", "Kõik");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Arrival");
  });

  it("filters movies by category", () => {
    const result = filterMovies(movies, "", "Pere");

    expect(result.map((movie) => movie.title)).toEqual(["Toy Story"]);
  });

  it("filters long movies by runtime option", () => {
    const result = filterMovies(movies, "", "Kõik", "all", "150+");

    expect(result.map((movie) => movie.title)).toEqual(["The Godfather"]);
  });

  it("sorts movies by rating from highest to lowest", () => {
    const result = sortMovies(movies, "rating-desc");

    expect(result.map((movie) => movie.title)).toEqual([
      "The Godfather",
      "Toy Story",
      "Arrival",
    ]);
  });

  it("collects unique categories and keeps all as the first option", () => {
    const result = getCategories(movies);

    expect(result[0]).toBe("Kõik");
    expect(result).toEqual([
      "Kõik",
      "Animatsioon",
      "Draama",
      "Krimi",
      "Pere",
      "Ulme",
    ]);
  });
});
