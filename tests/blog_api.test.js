const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const mockBlogs = require("./mock_blog_list");
const Blog = require("../models/blog");
const logger = require("../utils/logger");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const api = supertest(app);
const jwt = require("jsonwebtoken");
const mock_id = "5a422aa71b54a676234d17f9";
const mock_user = "5a422aa71b54a676234d17f0";

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  const noteObjects = mockBlogs.map((blog) => new Blog(blog));
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
  const passwordHash = await bcrypt.hash("secret", 10);
  const user = new User({ _id: mock_user, username: "root", passwordHash });
  const u = await user.save();
  const blog = new Blog({
    _id: mock_id,
    title: "Testing is hard",
    author: "Bobby Tables",
    url: "www.millet.com",
    likes: 0,
    user: u._id,
  });

  const result = await blog.save();
  u.blogs = u.blogs.concat(result._id);
  await u.save();
});
describe("GET", () => {
  test("blogs returned as JSON", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("number of blogs returned is 7", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(7);
  });

  test("identifier of blogs is id and NOT _id", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });
});

const testPost = {
  title: "I am a test blog",
  author: "Testy Boy",
  url: "https://www.test.com/testy",
  likes: 0,
};
describe("POST", () => {
  test("will raise 401 error with missing token", async () => {
    await api.post("/api/blogs/").send(testPost).expect(401);
  });
  test("can create a new blog post", async () => {
    const token = jwt.sign(
      { id: mock_user, username: "root" },
      process.env.SECRET
    );
    await api
      .post("/api/blogs/")
      .set("authorization", `bearer ${token}`)
      .send(testPost)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api.get("/api/blogs");
    const contents = response.body.map((r) => r.title);
    expect(response.body).toHaveLength(mockBlogs.length + 2);
    expect(contents).toContain("I am a test blog");
  });
  test("if likes are missing, default to 0", async () => {
    const tester = { ...testPost };
    delete tester.likes;
    const token = jwt.sign(
      { id: mock_user, username: "root" },
      process.env.SECRET
    );
    await api
      .post("/api/blogs")
      .set("authorization", `bearer ${token}`)
      .send(tester)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api.get("/api/blogs");
    const contents = response.body.filter(
      (r) => r.title === "I am a test blog"
    );
    logger.info(contents);
    expect(response.body).toHaveLength(mockBlogs.length + 2);
    expect(contents[0].likes).toBe(0);
  });
  test("blog will be rejected if no title or url", async () => {
    const tester = { ...testPost };
    delete tester.url;
    delete tester.title;
    const token = jwt.sign(
      { id: mock_user, username: "root" },
      process.env.SECRET
    );
    await api
      .post("/api/blogs")
      .set("authorization", `bearer ${token}`)
      .send(tester)
      .expect(400);
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(mockBlogs.length + 1);
  });
});
describe("DELETE", () => {
  test("deletes blog from the list", async () => {
    await api
      .del(`/api/blogs/${mock_id}`)
      .set("Authorization", "Bearer 1234567890101029128")
      .expect(204);
    const response = await api.get("/api/blogs");
    const contents = response.body;
    // we added an extra blog to the list, so no need to change the length!
    expect(contents.length).toBe(mockBlogs.length);
  });
});
describe("PUTS/EDIT", () => {
  test("find a blog by id, and update the like count", async () => {
    const blog = mockBlogs[0];
    await api
      .put(`/api/blogs/${blog._id}`)
      .send({
        author: blog.author,
        title: blog.title,
        url: blog.url,
        likes: blog.likes + 1,
      })
      .expect(201);
    const response = await api.get("/api/blogs");
    const content = response.body.filter((b) => b.title === blog.title);
    expect(content[0].likes).toBe(blog.likes + 1);
  });
});
afterAll(() => {
  mongoose.connection.close();
});
