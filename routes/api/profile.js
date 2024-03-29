const express = require('express')
const router=express.Router();
const request = require('request')
const config = require('config')
const auth = require('../../middleware/auth')
const {check,validationResult} = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

// @route     GET api/profile/me
// @desc      Get current users profile
// @access    Private
router.get('/me', auth, async (req,res)=>{
    try {
        const profile= await Profile.findOne({ user:req.user.id }).populate( 
            'user',
            ['name', 'avatar']
        )

        if(!profile) {
            return res.status(400).json({ msg:'There is no profile for this user'})
        }

        res.json(profile)

    } catch (err) {
        console.error(err.message)        
        res.status(500).send('Server Error')
    }
})

// @route     GET api/profile
// @desc      Create or update user profile
// @access    Private
router.post('/' , [auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty() 
]], 
async (req,res) =>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
    } = req.body;
  
    // build a profile
    const profileFields = {}
    profileFields.user = req.user.id
    if(company) profileFields.company=company
    if(website) profileFields.website=website
    if(location) profileFields.location=location
    if(bio) profileFields.bio=bio
    if(status) profileFields.status=status
    if(githubusername) profileFields.githubusername=githubusername
    if(skills) {
        profileFields.skills= Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim())
    } 

    // build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube=youtube
    if(twitter) profileFields.social.twitter=twitter
    if(facebook) profileFields.social.facebook=facebook
    if(linkedin) profileFields.social.linkedin=linkedin
    if(instagram) profileFields.social.instagram=instagram

    try {
        let profile= await Profile.findOne({ user:req.user.id })

        if(profile){
            profile= await Profile.findOneAndUpdate(
                { user:req.user.id },
                {$set : profileFields},
                {new:true}
            )
            return res.json(profile)
        }

        // create
        profile = new Profile(profileFields)

        await profile.save()
        res.json(Profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server error')
    }
});



// @route     GET api/profile
// @desc      Get all profiles
// @access    Public
router.get('/', async (req,res)=>{
   try {
        const profiles = await Profile.find().populate('user', ['name','avatar'])
        res.json(profiles)   

   } catch (err) {
       console.log(err.message)
       res.status(500).send('server error')
   }

})


// @route     GET api/profile/user/:user_id
// @desc      Get profile by user ID
// @access    Public
router.get('/user/:user_id', async (req,res)=>{
    try {
        const profile = await Profile.findOne( {user:req.params.user_id } ).populate('user', ['name','avatar'])
        
        if(!profile)    return res.status(400).json({msg:' Profile not found'})

        res.json(profile)   
 
    } catch (err) {
        console.log(err.message)
        if(err.kind == 'ObjectId')    return res.status(400).json({msg:' Profile not found'})

        res.status(500).send('server error')
    }
 
 })

 // @route    DELETE api/profile
// @desc      DELETE profile, user and posts
// @access    PRIVATE
router.delete('/',auth, async (req,res)=>{
    try {
        //remove user posts
        await Post.deleteMany({user:req.user.id})

        // remove profile
        await Profile.findOneAndRemove( {user:req.user.id } )
        
        // remove user
        await User.findOneAndRemove( { _id:req.user.id } )

        res.json({ msg:'user deleted'})   
 
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error')
    }
 
 })


// @route     Put api/profile/experience
// @desc      Add profile experience
// @access    PRIVATE
router.put('/experience',[auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {title, company, location, from, to,  current, description}=req.body

    const newExp ={
        title, company, location, from, to,  current, description
    }

    try {
        const profile = await Profile.findOne( {user:req.user.id } )

        profile.experience.unshift(newExp)

        await profile.save()

        res.json(profile)
        
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error')       
    }
})


// @route     delete api/profile/experience/:exp_id
// @desc      delete experience from profile
// @access    PRIVATE
router.delete('/experience/:exp_id',auth, async (req,res)=>{
    try {
        const profile = await Profile.findOne( {user:req.user.id } )

        // get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex,1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error') 
    }
})


// @route     Put api/profile/education
// @desc      Add profile education
// @access    PRIVATE
router.put('/education',[auth, [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {school,degree,fieldofstudy, from, to,  current,description}=req.body

    const newEdu ={
        school,degree,fieldofstudy, from, to,  current, description
    }

    try {
        const profile = await Profile.findOne( {user:req.user.id } )

        profile.education.unshift(newEdu)

        await profile.save()

        res.json(profile)
        
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error')       
    }
})


// @route     delete api/profile/education/:edu_id
// @desc      delete education from profile
// @access    PRIVATE
router.delete('/education/:edu_id',auth, async (req,res)=>{
    try {
        const profile = await Profile.findOne( {user:req.user.id } )

        // get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex,1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error') 
    }
})

// @route     GET api/profile/github/:username
// @desc      get user repos from github
// @access    public
router.get('/github/:username', (req,res) => {
    try {
        const options = {
            uri : `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=
            ${config.get('githubSecret')}` ,
            method : "GET",
            headers : {'user-agent' : ''}
        }

        request (options, (error,response,body) => {
            if(error)  console.error(error)

            if(response.statusCode !== 200){
                return res.status(404).json({msg:'no github profile found'})
            }

            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.log(err.message)
        res.status(500).send('server error')
    }
})


module.exports=router