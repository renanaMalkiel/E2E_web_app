const express = require('express');
const router = express.Router(); 

//User model
const User = require('../models/User');

//mailgun api
const mailgun = require('mailgun-js');
const DOMAIN = "sandbox657004c989114fa1871011d702a1c08b.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

const jwt = require('jsonwebtoken');

router.get('/dashboard', (request, response) => {
	response.render('dashboard');
})

router.post('/viewRequests', (request, response) => {
	const { email } = request.query; 
	const { osRequest } = request.body;
	User.findOne({ email: email }).then(user => {
        user.osURL.push(osRequest);
        saveInDB(user, response);
    });
})

router.get('/authentication', (request, response) => {
	const { token } = request.query;
	if(token) {
		jwt.verify(token, process.env.JWT_ACC_ACTIVATE, function(err, decodedToken) {
			if(err) {
				return response.status(400).json({ error : 'Incorrect or expired link' })
			}
			const { email, osURL } = decodedToken;
			User.findOne({ email: email }).then(user => {
			  //Existing User 
		      if (user) {
		        user.osURL.push(osURL);
		        saveInDB(user, response);
		      } else {
		        const newUser = new User({
		          email,
		          osURL
		    	});
		    	saveInDB(newUser, response);
			  }
			});
		})
	} else {
		return response.json({ error : 'something went wrong' });
	}
})

function saveInDB(user, response) {
  user.save()
      .then(user => {
      	const { osURL } = user; 
      	response.render('dashboard', {
	      user
	    });
      	//response.json({ message : 'activation success' });
      	
        //response.redirect('dashboard');
      })
      .catch(err => console.log(err));
  // user.save((arr, success) => {
  // 	if(err) {
  // 		console.log("error while account activation");
  // 		return response.status(400).json({ error : 'Error activating account' })
  // 	}
  // 	response.json({ message : 'activation success' });
  // })
}

function approveEmail(email, osURL, response) {
	const token = jwt.sign({email, osURL}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '30m'});

	const data = {
		from: "noreply@gmail.com",
		to: email,
		subject: "Request Approvement Link",
		html: `
			<h2>Please click on the given link to approve your request</h2>
			<p>${process.env.CLIENT_URL}/users/authentication?token=${token}</p>
		`
	};
	mg.messages().send(data, function (error, body) {
		if(error) {
			return response.json({
				error: error.message
			})
		}
		return response.json({message: 'Email has been sent, kindly approve your request'});
	});
}

//open-source routing request handle
router.post('/AddOpenSource', (request, response) => {
	console.log(request.body)
	const { email, osURL } = request.body;
	let errors = [];

	if (!email || !osURL) {
    	errors.push({ msg: 'Please enter all fields' });
  	}

    if (!email.includes("@")) {
    	errors.push({ msg: 'Invalid email' });
  	}

  	if (errors.length > 0) {
	    response.render('AddOpenSource', {
	      errors,
	      email,
	      osURL
	    });
	} else {
		approveEmail(email, osURL, response);
	}	
});




module.exports = router;