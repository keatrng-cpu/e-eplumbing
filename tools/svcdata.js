// Prints pricebook + app.js picker copy as JSON for tools/build_pages.py.
const fs=require("fs"),pb=require("../pricebook.js"),src=fs.readFileSync(__dirname+"/../app.js","utf8");
function obj(name){const i=src.indexOf("var "+name+" = {");const j=src.indexOf("\n  };",i);return Function("return "+src.slice(src.indexOf("{",i),j+4))();}
console.log(JSON.stringify({services:pb.SERVICES,diag:pb.DIAGNOSTIC_FEE,guide:obj("SERVICE_GUIDE"),scope:obj("SCOPE_GUIDE"),hint:obj("SCOPE_HINT")}));
