const pkg = require('yahoo-finance2');
console.log("Keys:", Object.keys(pkg));
if (pkg.default) {
    console.log("Default Keys:", Object.keys(pkg.default));
    console.log("Type of Default:", typeof pkg.default);
    if (pkg.default.prototype) console.log("Default has prototype");
}
