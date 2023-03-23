Rules for defining views
========================
Access to management table must allways be protected.

User roles are determined in the triple [User]<--[User_has_person]-->[Person] a many to many relationship that connected a user with a person. 
However, after further look the users canot accumulate roles. This suggests that the User_has_person table is unnecessary. 

Studies can only be accessed by anonymous users when they are public. Studies that aren't public, can be accessed by any user with an admin or curator scope. 
Non public studies can also be accessed by any person with a creator, curator or editor scope. The creator scope is added to the tuple person,study of the person that created the study.

A Person have manage multiple Studies with a varity of diferent scopes. 

Limits for scopes: The creator can update data. But can't dele studies. 


Sequences that are from Studies that aren't public can't output metadata. 

