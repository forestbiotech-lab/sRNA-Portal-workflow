callback={
  onInitialise: function (status) {
    var type = this.options.type;
    var didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      // enable cookies
    }
    if (type == 'opt-out' && !didConsent) {
      // disable cookies
    }
  },
   
  onStatusChange: function(status, chosenBefore) {
    var type = this.options.type;
    var didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      // enable cookies
    }
    if (type == 'opt-out' && !didConsent) {
      // disable cookies
    }
  },
   
  onRevokeChoice: function() {
    var type = this.options.type;
    if (type == 'opt-in') {
      // disable cookies
    }
    if (type == 'opt-out') {
      // enable cookies
    }
  }
}

window.addEventListener("load", function(){
window.cookieconsent.initialise({
  "palette": {
    "popup": {
      "background": "#000"
    },
    "button": {
      "background": "transparent",
      "text": "#f1d600",
      "border": "#f1d600"
    }
  },
  "position": "top",
  "static": true,
  "type": "opt-in",
  "content": {
    "message": "This website uses cookie to improve the quality of our service. Please opt-in so that we can continue to increase the quality of our service.",
    "dismiss": "Not now!",
    "allow": "Allow cookies",
    "link": "Learn more"
  }
})});