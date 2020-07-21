const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const mockBlogs = require("./mock_blog_list");
const Blog = require("../models/blog");
const logger = require("../utils/logger");
const api = supertest(app);
beforeEach(async () => {
  await Blog.deleteMany({});

  const noteObjects = mockBlogs.map((blog) => new Blog(blog));
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});
describe("GET", () => {
  test("blogs returned as JSON", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("number of blogs returned is 6", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(6);
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
  test("can create a new blog post", async () => {
    await api
      .post("/api/blogs/")
      .send(testPost)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api.get("/api/blogs");
    const contents = response.body.map((r) => r.title);
    expect(response.body).toHaveLength(mockBlogs.length + 1);
    expect(contents).toContain("I am a test blog");
  });
  test("if likes are missing, default to 0", async () => {
    const tester = { ...testPost };
    delete tester.likes;
    await api
      .post("/api/blogs")
      .send(tester)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const response = await api.get("/api/blogs");
    const contents = response.body.filter(
      (r) => r.title === "I am a test blog"
    );
    logger.info(contents);
    expect(response.body).toHaveLength(mockBlogs.length + 1);
    expect(contents[0].likes).toBe(0);
  });
  test("blog will be rejected if no title or url", async () => {
    const tester = { ...testPost };
    delete tester.url;
    delete tester.title;

    await api.post("/api/blogs").send(tester).expect(400);
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(mockBlogs.length);
  });
});
describe("DELETE", () => {
  test("deletes blog from the list", async () => {
    await api.delete(`/api/blogs/${mockBlogs[0]._id}`).expect(204);
    const response = await api.get("/api/blogs");
    const contents = response.body;
    expect(contents.length).toBe(mockBlogs.length - 1);
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
