Rules for defining views
========================
Access to management table must allways be protected.

User roles are determined in the triple [User]<--[User_has_person]-->[Person] a many to many relationship that connected a user with a person. 
However, after further look the users canot accumulate roles. This suggests that the User_has_person table is unnecessary. 

Studies can only be accessed by anonymous users when they are public. Studies that aren't public, can be accessed by any user with an admin or curator scope. 
Non public studies can also be accessed by any person with a creator, curator or editor scope. The creator scope is added to the tuple person,study of the person that created the study.

A [Person] can manage multiple Studies with a varity of diferent scopes. 

Limits for scopes: The creator can update data. But can't dele studies. 


Sequences that are from Studies that aren't public can't output metadata. 

Additional managers
===================
Adding an additional "Person" to manage the study has not be implemented. But the implementation should be through an email lookup, if the email exists the Name will be shown and the Person can be added. This way limits the access to the person table by finding only exact results for a unique column in the table. 

### Suggestion 
Suggestion change the primary keys of [User] to "email" and the primary key of [Person] to "orcid"

Before uploading the data an [Organism] / [Sequence_assembly] should be chosen. For the miRNAs the [Sequence_assembly] is the Genome used to predict the miRNAs. 

Accesions for the miRNAs are based on the original database source if they are conserved.  While new one 
