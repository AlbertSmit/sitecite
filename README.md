<h1>  
  <span href="https://github.com/albertsmit/visnet">
    <img src=".github/static/logo.png" alt="Logo" height="30"> 
    sitecite
  </span>
</h1>
<sup><i>Check if your cited sources are still up. :rocket:</i></sup>

## Have you ever...

Cited another persons website, and actually checked if the quote was still up there after a while?
Right. Neither have I.

I ran into a scenario where I did want to know about this;
and so this action was born.

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
