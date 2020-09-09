const express = require('express')
const Users = require('./users-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const usersMiddleware = require('./users-middleware')

const router = express.Router()

// GET all users
// router.get('/users', usersMiddleware.restrict(), async (req, res, next) => {
router.get('/users', async (req, res, next) => {
    try {
        res.json(await Users.findAll())
    } catch(error) {
        next(error)
    }
})

// ADD user (register)
router.post("/register", async (req, res, next) => {
	try {
		const { username, password, department } = req.body
		const user = await Users.findBy({ username }).first()

		if (user) {
			return res.status(409).json({
				message: "Username is already taken",
			})
		}

		const newUser = await Users.add({
			username,
            password: await bcrypt.hash(password, 14),
            department
		})

		res.status(201).json(newUser)
	} catch(err) {
		next(err)
	}
})

// LOGIN
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body
		const user = await Users.findBy({ username }).first()
		
		if (!user) {
			return res.status(401).json({
				message: "Invalid Credentials",
			})
		}

		// compare pw from request body to hash stored in db (returns true/false)
		const passwordValid = await bcrypt.compare(password, user.password)

		// if they don't match, return with error
		if (!passwordValid) {
			return res.status(401).json({
				message: "You shall not pass!",
			})
		}
        
        // generate a new JSON web token
        const token = jwt.sign({
            userID: user.id,
            userDept: user.department
        }, process.env.JWT_SECRET)
        // tried below before realizing that dotenv was not installed/required
        // const token = generateToken(user)

        // send the token back as a cookie
        res.cookie('token', token)

		res.json({
			message: `Welcome ${user.username}!`,
		})
	} catch(err) {
		next(err)
	}
})

// function generateToken(user) {
//     const payload = {
//         subject: user.id,
//         username: user.username,
//         userDept: user.department
//     }

//     const options = {
//         expiresIn: '1d'
//     }

//     return jwt.sign(payload, process.env.JWT_SECRET, options)
// }

// LOGOUT
// router.get("/logout", usersMiddleware.restrict(), async (req, res, next) => {
// 	try {
// 		req.session.destroy((error) => {
// 			if (error) {
// 				next(error)
// 			} else {
//                 // res.status(204).end()
//                 res.status(204).json({
//                     message: "Logged out",
//                 })
//                 res.end()
// 			}
// 		})
// 	} catch (error) {
// 		next(error)
// 	}
// })

module.exports = router