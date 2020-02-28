


## Collapse button that generates a form element
Any <button> with the class "generate-table-form" that is clicked, will fill the adjacent (next) "form-tablename" class element, with the form.
``` pug
  
  button.generate-table-form(table="tablename")
  .anything
    .form-[tablename]

```

## Collapse button that generates a select form element

Any <button> with the class "generate-select-form" that is clicked, will fill the adjacent (next) "select-tablename" class element, with the attributes "id - displayAttr" select options. 

displayAttr is the attribute in the button element

``` pug
  
  button.generate-select-form(table="tablename",displayAttr="tableattributes")
  .anything
    .form-[tablename]

```

