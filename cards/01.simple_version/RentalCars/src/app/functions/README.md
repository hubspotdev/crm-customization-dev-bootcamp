## Using NPM dependencies

To add your own dependencies, you can list the package in dependencies within the package.json file. When the app is built, dependencies will be bundled with your function code. All dependencies must be published to NPM and be public.
For example, if you wanted to add the `lodash` library in a serverless function, you could add lodash in the `package.json`'s dependencies and then in the serverless function `require` the package.

In 2026.09 projects, all functions share the one `package.json` in `src/app/functions/`. Install packages from that folder (`npm install lodash`).

```
{
  "name": "demo.functions",
  "version": "1.0.0",
  "description": "",
  "dependencies": {
    "axios": "^1.20.0",
    "lodash": "^4.18.1"
  }
}
```
