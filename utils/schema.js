const pool = require("../config/db");

// Fetch all rows from a table with optional filter (object)
async function fetchData(table, filter = {}) {
  let sql = `SELECT * FROM \`${table}\``;
  let values = [];
  if (filter && Object.keys(filter).length > 0) {
    const where = Object.keys(filter)
      .map((key) => `\`${key}\` = ?`)
      .join(" AND ");
    sql += ` WHERE ${where}`;
    values = Object.values(filter);
  }
  const [rows] = await pool.query(sql, values);
  return rows;
}

// Fetch one row by id or filter
async function fetchOne(table, filter) {
  let sql = `SELECT * FROM \`${table}\``;
  let values = [];
  if (typeof filter === "object" && filter !== null) {
    const where = Object.keys(filter)
      .map((key) => `\`${key}\` = ?`)
      .join(" AND ");
    sql += ` WHERE ${where}`;
    values = Object.values(filter);
  } else {
    sql += " WHERE id = ?";
    values = [filter];
  }
  const [rows] = await pool.query(sql, values);
  return rows[0] || null;
}

// Create a new row
async function create(table, data) {
  const [result] = await pool.query(`INSERT INTO \`${table}\` SET ?`, [data]);
  return result.insertId;
}

// Update a row by id or filter
async function update(table, filter, data) {
  let sql = `UPDATE \`${table}\` SET ?`;
  let values = [data];
  if (typeof filter === "object" && filter !== null) {
    const where = Object.keys(filter)
      .map((key) => `\`${key}\` = ?`)
      .join(" AND ");
    sql += ` WHERE ${where}`;
    values = [data, ...Object.values(filter)];
  } else {
    sql += " WHERE id = ?";
    values = [data, filter];
  }
  const [result] = await pool.query(sql, values);
  return result.affectedRows > 0;
}

// Delete a row by id
async function deleteItem(table, id) {
  const [result] = await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [
    id,
  ]);
  return result.affectedRows > 0;
}

// Delete multiple rows by ids (array)
async function deleteMultipleItems(table, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return false;
  const [result] = await pool.query(
    `DELETE FROM \`${table}\` WHERE id IN (?)`,
    [ids],
  );
  return result.affectedRows > 0;
}

module.exports = {
  fetchData,
  fetchOne,
  create,
  update,
  deleteItem,
  deleteMultipleItems,
};
