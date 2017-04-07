# Week 12

## Class Outline

- GeoJSON and SQL through CartoDB
  - REMINDER: Always:clap:use:clap:the:clap:SQL:clap:console:clap:
  - Using CartoDB SQL within applications
  - You can use a REST client like
    [Postman](https://www.getpostman.com/) or [Advanced REST
Client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo?hl=en-US)

- SQL Input/Output
  - Adding geometries to your SQL queries
  - Results as GeoJSON
  - Results as JSON
  - [Others](https://carto.com/docs/carto-engine/sql-api/making-calls#response-formats)

- [SQL Performance](https://carto.com/docs/carto-engine/sql-api/query-optimizations)
  - Use the `cartodb_id` (if you know it)
```SQL
SELECT
  *
FROM
  <TABLE>
WHERE
  cartodb_id = <some_id>
```
  - Ask for only the columns you need
  - [Indices](http://revenant.ca/www/postgis/workshop/indexing.html)
  - [Geometry simplification](http://www.postgis.org/docs/ST_Simplify.html)

- Rasters
  - Tiling for TMS
  - PostGIS analysis (this is painful)
  - Alternatives


