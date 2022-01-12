const { hasOwnProperty } = require("./helper");

let fileName = "./Cargo_Flo_Logistics.postman_collection.json";
// fileName = "./mantis_api_postman.json";
const postmanData = require(fileName);

let paths = [];
let c = 0;
let operationIds = [];
const swagger = {
  paths: {},
};

const camelCase = (str) => str.replace(/(^|\s)\S/g, (t) => t.toUpperCase());

postmanData.item.forEach((i) => {
  console.log(i.name, i.item.length);
  c += i.item.length;

  // * Merge all item of item in one array
  i.item.forEach((i1) => {
    delete i1.event;
    paths.push(i1);
  });
});

setPaths(paths);

function setPaths(paths) {
  paths.forEach((path) => {
    // TODO: Check if inner folder (item)
    if (hasOwnProperty(path, "item")) {
      setPaths(path.item);
    } else {
      const method = path.request.method.toLowerCase();

      if (!hasOwnProperty(path.request.url, "path")) return;

      const url = path.request.url.path
        .map((p) => {
          if (String(p).startsWith(":")) {
            p = p.replace(/_/g, " ").split(" ");
            p =
              p[0] +
              p
                .slice(1)
                .map((p1) => camelCase(p1))
                .join("");
            p = `{${p.replace(/:/g, "")}}`;
          }
          return p;
        })
        .join("/");

      console.log(url, method);

      if (hasOwnProperty(swagger.paths, url)) {
        if (hasOwnProperty(swagger.paths.url, method)) {
          // * Request body
          swagger.paths[url][method]["request"]["body"] = {
            raw: {
              ...JSON.parse(swagger.paths[url][method]["request"]["body"]["raw"]),
              ...JSON.parse(path.request.body.raw),
            },
          };

          // * Request variables(params, query params)
          swagger.paths[url][method]["request"]["url"]["variable"] = {
            ...swagger.paths[url][method]["request"]["url"]["variable"],
            ...path.request.url.variable,
          };

          // * Request headers
          path.request.headers.forEach((header) => {
            swagger.paths[url][method]["request"]["headers"].push(header);
          });

          // * Responses
          path.response.forEach((r) => {
            swagger.paths[url][method]["response"].push(r);
          });

          path.response.forEach((r) => {
            r = JSON.parse(r);
            r.body = JSON.parse(r.body);
            r.body.raw = JSON.parse(r.body.raw);
          });
        } else {
          // method not same
          swagger.paths[url][method] = { ...path };
        }
      } else {
        // url not same
        swagger.paths[url] = { [method]: { ...path } };
      }
    }
  });
}

console.log(paths.length, c);
console.log("swagger", swagger);

// Object.keys(swagger.paths).forEach((path) => {
//   console.log(path, Object.keys(swagger.paths[path]).join(","));
// });

// Object.keys(swagger.paths).forEach((path) => {
//   Object.keys(swagger.paths[path]).forEach((method) => {
//     if (hasOwnProperty(swagger.paths[path][method].request.body, "raw"))
//       console.log(path, method, JSON.parse(swagger.paths[path][method].request.body.raw));
//   });
// });

const fs = require("fs");
fs.writeFileSync("openAPI.json", JSON.stringify(swagger));
