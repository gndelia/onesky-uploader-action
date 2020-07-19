# OneSky File uploader

This GitHub action allows you to upload a resource file to [OneSky](https://www.oneskyapp.com/) for its translation. you can execute this action whenever your resource file change, or periodically.

## Inputs

### `projectId`

**Required** Id from the project to which upload the resource file. It's the number listed after a `#` in the project list from your dashboard.

### `publicKey`

**Required** The public key from your OneSky account. [Find out how to retrieve your OneSky API key](https://support.oneskyapp.com/hc/en-us/articles/206887797-How-to-find-your-API-keys-)

### `privateKey`

**Required** The private key from your OneSky account. [Find out how to retrieve your OneSky API key](https://support.oneskyapp.com/hc/en-us/articles/206887797-How-to-find-your-API-keys-)

### `filepath`

**Required** The path to the folder where your translation file is. Starts from the root folder of your project. Do not include the filename.

### `filename`

**Required** The translation filename (extension included). This will be combined with the `filepath` to retrieve the file

### `locale`

**Required** Locale code for your resource file. It should match the list provided by OneSky. If not provided, it will default to the base language.

### `fileFormat`

The input format from your translation file. [Check out the list of available file formats here](https://github.com/onesky/api-documentation-platform/blob/master/reference/format.md). Defaults to `IOS_STRINGS`

### `isKeepingAllStrings`

If true, it will keep those strings that cannot be found in the uploaded file and existed before. If false, they will be deprecated. Defaults to `true`

## Outputs

None

## Example usage

Previously checkout your repository with

```yml
- name: Checkout
  uses: actions/checkout@v2

- name: Use Node.js 12.x
  uses: actions/setup-node@v1
  with:
    node-version: '12.x'
    registry-url: 'https://npm.pkg.github.com'
```

Then use this action with the following example 

```yml
- name: real upload
  uses: gndelia/onesky-app-file-uploader-github-action@v0.0.1
  with:
    projectId: ${{ secrets.ONESKY_PROJECT_ID }} # projectId from OneSky stored in GH secrets
    publicKey: ${{ secrets.ONESKY_PUBLIC_KEY }} # publicKey from OneSky stored in GH secrets
    privateKey: ${{ secrets.ONESKY_PRIVATE_KEY }} # privateKey from OneSky stored in GH secrets
    filepath: path/to/folder/where/the/file/is # Do not include the filename here
    filename: my-file.json # filename
    locale: en-US
    fileformat: HIERARCHICAL_JSON
    isKeepingAllStrings: false
```