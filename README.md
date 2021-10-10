<img src="http://geoblaze.io/assets/img/logo.svg">

[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/codeclimate/codeclimate/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/test_coverage)](https://codeclimate.com/github/codeclimate/codeclimate/test_coverage)

# GeoBlaze

***A blazing fast javascript raster processing engine***

---

GeoBlaze is a geospatial raster processing engine written purely in javascript. Powered by [geotiffjs](https://github.com/geotiffjs/geotiff.js), it provides tools to analyze [GeoTIFFs](https://en.wikipedia.org/wiki/GeoTIFF). Using geoblaze, you can run computations ranging from basic statistics (min, max, mean, mode) to band arithmetic and histogram generation in either a web browser or a node application.

Learn more by [reading our documentation](https://geoblaze.io)

## Getting Started

1. Add GeoBlaze to your project
```
  npm install geoblaze
```

2. Load a GeoTIFF and run a calculation

```javascript
import geoblaze from 'geoblaze';

const url = 'http://url-to-geotiff';

async function getMean () {
  const georaster = await geoblaze.parse(url);
  const mean = await geoblaze.mean(georaster);
  return mean;
}
```

This is a contrived example, but using geoblaze is really this simple!

## Contributing

We would love to have your support improving geoblaze. Here are some ways to contribute:

### Issues
If you find a :bug:, please report it as an issue! To avoid overwhelming our developers, please first scan the list of bugs to make sure it hasn't already been reported. Make sure to add steps to reproduce, so we can quickly find and fix the problem.

We are also accepting feature requests! Our goal is to make geoblaze as useful to the community as possible. Towards that goal, we would love suggestions for additional features to improve the tool.

Please tag issues with the appropriate label.

### Pull Requests
We are always accepting new PRs. To get started, see the developer's guide below

We squash and rebase all PRs. Please squash all of your commits into one and rebase off `dev`.

**Submitting a PR**

1. Make sure the branch is rebased and passing tests.

2. Answer all of the questions in the PR template.

3. Add the "needs review" label to your PR.

4. Upon review, the label will be adjusted. If the label is switched to "needs development", this means there are comments that need to be addressed. After addressing the comments, move the label back to "needs review"

5. Once comments have been addressed, a reviewer will move the label to "can deploy". After a final check, the PR will be merged and deployed.

## Developer's Guide

### Setup
1. Fork the repository

2. Clone your fork
```
  git clone git@github.com:[your-username]/geoblaze.git
```

3. Install dependencies
```
  cd geoblaze
  npm install
```

### Linting
GeoBlaze uses [eslint](https://eslint.org/) for linting. We suggest using an eslint plugin for your text editor. Here are some common options:

  - For Sublime: [SublimeLinter-eslint](https://github.com/SublimeLinter/SublimeLinter-eslint)
  - For Atom: [linter-eslint](https://atom.io/packages/linter-eslint)

Our style guide extends the `eslint:recommended` set of standards and is therefore relatively minimal. As the project expands in scope and number of contributors, we will start to consider more linting rules. Please feel free to suggest some in a PR!

To test for linting errors:
```
  npm run lint
```

### Testing
GeoBlaze uses [flug](https://github.com/DanielJDufour/flug) as its testing framework.

To run tests:

1. Run the setup script. This script will download all of the necessary test data from s3.
```
  npm run setup
```

2. Run tests.  Each test file will automatically spin up a server using [srvd](https://github.com/danieljdufour/srvd).
```
  npm run test
```

# Used By
<a href="https://geotiff.io"><img src="https://github.com/GeoTIFF/geotiff.io/raw/master/assets/favicon.png" height="75px"></a>
