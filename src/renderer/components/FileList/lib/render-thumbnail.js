const fs = require('fs')
const isXML = require('is-xml')
const Path = require('path')

// Renderers
const eagle2svg = require('eagle2svg')

/**
 * Renders a thumbnail for a file
 * @param   path  (string)  Path to file
 * @return        (string)  Image file contents buffer
 */
module.exports = (path, callback) => {
  // Get extension for future use
  const pathInfo = Path.parse(path)

  // Check file  type
  const fileBuffer = fs.readFileSync(path)
  const fileString = fileBuffer.toString()

  // Check if XML
  if(isXML(fileString)) {
    // Check if Eagle .brd file
    if(pathInfo.ext == '.brd') {
      eagle2svg(fileString)
      .then((bfr) => {
        callback(bfr, 'svg')
      })
      .catch((err) => {
        console.error(err)
        throw err
      })
    }
  }
}
