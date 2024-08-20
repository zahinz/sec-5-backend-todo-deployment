import pool from "../database/connection.js";

async function create(req, res) {
  const title = req.body.title;
  const description = req.body.description;
  // this is how you access the user data from the middleware
  const authData = req.user;
  try {
    //   create a todo in the database
    const query = `
      INSERT INTO "Todos" (title, description, user_id)
      VALUES ($1, $2, $3)
      `;
    const values = [title, description, authData.id];
    await pool.query(query, values);

    return res.json({
      message: "a todo is created",
      data: {
        title: title,
        description: description,
        user_id: authData.id,
      },
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function list(req, res) {
  try {
    const authData = req.user;
    const query = `
        SELECT * FROM "Todos" WHERE user_id = $1
        `;
    const values = [authData.id];
    const response = await pool.query(query, values);
    return res.status(200).json({
      message: `${response.rows.length} todos found`,
      data: response.rows,
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

// update controller
async function update(req, res) {
  try {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const authData = req.user;

    // validate if body title and description are empty and return response 400 if empty
    if (!title || !description) {
      return res.status(400).json({ message: "title or description is empty" });
    }

    // EARLY RETURN STRATEGY
    // validate if id is exist in the database, then return response 400 if not exist
    const queryCheck = `
        SELECT * FROM "Todos" WHERE id = $1
        `;
    const checkId = await pool.query(queryCheck, [id]);
    if (checkId.rowCount === 0) {
      return res.status(400).json({ message: `todo with id ${id} not found` });
    }

    // validate if the todo is belong to the user, then return response 401 if not belong
    const queryCheckUser = `
        SELECT * FROM "Todos" WHERE id = $1 AND user_id = $2
        `;
    const checkUser = await pool.query(queryCheckUser, [id, authData.id]);
    if (checkUser.rowCount === 0) {
      return res
        .status(401)
        .json({ message: `todo with id ${id} is not yours` });
    }

    const query = `
        UPDATE "Todos" SET title = $1, description = $2 WHERE id = $3
        `;
    const values = [title, description, id];
    await pool.query(query, values);

    return res.json({
      message: `todo with id ${id} is updated`,
      data: {
        title: title,
        description: description,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
}

// delete controller
// route is DELETE /todo/:id

// get controller
// route is GET /todo/:id

const todoController = {
  create: create,
  list: list,
  update: update,
  // delete: delete,
  // get: get,
};

export default todoController;
