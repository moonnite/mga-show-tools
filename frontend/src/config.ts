var devMode = process.env.NODE_ENV === "development";

var backend_dev = "http://" + window.location.host.split(":")[0] + ":8080";
var backend_prod = "/";

var backend = devMode ? backend_dev : backend_prod;

export { backend };
