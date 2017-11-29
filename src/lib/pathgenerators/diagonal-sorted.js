let inputBuffer = Buffer([]);

process.stdin.on('data', (buff) => {
	inputBuffer = Buffer.concat([inputBuffer, buff])

	const newLineIndex = inputBuffer.indexOf(0x0A)
	if(newLineIndex != -1) {
		inputBuffer = inputBuffer.slice(0, newLineIndex)
		generate(inputBuffer.toString())
	}
})

function generate(json) {
	let holes = JSON.parse(json)

	const angle = 0.2 * Math.PI

	holes = holes.map((hole) => rotate(hole, angle))

	// Sort by X
	holes.sort((a, b) => {
		return a.x - b.x
	})

	process.stdout.write(JSON.stringify(holes))
}

function rotate(point, rotation) {
  const radians = (Math.PI / 180) * rotation
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * point.x + sin * point.y
  const ny = cos * point.y - sin * point.x
  point.x = nx
  point.y = ny
  return point
}