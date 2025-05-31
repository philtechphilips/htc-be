const pool = require("../config/db");

// Fetch all rows from a table with optional filter (object)
async function fetchData(table, filter = {}) {
  let sql = `SELECT * FROM \`${table}\``;
  let values = [];
  // Always exclude deleted rows if isDeleted column exists
  let whereClauses = [];
  if (filter && Object.keys(filter).length > 0) {
    whereClauses = Object.keys(filter).map((key) => `\`${key}\` = ?`);
    values = Object.values(filter);
  }
  // Add isDeleted check
  whereClauses.push('(`isDeleted` IS NULL OR `isDeleted` = 0)');
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  const [rows] = await pool.query(sql, values);
  return rows;
}

// Fetch one row by id or filter
async function fetchOne(table, filter) {
  let sql = `SELECT * FROM \`${table}\``;
  let values = [];
  let whereClauses = [];
  if (typeof filter === "object" && filter !== null) {
    whereClauses = Object.keys(filter).map((key) => `\`${key}\` = ?`);
    values = Object.values(filter);
  } else {
    whereClauses = ["id = ?"];
    values = [filter];
  }
  // Add isDeleted check
  whereClauses.push('(`isDeleted` IS NULL OR `isDeleted` = 0)');
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
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

// Cold delete: set isDeleted = 1 instead of deleting the row
async function deleteItem(table, id) {
  const [result] = await pool.query(
    `UPDATE \`${table}\` SET isDeleted = 1 WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

// Cold delete for multiple items
async function deleteMultipleItems(table, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return false;
  const [result] = await pool.query(
    `UPDATE \`${table}\` SET isDeleted = 1 WHERE id IN (?)`,
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
