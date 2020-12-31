const express = require('express')
const router=express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check,validationResult} = require('express-validator')
const auth = require('../../middleware/auth')

const User = require('../../models/User')

// @route     GET api/auth
router.get('/', auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.log(err.message) 
        res.status(500).send('Server Error')
    }
})


// @route     POST api/auth
// @desc      authenticate user and get token
// @access    public
router.post('/', [
    check('email','please include a valid email').isEmail(),
    check('password','password is required').exists()
],
async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    console.log(req.body)
    const { email,password} = req.body
    
    try{
        //findone() will return promise
        let user = await User.findOne({ email })

        if(!user) {
            res.status(400).json({errors:[{msg:'Invalid Credentials...'}]})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            res.status(400).json({errors:[{msg:'Invalid Credentials...'}]})
        }

        const payload ={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,config.get('jwtSecret'), {expiresIn:36000}, (err,token) => {
            if (err)    throw err;
            res.json({token})
        })

    } catch(err){
        console.error(err.message)
        res.status(500).send('server error')
    }

})

module.exports=router