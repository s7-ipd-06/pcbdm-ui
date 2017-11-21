/**
 * Hole extractor
 * Input: path to file
 * Output:  array of holes
 */
const xml2js = require('xml2js')
const parseXML = xml2js.parseString
const fs = require('fs')
const Path = require('path')

function F(n) {
  const decimals = 3
  const tenfold = Math.pow(10, decimals)
  const result = Math.round(parseFloat(n) * tenfold)/tenfold
  return result
}

export default function(fileString) {
  return new Promise((resolve, reject) => {
    parseXML(fileString, (err, result) => {
      const drawing = result.eagle.drawing[0];  
      const board = drawing.board[0];

      const libraries = board.libraries[0].library;
      const byName = (arr, name) => arr.filter((el) => el.$.name == name)[0]

      let holes = []

      // Loop through components
      board.elements[0].element.forEach((element) => {
        const libraryName = element.$.library;
        const packageName = element.$.package;

        const lib = byName(libraries, libraryName)
        const pkgs = lib.packages[0].package
        const pkg = byName(pkgs, packageName);
        
        let rotation = element.$.rot || 'R0';
            rotation = parseFloat(rotation.substr(1))
        
        const boardX = F(element.$.x)
        const boardY = F(element.$.y)

        let packageHoles = extractPackageHoles(pkg)

        // Rotate package holes
        packageHoles = packageHoles.map((hole) => {
          const radians = (Math.PI / 180) * rotation
          const cos = Math.cos(radians)
          const sin = Math.sin(radians)
          const nx = cos * hole.x + sin * hole.y
          const ny = cos * hole.y - sin * hole.x
          hole.x = nx
          hole.y = ny
          return hole
        })

        // Translate
        .map((hole) => {
          hole.x = F(hole.x + boardX)
          hole.y = F(hole.y + boardY)
          return hole
        })

        holes = [...holes, ...packageHoles]
      })

      resolve(holes)
    })
  })
}

function extractPackageHoles(pkg) {
  let holes = []
  
  if(typeof pkg.pad != 'undefined') {
    pkg.pad.forEach((pad) => {
      // Don't add pads
      /*switch(pad.$.shape) {
        case 'octagon':
        case 'long':
          holes.push({x: pad.$.x, y: pad.$.y, d: F(pad.$.drill)})
          break;
        default:
          holes.push({x: pad.$.x, y: pad.$.y, d: F(pad.$.diameter)})
          break;
      }*/

      // Hole
      if(typeof pad.$.drill !== 'undefined') {
        holes.push({x: pad.$.x, y: pad.$.y, d: F(pad.$.drill)})
      }
    })
  }

  return holes
}

/*
parseXML(xmlString, (err, result) => {
      const drawing = result.eagle.drawing[0];
      const board = drawing.board[0];

      let svg = [
        {
          _attr: {
            xmlns: 'http://www.w3.org/2000/svg',
            preserveAspectRatio: 'none',
            height: options.height,
            width: options.width
          }
        }
      ];

      const libraries = board.libraries[0].library;
      const byName = (arr, name) => arr.filter((el) => el.$.name == name)[0]

      let holes = []

      let maxCoordinate = {x: 0, y: 0};

      // Loop through components
      board.elements[0].element.forEach((element) => {
        const libraryName = element.$.library;
        const packageName = element.$.package;

        const lib = byName(libraries, libraryName)
        const pkgs = lib.packages[0].package
        const pkg = byName(pkgs, packageName);
        
        let rotation = element.$.rot || 'R0';
            rotation = parseFloat(rotation.substr(1))
        
        const parsedPackage = parsePackage(parseFloat(element.$.x), parseFloat(element.$.y), rotation, pkg)
        
        svg.push(parsedPackage.svg)

        /*svg.push({
          line: [
            {
              _attr: {
                x1: scale(element.$.x),
                y1: scale(element.$.y),
                x2: scale(element.$.x)+parsedPackage.maxCoordinate.x*rcos-parsedPackage.maxCoordinate.y*rsin,
                y2: scale(element.$.y)+parsedPackage.maxCoordinate.y*rcos+parsedPackage.maxCoordinate.x*rsin,
                style: 'stroke-width: 1;stroke:lime'
              }
            }
          ]
        });

        maxCoordinate.x = Math.max(maxCoordinate.x, scale(parseFloat(element.$.x))+parsedPackage.maxCoordinate.x)
        maxCoordinate.y = Math.max(maxCoordinate.y, scale(parseFloat(element.$.y))+parsedPackage.maxCoordinate.y)
        
        holes = [...holes, ...parsedPackage.holes]
      })

      //svg[0]._attr.width = Math.ceil(maxCoordinate.x);
      //svg[0]._attr.height = Math.ceil(maxCoordinate.y);
      //svg[0]._attr.transform = 'translate(0, ' + Math.ceil(maxCoordinate.y) + ') scale(1, -1)'
      svg[0]._attr.transform = 'translate(0, ' + options.height + ') scale(1, -1)'
      svg[0]._attr.viewBox = '0 0 ' + Math.ceil(maxCoordinate.x) + ' ' + Math.ceil(maxCoordinate.y);;

      // Create SVG XML
      const xml = XML([
        {
          svg: svg
        }
      ], { declaration: true, indent: '\t' });

      resolve(xml)
    });
  })*/