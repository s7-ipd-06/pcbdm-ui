/**
 * Hole sorter
 * Input: list of holes:
 * Output: list of holes
 */
const { spawn } = require('child_process');
const EventEmitter = require('events').EventEmitter

var algorithms = [
  {command: {cmd: 'node', args: ['./src/lib/hole-sorters/original.js']}, name: 'Original', totalDistance: null, selected: false, holes: []},
  {command: {cmd: 'node', args: ['./src/lib/hole-sorters/x-sorted.js']}, name: 'X sorted', totalDistance: null, selected: false, holes: []},
  {command: {cmd: 'node', args: ['./src/lib/hole-sorters/y-sorted.js']}, name: 'Y sorted', totalDistance: null, selected: false, holes: []},
  {command: {cmd: 'node', args: ['./src/lib/hole-sorters/diagonal-sorted.js']}, name: 'Diagonal sorted', totalDistance: null, selected: false, holes: []},
  //{executable: 'node src/lib/pathgenerators/a1.js', name: 'Algorithm 1', totalDistance: null, selected: false, holeOrder: []},
]

class HoleSorter extends EventEmitter {
  constructor(holes) {
    super()

    // Sort holes by diameter d
    holes.sort((a, b) => a.d - b.d)
    
    // Group by diameter
    var holesByDiameter = holes.reduce((initial, hole) => {
      if(!initial.find((hs) => hs.d == hole.d)) initial.push({
        d: hole.d,
        holes: []
      })
      initial[initial.length-1].holes.push(hole)
      return initial
    }, [])

    var sortedGroups = [];
    holesByDiameter.forEach((g) => {
      this._sortGroup(g.holes)
      .then((sortedHoles) => {
        sortedGroups.push({ holes: sortedHoles })

        if(sortedGroups.length == holesByDiameter.length) {
          sortedHoles = sortedGroups.reduce((sh, sg) => [...sh, ...sg.holes], []);

          this.emit('sorted', sortedHoles)
        }
      })
      .catch((e) => {throw e})
    })
  }

  _sortGroup(holes) {
    return new Promise((resolve, reject) => {
      const results = [];
      algorithms.forEach((algo) => {
        const child = spawn(algo.command.cmd, algo.command.args);
        
        child.stdin.write(JSON.stringify(holes))
        child.stdin.write(Buffer.from([0x0A, 0x0D])) // New line
        child.stdin.end()

        child.on('error', (e) => {
          console.log('error')
          console.error(e)
        })

        child.on('exit', (e) => {
          //console.log('exit', e)
        })

        child.on('close', () => {
          //console.log('Closed ' + algo.name)
        })

        var dataBuffer = '';
        child.stdout.on('data', (buff) => {
          let sortedHoles;
          try {
            sortedHoles = JSON.parse(dataBuffer + buff.toString())
          } catch(e) {
            dataBuffer += buff.toString();
            return;
          }
          dataBuffer = '';

          // Calculate path distance
          let previousHole = null
          let totalDistance = 0
          sortedHoles.forEach((h) => {
            if(previousHole) {
              if(previousHole.d == h.d) {
                const distance = Math.sqrt(Math.pow(Math.abs(h.x-previousHole.x), 2) + Math.pow(Math.abs(h.y-previousHole.y), 2))
                totalDistance += distance
              }
            }
            previousHole = h;
          })

          var result = {
            holes: sortedHoles,
            totalDistance: Math.round(totalDistance)
          }
          
          results.push(result)

          if(results.length == algorithms.length) {
            results.sort((a, b) => {
              return a.totalDistance - b.totalDistance
            })

            resolve(results[0].holes)
          }
        })
      })
    })
  }
}

export default HoleSorter
