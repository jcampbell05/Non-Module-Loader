/*
* This is a non modular javascript loader for webpack, a few javascript libraries for printers
* still use the old style of writing javascript which rely on global variables and functions/
*
* Like this:
* 
* var message = "Hello"
*
* function speak() {
*    alert(message);  
* }
*
* This loader wraps this in a way that allows it to be compatiable with modules in ES5 and 6
* but in addition enables the original code to be ran in the way it intended.
*
* The main downside to this loader is some optimizations cannot be applied due to the use
* of global vriables so its reccomended to use this only when needed and adopt modules.
*
* This loader works by using a regexp to scan each line for a globaal declaration
* we then wrap the original code in a function which allows us to bind any references
* to the `this` keyword to the `window` object, as would be expected in ES4 (In ES modules
* this is the module objext).
*
* We then inject some lines to export this variables to the `window` object and return them
* in a way that also allows them to be imported using the new module syntax.
*
* The resulting code will look like this.
*
* function NonModuleContainer() {
*    var message = "Hello"
*
*    function speak() {
*        alert(message);  
*    }
*    
*    this.message = message;
*    this.speak = speak;
*
*    return this
* }
*
* module.exports = NonModuleContainer.call(window)
*
* You can then just import it like this:
*
* import 'non-module-loader!speak.js'; 
* speak();
*
* And then just call the method globally like you would in ES4
* or you can import it using the new module syntax. Allowing your code
* to still work if and when that code is migrated to modules.
*
* import { speak } from 'non-module-loader!speak.js';
* speak()
*
*/
module.exports = function parentScopeLoader(source) {

    const GlobalRegExp = new RegExp(/^(?:var|const|function|let|class) ([a-zA-Z_0-9]+)/)
    
    var commentMode = false
    var lines = source.split('\n')
    var result = "function NonModuleContainer() { \n"
    
    result += source + "\n"

    lines.forEach(function (line) {

        if (line.match(/^\/\*\s*.+\*\/|^\/\/.+/)) {
            commentMode = false
            return
        }

        if (line.match(/^\s*\/\*+/)) {
            commentMode = true
        }

        if (line.match(/^\s*\*+\//)) {
            commentMode = false
        }

        if (commentMode === true) {
            return
        }


        var matches = line.match(GlobalRegExp)

        if (matches) {

            var name = matches[1]
            result += `this.${name} = ${name};\n`
        }
    })

    result += "return this\n"
    result += "}\n"
    result += "module.exports = NonModuleContainer.call(window)\n"
  
    return result
}