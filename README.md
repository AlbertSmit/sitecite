<h1>  
  <span href="https://github.com/albertsmit/sitecite">
    <img src=".github/static/left.png" alt="Logo" height="25"> 
    sitecite
    <img src=".github/static/right.png" alt="Logo" height="25"> 
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

## Inputs

| Input            | Type    | Required | Default           |
| ---------------- | ------- | -------- | ----------------- |
| `token`          | string  | `true`   | `null`            |
| `urlfield`       | string  | `true`   | `link`            |
| `textfield`      | string  | `true`   | `quote`           |
| `path`           | string  | `true`   | `./sitecite.json` |
| `failOnNotFound` | boolean | `false`  | `false`           |

## Outputs

| Output     | Type    | Description                                   |
| ---------- | ------- | --------------------------------------------- |
| `failures` | boolean | Wether any quote has been failed to be found  |
| `results`  | array   | The actual results as found in the PR comment |

## Expected JSON format

The expected JSON format is as follows.\
**Sitecite** looks for a `quotes` key in the root of the provided JSON.\
Then, from that **array**, it takes the data from these keys:

- **URL** key from your `urlfield` input/key.
- **Quote** key from your `textfield` input/key.

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

This means that if, for instance, your:

- `urlfield` is `tomato`, and
- your `textfield` is `textgoeshere`

**sitecite** will look for this:

```json
"quotes": [
  {
    "tomato": "https://www.url-goes-here.io",
    "textgoeshere": "Guess what goes here! Woohoo!"
  }
]
```

## Special thanks

Credit where credit is due!
Thanks for some functions :heart:

- [Firebase Deploy Action](https://github.com/FirebaseExtended/action-hosting-deploy)
- [JS Action Template](https://github.com/actions/javascript-action)
