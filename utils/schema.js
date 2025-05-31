const pool = require("../config/db");

// Fetch all rows from a table with optional filter (object) and populate option
async function fetchData(table, filter = {}, options = {}) {
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

  // Handle population of related fields
  if (options.populate && Array.isArray(options.populate) && options.populate.length > 0) {
    // For each row, for each populate field, fetch related data
    for (const pop of options.populate) {
      const { field, table: relatedTable, as } = pop;
      await Promise.all(
        rows.map(async (row, idx) => {
          if (row[field]) {
            const [relatedRows] = await pool.query(
              `SELECT * FROM \`${relatedTable}\` WHERE id = ? AND (isDeleted IS NULL OR isDeleted = 0)`,
              [row[field]]
            );
            rows[idx][as || field.replace('_id', '')] = relatedRows[0] || null;
            delete rows[idx][field];
          }
        })
      );
    }
  }
  return rows;
}

// Fetch one row by id or filter, with optional populate
async function fetchOne(table, filter, options = {}) {
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
  let row = rows[0] || null;

  // Handle population of related fields for single row
  if (row && options.populate && Array.isArray(options.populate) && options.populate.length > 0) {
    for (const pop of options.populate) {
      const { field, table: relatedTable, as } = pop;
      if (row[field]) {
        const [relatedRows] = await pool.query(
          `SELECT * FROM \`${relatedTable}\` WHERE id = ? AND (isDeleted IS NULL OR isDeleted = 0)`,
          [row[field]]
        );
        row[as || field.replace('_id', '')] = relatedRows[0] || null;
        delete row[field];
      }
    }
  }
  return row;
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
