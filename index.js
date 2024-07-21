import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  password: "admin",
  database: "world",
  host: "localhost",
  port: 5432,
});

db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];
async function getItems() {
  const result = await db.query("select * from items order by id asc");
  console.log(result.rows);
  return result.rows;
}

app.get("/", async (req, res) => {
  const items = await getItems();
  res.render("index.ejs", {
    listTitle: "To-Do List",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("insert into items (title) values ($1)", [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const updateID = req.body.updatedItemId;
  const updateTitle = req.body.updatedItemTitle;

  try {
    await db.query("update items set title = $1 where id = $2", [
      updateTitle,
      updateID,
    ]);

    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", (req, res) => {
  const deleteId = req.body.deleteItemId;
  db.query("delete from items where id = $1", [deleteId]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
