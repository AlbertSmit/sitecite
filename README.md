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
  failOnNotFound: true
```

## JSON

The expected JSON format is as follows.
Sitecite takes the data from these keys:

- URL key from your `urlfield` input.
- Quote key from your `textfield` key.

### Example:

```json
{
  "quotes": [
    {
      "link": "https://policies.google.com/terms?hl=en",
      "quote": "respect the rights of others"
    },
    {
      "link": "https://www.apple.com/legal/internet-services/itunes/us/terms.html",
      "quote": "Please carefully read the information presented"
    }
  ]
}
```

## Special thanks

Credit where credit is due!
Thanks for some functions :heart:

- [Firebase Deploy Action](https://github.com/FirebaseExtended/action-hosting-deploy)
- [JS Action Template](https://github.com/actions/javascript-action)
