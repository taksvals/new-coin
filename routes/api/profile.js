const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.user.id
      }).populate('user', ['name', 'email']);
  
      if (!profile) {
        return res.status(400).json({ msg: 'There is no profile for this user' });
      }
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', auth, 
    async (req, res) => {

    const { favorites } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (favorites) profileFields.favorites = favorites;
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  PUT api/profile/add/:value
// @desc   Add crypto
// @access Private
router.put('/add/:value', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        profile.favorites.unshift(req.params.value);
        await profile.save();

        res.json(profile.favorites);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route  PUT api/profile/remove/:value
// @desc   Remove crypto
// @access Private
router.put('/remove/:value', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        profile.favorites = profile.favorites.filter(crypto => crypto !== req.params.value);
        await profile.save();

        res.json(profile.favorites);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    DELETE api/profile
// @desc     Delete profile and user
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;