##  Recovery password flow
#### In *auth* route:
* `login`-->(post)`login/reset` --> Email with confirmationToken
* loads view: `confirmation_token`

## Change password
#### Authenticated User
* (get)`login/reset` requires authentication to load view: `reset_password`

#### Confirmation Token User (email)
* Manual entry of token send it to ==> (get)`login/reset/manual`
* (get)`login/reset/:email/:token`

Success with the token from one of these routes:
* loads view: `reset_password` 


