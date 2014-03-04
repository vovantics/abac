# abac

ABAC (Attribute Based Access Control) is a node.js package for providing a [Connect](http://www.senchalabs.org/connect/)/[Express](http://expressjs.com/) middleware that can be used to enable [ABAC](http://en.wikipedia.org/wiki/Attribute_Based_Access_Control) with various options.

## Install (via [npm](https://npmjs.org/package/abac))

```bash
$ npm install abac
```

## Usage

### Configure policies

Access control logic is defined using policies.

```javascript
var express = require('express'),
    abac = require('abac');

abac.set_policy('in-memory', 'invite a friend', true);
abac.set_policy('in-memory', 'use secret feature', function(req) {
    if (req.user.role == 'employee') { return true; }
    return false;
});
```

### Authorize requests

Use `abac.can(backend, action, options)`, where `backend` is the name (i.e. `'in-memory'`) of the BackEnd used, `action` is the name of the action, and `options` are the optional parameters. If a policy is not defined, access control is denied by default.

##### Routes

If the request can perform the action (Permit), the `next()` callback is called. If the request cannot perform the action (Deny) or if the policy is undefined (Not Applicable), the middleware calls `res.send(405)` to return a HTTP 405 Method. If an error occurs (Indeterminate), the middleware signals an error by passing it as the first argument to `next`.

```javascript
var express = require('express'),
    abac = require('abac');

app.post('/users/invite/', abac.can('in-memory', 'invite a friend'), function(req, res, next){
    res.json({msg: 'You sent an invite b/c you could!'});
});
```

#### Control flow

Pass `yes()` and `no()` callback functions in the `options` parameter. `yes()` gets fired if the request can perform the action (Permit). `no()` gets fired if the request cannot perform the action (Deny) or if an error has occurred (Indeterminate) or if the policy is not defined (Not Applicable).

```javascript
var express = require('express'),
    abac = require('abac');

app.get('/', function(req, res, next){
    abac.can('in-memory', 'use secret feature', {
        yes: function() {
            // You're in!
        },
        no: function(err, info) {
            // Sorry!
        }
    })(req, res);
});
```

### Serialize policies into permissions

Use `abac.serialize(callback)` to serialize all policies into a permissions Javascript object. The `callback` function has 2 arguments: `(err, permissions)`.
In the permissions Javascript object, the key is a policy's action and the value is the policy's rules evaluated as a boolean.
This is useful for appling the same core logic to presentation and server-side access control decisions.

```javascript
function get('/session/', function(req, res, next) {
    abac.serialize(function(err, permissions) {
        if (err) { next(err); }
        else {
            res.send(200, permissions);
        }
    })(req, res);
});
```

## Tests

    $ npm install
    $ make test

## Credits

Thank you to [jaredhanson](https://github.com/jaredhanson)'s [passport](https://github.com/jaredhanson/passport) authentication middleware, which served as an excellent reference for designing a pluggable middleware interface.

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

## Author

[Stevo](https://github.com/vovantics) ([stephenvovan@gmail.com](mailto:stephenvovan@gmail.com))
