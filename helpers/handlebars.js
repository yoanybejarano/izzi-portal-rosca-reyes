var register = function (Handlebars) {
    var helpers = {
        ifeq: function (a, b, block) {
            return a == b ? block.fn() : block.inverse();
        },
        bigger: function (a, b, block) {
            return a >= b ? block.fn() : block.inverse();
        }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }

};

module.exports.register = register;
module.exports.helpers = register(null);