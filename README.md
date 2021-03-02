<h1 align="center">  
  <span href="https://github.com/albertsmit/visnet">
    <img src=".images/logo.png" alt="Logo" height="30"> 
    Sitecite
  </span>
</h1>

## Sitecite

Check if your cited sources are still up.

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: albertsmit/sitecite@v1
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  urlfield: 'link'
  textfield: 'quote'
  path: './data/quotes.json'
```
