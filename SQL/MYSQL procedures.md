# SQL procedures to changes active databases

## Change to not null

``` sql
	ALTER TABLE MyTable 
    MODIFY COLUMN colname VARCHAR(254) DEFAULT NULL;
  ALTER TABLE MyTable MODIFY COLUMN colname VARCHAR(254) COLLATE utf8mb4_unicode_ci NOT NULL;
``` 

``` sql 
  ALTER TABLE MyTable
    ADD COLUMN colname VARCHAR(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL;
```


``` sql
ALTER TABLE Target
    AUTO_INCREMENT=1;
```

``` sql
-- Disable keys
SET FOREIGN_KEY_CHECKS=0;
SET FOREIGN_KEY_CHECKS=0;
```