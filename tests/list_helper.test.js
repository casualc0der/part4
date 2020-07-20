const listHelper = require("../utils/list_helper");
const mockBlogs = require("./mock_blog_list");
const { result } = require("lodash");
test("dummy returns one", () => {
  const blogs = [];
  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});
describe("total likes", () => {
  test("of empty list is zero", () => {
    expect(listHelper.totalLikes([])).toBe(0);
  });
  test("of a one blog list is equal to that blogposts likes", () => {
    const blogs = [].concat(mockBlogs[0]);
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(7);
  });
  test("tallies up all of the likes in a list of blog posts", () => {
    const result = listHelper.totalLikes(mockBlogs);
    expect(result).toBe(36);
  });
});

describe("favourite blog", () => {
  test("no results when list empty", () => {
    const blogs = [];
    const result = listHelper.favouriteBlog(blogs);
    expect(result).toBe(null);
  });
  test("returns a singular blog with the most likes", () => {
    const topBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    };
    const result = listHelper.favouriteBlog(mockBlogs);
    expect(result).toEqual(topBlog);
  });
});

describe("most blogs", () => {
  test("no results when list is empty", () => {
    const blogs = [];
    const result = listHelper.mostBlogs(blogs);
    expect(result).toBe(null);
  });
  test("correct number of blogs for the most prolific author", () => {
    const prolificAuthor = {
      author: "Robert C. Martin",
      blogs: 3,
    };
    const result = listHelper.mostBlogs(mockBlogs);
    expect(result).toEqual(prolificAuthor);
  });
});

describe("most likes", () => {
  test("no results when list is empty", () => {
    const blogs = [];
    const result = listHelper.mostLikes(blogs);
    expect(result).toBe(null);
  });
  test("correct number of likes for the most popular author", () => {
    const topAuthor = {
      author: "Edsger W. Dijkstra",
      likes: 17,
    };
    const result = listHelper.mostLikes(mockBlogs);
    expect(result).toEqual(topAuthor);
  });
});
