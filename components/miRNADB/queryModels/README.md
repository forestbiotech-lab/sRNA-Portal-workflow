## Getting table data with a simpler database model
This requires two dependencies the **structure** and the **controller**. Structure reflects the same filosophy of call structure explained in ../structures  


   You specify the **sourceTable** the table from which the query is built.
   Then you provide the graph of connected tables **tableConnections** this is a simple json structure, table names _must_ be capitalized. The hierachy of **tableConnections** reflects the database structure. Lttributes like **where** can be placed anywhere in the structure, to reflect the table to which th "where" clause belongs to.

``` javascript 
	
var tableConnections={
	Table1:{}
	Table2:{Table3:{}}
	Table4:{
		Table5:{},Table6:{
			Table:7:{}
		}
	}
}

```
