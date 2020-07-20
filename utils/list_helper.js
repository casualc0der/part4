const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0;
  }
  return blogs.reduce((acc, cur) => acc + cur.likes, 0);
};

const favouriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  const bestBlog = blogs.sort((a, b) => b.likes - a.likes)[0];
  return {
    title: bestBlog.title,
    author: bestBlog.author,
    likes: bestBlog.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  // count all blog authors, then convert to array, then simply index into the first one
  const topAuthor = Object.entries(_.countBy(blogs, (b) => b.author)).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return {
    author: topAuthor[0],
    blogs: topAuthor[1],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const likesTotal = [];
  // map over the original array and create a new array that totals the likes
  // then we simply sort the new array and return the item in the first position
  blogs.map((x) => {
    const location = likesTotal.findIndex((p) => p.author === x.author);
    location !== -1
      ? (likesTotal[location].likes += x.likes)
      : likesTotal.push({ author: x.author, likes: x.likes });
  });
  return likesTotal.sort((a, b) => b.likes - a.likes)[0];
};
module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes };
