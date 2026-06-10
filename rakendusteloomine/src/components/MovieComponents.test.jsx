import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterPills from "./FilterPills";
import MovieCard from "./MovieCard";
import MovieList from "./MovieList";
import SearchBar from "./SearchBar";
import SortSelect from "./SortSelect";
import { MovieContext } from "../contexts/movieContext";

const movie = {
  id: 42,
  title: "Interstellar",
  year: 2014,
  rating: "8.7",
  categories: ["Ulme", "Draama"],
  poster: "/poster.jpg",
};

const contextValue = {
  isLiked: vi.fn(() => false),
  isDisliked: vi.fn(() => false),
  isInWatchlist: vi.fn(() => false),
  toggleLike: vi.fn(),
  toggleDislike: vi.fn(),
  toggleWatchlist: vi.fn(),
};

const renderWithMovieContext = (ui, value = contextValue) => {
  return render(
    <MovieContext.Provider value={value}>{ui}</MovieContext.Provider>,
  );
};

describe("Movie components", () => {
  it("updates search query and clears it with the clear button", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const { rerender } = render(
      <SearchBar searchQuery="" onSearchChange={onSearchChange} />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();

    await user.type(input, "Matrix");
    expect(onSearchChange).toHaveBeenLastCalledWith("x");

    rerender(<SearchBar searchQuery="Matrix" onSearchChange={onSearchChange} />);
    await user.click(screen.getByRole("button"));

    expect(onSearchChange).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("calls onSortChange when the selected sort option changes", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<SortSelect activeSort="popularity" onSortChange={onSortChange} />);

    await user.selectOptions(screen.getByRole("combobox"), "year-desc");

    expect(onSortChange).toHaveBeenCalledWith("year-desc");
  });

  it("calls onCategoryChange when a category pill is clicked", async () => {
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    render(
      <FilterPills
        categories={["Kõik", "Draama", "Ulme"]}
        activeCategory="Kõik"
        onCategoryChange={onCategoryChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Draama" }));

    expect(onCategoryChange).toHaveBeenCalledWith("Draama");
  });

  it("shows an empty state when no movies are available", () => {
    render(<MovieList movies={[]} onMovieClick={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Ei leitud",
    );
  });

  it("renders movie data in a card and opens details when the card is clicked", async () => {
    const user = userEvent.setup();
    const onCardClick = vi.fn();
    renderWithMovieContext(<MovieCard movie={movie} onCardClick={onCardClick} />);

    expect(screen.getByRole("img", { name: "Interstellar" })).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("Ulme, Draama")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Interstellar/i }));

    expect(onCardClick).toHaveBeenCalledWith(42);
  });

  it("uses context actions from the movie card without opening the detail view", async () => {
    const user = userEvent.setup();
    const onCardClick = vi.fn();
    const value = {
      ...contextValue,
      toggleLike: vi.fn(),
    };
    renderWithMovieContext(
      <MovieCard movie={movie} onCardClick={onCardClick} />,
      value,
    );

    await user.click(screen.getByTitle("Meeldib"));

    expect(value.toggleLike).toHaveBeenCalledWith(42);
    expect(onCardClick).not.toHaveBeenCalled();
  });
});
