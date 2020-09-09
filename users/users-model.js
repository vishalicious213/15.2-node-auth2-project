const db = require('../data/dbConfig')

// GET all users
function findAll() {
	return db('users').select('id', 'username', 'department')
}

// ADD user
async function add(user) {
    const [id] = await db('users').insert(user)
    return findById(id)
}

// FIND user by ID
function findById(id) {
    return db('users')
        .select('id', 'username', 'department')
        .where({ id })
        .first()
}

// FIND user by filter (username, in this case)
function findBy(filter) {
	return db('users')
		.select('id', 'username', 'password', 'department')
		.where(filter)
}

module.exports = {
    add,
    findAll,
    findBy,
    findById
}