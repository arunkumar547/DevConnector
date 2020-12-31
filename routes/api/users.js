const express = require('express')
const router=express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check,validationResult} = require('express-validator')

//user model
const User=require('../../models/User')


// @route     POST api/users
// @desc      register users
// @access    public
router.post('/', [
    check('name','name must not be empty').not().isEmpty(),
    check('email','please include a valid email').isEmail(),
    check('password','please enter a  password with five or more characters').isLength({ min:5 })
],
async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    console.log(req.body)
    const {name,email,password} = req.body
    
    try{
        //findone() will return promise
        let user = await User.findOne({ email })

        if(user) {
            res.status(400).json({errors:[{msg:'user already exists'}]})
        }

        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        });

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt= await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password,salt)

        await user.save()

        const payload ={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,config.get('jwtSecret'), {expiresIn:36000}, (err,token) => {
            if (err)    throw err;
            res.json({token})
        })

        // res.send('user route')

    } catch(err){
        console.error(err.message)
        res.status(500).send('server error')
    }
//see if user exists

//get users gravator

//encrypt password

//return jsonwebtoken


    // res.send("users api")
})

module.exports=router