## How the table is structured

* grouping object - There is a grouping object that tell describes the grouping attribute

* attribute object - There is a attribute object where additional metadata is placed in different sections. This can include lists.

* header object - Header for the grouped attributes. In this example their are several attributes that belong to the same grouping attribute. Raw expression for each assay is different but it should be placed in grouping attribute row. Entity Assay + Attribute raw for each grouping attribute sequence.

* grouping_attributes object - Describes the attributes the that are being grouped into the grouping attribute.

* metadata object - This is general metadata that is added to the row and cell attributes of the table DOM.



#### This doesn't allow a cell (column) based attribute metadata only row metadata or the same metadata to all cells.



