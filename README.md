<h1>  
  <span href="https://github.com/albertsmit/visnet">
    <img src=".github/static/logo.png" alt="Logo" height="30"> 
    sitecite
  </span>
</h1>
<sup><i>Check if your cited sources are still up. :rocket:</i></sup>

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: albertsmit/sitecite@v1
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  urlfield: "link"
  textfield: "quote"
  path: "./data/quotes.json"
```

## Special thanks

Credit where credit is due!
Thanks for some functions :heart:

- [Firebase Deploy Action](https://github.com/FirebaseExtended/action-hosting-deploy)
- [JS Action Template](https://github.com/actions/javascript-action)
