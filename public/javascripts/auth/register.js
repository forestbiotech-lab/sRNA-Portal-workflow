$(document).ready(function(){
  $('#inputPassword').password({ //https://www.npmjs.com/package/password-strength-meter
    enterPass: 'Type your password',
    shortPass: 'The password is too short',
    containsField: 'The password contains your username',
    steps: {
      // Easily change the steps' expected score here
      13: 'Really insecure password',
      33: 'Weak; try combining letters & numbers',
      67: 'Medium; try using special characters',
      94: 'Strong password',
    },
    showPercent: true,
    showText: true, // shows the text tips
    animate: true, // whether or not to animate the progress bar on input blur/focus
    animateSpeed: 'fast', // the above animation speed
    field: false, // select the match field (selector or jQuery instance) for better password checks
    fieldPartialMatch: true, // whether to check for partials in field
    minimumLength: 4, // minimum password length (below this threshold, the score is 0)
    useColorBarImage: true, // use the (old) colorbar image
    customColorBarRGB: {
      red: [0, 240],
      green: [0, 240],
      blue: 10,
    } // set custom rgb color ranges for colorbar.
  });

  //Todo
  //check of both passwords are identical

  //validate orcid 
  //https://github.com/altmetric/identifiers-orcid

  //TODO
  //all filled?

})