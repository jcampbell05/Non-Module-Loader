# Non-Module-Loader
A webpack loader for non-module ECMAscript.

This will allow you to use code written like this:

```
function callMe() {
}
```

Like this:

```
import { callMe } from 'non-module-loader!library'

callMe()
```
